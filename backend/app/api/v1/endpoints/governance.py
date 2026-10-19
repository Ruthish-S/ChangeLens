from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.models import (
    ChangeRequest,
    User,
    Approval,
    WorkflowEvent,
    QualityGateEvaluation,
    ConfigurationBaseline,
    VerificationRequirement,
    EvidenceRecord,
    ImpactResult
)
from backend.app.schemas.schemas import (
    ApprovalRequest,
    ApprovalResponse,
    TransitionRequest,
    WorkflowEventResponse,
    UserResponse
)
from backend.app.services.workflow_engine.engine import WorkflowEngine
from backend.app.services.gate_engine.engine import QualityGateEngine
from backend.app.services.audit_service.service import AuditService

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).filter(User.active == True).all()

@router.get("/{change_id}/audit", response_model=List[WorkflowEventResponse])
def get_audit_trail(change_id: str, db: Session = Depends(get_db)):
    return AuditService.get_events_for_change(db, change_id)

@router.post("/{change_id}/decisions", response_model=ApprovalResponse)
def submit_decision(change_id: str, payload: ApprovalRequest, db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    reviewer = db.query(User).filter(User.id == payload.reviewer_id).first()
    if not reviewer:
        raise HTTPException(status_code=400, detail="Invalid reviewer ID")

    # Enforce separation of duties & role checks (AC-05)
    valid, msg = WorkflowEngine.validate_approval(cr, reviewer, payload.decision)
    if not valid:
        raise HTTPException(status_code=403, detail=msg)

    approval = Approval(
        change_request_id=change_id,
        reviewer_id=reviewer.id,
        reviewer_role=reviewer.role,
        decision=payload.decision,
        rationale=payload.rationale
    )
    db.add(approval)
    db.commit()

    # Log audit event (AC-07)
    AuditService.log_event(
        db=db,
        change_request_id=change_id,
        actor=reviewer,
        action=f"SUBMIT_DECISION_{payload.decision}",
        previous_state=cr.state,
        new_state=cr.state,
        reason=payload.rationale
    )

    db.refresh(approval)
    return approval

@router.post("/{change_id}/transitions")
def transition_state(change_id: str, payload: TransitionRequest, db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    actor = db.query(User).filter(User.id == payload.actor_id).first()
    if not actor:
        raise HTTPException(status_code=400, detail="Invalid actor ID")

    # Evaluate quality gate if advancing to AUTHORIZED or CLOSED
    gate_eval = None
    if payload.target_state in ["AUTHORIZED", "CLOSED"]:
        baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == cr.baseline_id).first()
        reqs = db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == change_id).all()
        evs = db.query(EvidenceRecord).filter(EvidenceRecord.change_request_id == change_id).all()
        approvals = db.query(Approval).filter(Approval.change_request_id == change_id).all()
        impacts = db.query(ImpactResult).filter(ImpactResult.change_request_id == change_id).all()

        gate_name = "PRE_AUTHORIZATION_GATE" if payload.target_state == "AUTHORIZED" else "CLOSURE_GATE"
        gate_engine = QualityGateEngine()
        gate_eval = gate_engine.evaluate_gate(
            gate_name=gate_name,
            change_request=cr,
            baseline=baseline,
            requirements=reqs,
            evidence_records=evs,
            approvals=approvals,
            impact_results=impacts
        )

    valid, msg = WorkflowEngine.validate_transition(
        change_request=cr,
        actor=actor,
        target_state=payload.target_state,
        gate_evaluation=gate_eval
    )

    if not valid:
        raise HTTPException(status_code=400, detail=msg)

    prev_state = cr.state
    cr.state = payload.target_state
    db.commit()

    AuditService.log_event(
        db=db,
        change_request_id=change_id,
        actor=actor,
        action=f"TRANSITION_TO_{payload.target_state}",
        previous_state=prev_state,
        new_state=payload.target_state,
        reason=payload.reason
    )

    return {
        "status": "success",
        "change_id": change_id,
        "previous_state": prev_state,
        "new_state": payload.target_state,
        "message": f"Successfully transitioned to {payload.target_state}."
    }
