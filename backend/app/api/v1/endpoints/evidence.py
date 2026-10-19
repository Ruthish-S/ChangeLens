import hashlib
import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.models import (
    ChangeRequest,
    VerificationRequirement,
    EvidenceRecord,
    QualityGateEvaluation,
    ConfigurationBaseline,
    ImpactResult,
    Approval,
    User
)
from backend.app.schemas.schemas import (
    EvidenceRecordCreate,
    EvidenceRecordResponse,
    VerificationRequirementResponse,
    QualityGateEvaluationResponse
)
from backend.app.services.gate_engine.engine import QualityGateEngine
from backend.app.services.audit_service.service import AuditService

router = APIRouter()

@router.get("/{change_id}/requirements", response_model=List[VerificationRequirementResponse])
def get_requirements(change_id: str, db: Session = Depends(get_db)):
    return db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == change_id).all()

@router.get("/{change_id}/records", response_model=List[EvidenceRecordResponse])
def get_evidence_records(change_id: str, db: Session = Depends(get_db)):
    return db.query(EvidenceRecord).filter(EvidenceRecord.change_request_id == change_id).all()

@router.post("/{change_id}/records", response_model=EvidenceRecordResponse)
def upload_evidence(change_id: str, payload: EvidenceRecordCreate, actor_id: str = "usr-lead-eng", db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    req = db.query(VerificationRequirement).filter(
        VerificationRequirement.id == payload.requirement_id,
        VerificationRequirement.change_request_id == change_id
    ).first()
    if not req:
        raise HTTPException(status_code=400, detail="Requirement not found for this change request")

    # Generate synthetic SHA-256 hash if none provided
    content = payload.file_content_base64 or f"{payload.file_name}-{payload.source_reference}-{datetime.datetime.now()}"
    file_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()

    count = db.query(EvidenceRecord).count() + 1
    ev_id = f"EV-{change_id}-{count:03d}"

    ev = EvidenceRecord(
        id=ev_id,
        change_request_id=change_id,
        requirement_id=req.id,
        evidence_type=payload.evidence_type,
        source_reference=payload.source_reference,
        document_revision=payload.document_revision,
        file_name=payload.file_name,
        file_hash=file_hash,
        file_size_bytes=len(content.encode("utf-8")),
        verification_status="PENDING_REVIEW",
        notes=payload.notes or ""
    )
    db.add(ev)
    db.commit()

    actor = db.query(User).filter(User.id == actor_id).first()
    if actor:
        AuditService.log_event(
            db=db,
            change_request_id=cr.id,
            actor=actor,
            action="UPLOAD_EVIDENCE",
            previous_state=cr.state,
            new_state=cr.state,
            reason=f"Uploaded evidence '{payload.file_name}' for {req.requirement_code}."
        )

    db.refresh(ev)
    return ev

@router.post("/records/{evidence_id}/verify", response_model=EvidenceRecordResponse)
def verify_evidence(
    evidence_id: str,
    status: str,  # ACCEPTED, REJECTED
    reviewer_id: str = "usr-qa-mgr",
    notes: str = "",
    db: Session = Depends(get_db)
):
    ev = db.query(EvidenceRecord).filter(EvidenceRecord.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence record not found")

    reviewer = db.query(User).filter(User.id == reviewer_id).first()
    if not reviewer or reviewer.role not in ["ENGINEER_QA", "APPROVER"]:
        raise HTTPException(status_code=403, detail="Reviewer lacks QA/Engineering verification authority")

    if status not in ["ACCEPTED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be ACCEPTED or REJECTED")

    ev.verification_status = status
    ev.verified_by_id = reviewer.id
    ev.verified_at = datetime.datetime.now(datetime.timezone.utc)
    if notes:
        ev.notes = f"{ev.notes} | Review note: {notes}" if ev.notes else notes

    # Update requirement status if accepted
    if status == "ACCEPTED":
        req = db.query(VerificationRequirement).filter(VerificationRequirement.id == ev.requirement_id).first()
        if req:
            req.status = "ACCEPTED"

    db.commit()

    AuditService.log_event(
        db=db,
        change_request_id=ev.change_request_id,
        actor=reviewer,
        action=f"VERIFY_EVIDENCE_{status}",
        previous_state="PENDING_REVIEW",
        new_state=status,
        reason=f"Quality verification decision {status} for evidence {ev.id}. {notes}"
    )

    db.refresh(ev)
    return ev

@router.get("/{change_id}/gate-evaluation", response_model=QualityGateEvaluationResponse)
def evaluate_gate(change_id: str, gate_name: str = "PRE_AUTHORIZATION_GATE", db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == cr.baseline_id).first()
    reqs = db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == change_id).all()
    evs = db.query(EvidenceRecord).filter(EvidenceRecord.change_request_id == change_id).all()
    approvals = db.query(Approval).filter(Approval.change_request_id == change_id).all()
    impacts = db.query(ImpactResult).filter(ImpactResult.change_request_id == change_id).all()

    engine = QualityGateEngine()
    result = engine.evaluate_gate(
        gate_name=gate_name,
        change_request=cr,
        baseline=baseline,
        requirements=reqs,
        evidence_records=evs,
        approvals=approvals,
        impact_results=impacts
    )

    # Persist or update evaluation record
    eval_rec = db.query(QualityGateEvaluation).filter(
        QualityGateEvaluation.change_request_id == change_id,
        QualityGateEvaluation.gate_name == gate_name
    ).first()

    if not eval_rec:
        eval_rec = QualityGateEvaluation(
            change_request_id=change_id,
            gate_name=gate_name,
            overall_result=result["overall_result"],
            evaluated_at=result["evaluated_at"],
            evaluated_by_id="usr-qa-mgr",
            details_json=json.dumps(result["checks"]),
            blocking_reasons_json=json.dumps(result["blocking_reasons"]),
            corrective_actions_json=json.dumps(result["corrective_actions"])
        )
        db.add(eval_rec)
    else:
        eval_rec.overall_result = result["overall_result"]
        eval_rec.evaluated_at = result["evaluated_at"]
        eval_rec.details_json = json.dumps(result["checks"])
        eval_rec.blocking_reasons_json = json.dumps(result["blocking_reasons"])
        eval_rec.corrective_actions_json = json.dumps(result["corrective_actions"])

    db.commit()
    db.refresh(eval_rec)
    return eval_rec
