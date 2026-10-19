from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.models import ChangeRequest, RiskAssessment, VerificationRequirement, ImpactResult, User
from backend.app.schemas.schemas import RiskAssessmentCreate, RiskAssessmentResponse
from backend.app.services.risk_engine.engine import RiskAnalysisEngine
from backend.app.services.audit_service.service import AuditService

router = APIRouter()

@router.get("/{change_id}/risk-assessment", response_model=List[RiskAssessmentResponse])
def get_risk_assessments(change_id: str, db: Session = Depends(get_db)):
    return db.query(RiskAssessment).filter(RiskAssessment.change_request_id == change_id).all()

@router.post("/{change_id}/risk-assessment", response_model=RiskAssessmentResponse)
def add_risk_assessment(change_id: str, payload: RiskAssessmentCreate, actor_id: str = "usr-lead-eng", db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    engine = RiskAnalysisEngine()
    evaluated = engine.evaluate_fmea_item(payload.model_dump())

    ra = RiskAssessment(
        change_request_id=cr.id,
        failure_mode=evaluated["failure_mode"],
        effect=evaluated["effect"],
        cause=evaluated["cause"],
        severity=evaluated["severity"],
        occurrence=evaluated["occurrence"],
        detection=evaluated["detection"],
        rpn=evaluated["rpn"],
        high_severity_flag=evaluated["high_severity_flag"],
        mitigation=evaluated["mitigation"],
        accountable_owner=evaluated["accountable_owner"],
        residual_severity=evaluated["residual_severity"],
        residual_occurrence=evaluated["residual_occurrence"],
        residual_detection=evaluated["residual_detection"],
        residual_rpn=evaluated["residual_rpn"],
        rubric_version=evaluated["rubric_version"]
    )
    db.add(ra)
    db.commit()

    # Automatically evaluate and update verification requirements if high severity
    all_risks = [r.__dict__ for r in db.query(RiskAssessment).filter(RiskAssessment.change_request_id == cr.id).all()]
    all_impacts = [i.__dict__ for i in db.query(ImpactResult).filter(ImpactResult.change_request_id == cr.id).all()]
    new_reqs = engine.generate_adaptive_verification_requirements(cr.change_type, all_impacts, all_risks)

    existing_codes = {r.requirement_code for r in db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == cr.id).all()}
    for gr in new_reqs:
        if gr["requirement_code"] not in existing_codes:
            vr = VerificationRequirement(
                id=f"{cr.id}-{gr['id']}",
                change_request_id=cr.id,
                requirement_code=gr["requirement_code"],
                title=gr["title"],
                requirement_type=gr["requirement_type"],
                applicability_rule=gr["applicability_rule"],
                acceptance_criteria=gr["acceptance_criteria"],
                mandatory=gr["mandatory"],
                status=gr["status"]
            )
            db.add(vr)
    db.commit()

    actor = db.query(User).filter(User.id == actor_id).first()
    if actor:
        AuditService.log_event(
            db=db,
            change_request_id=cr.id,
            actor=actor,
            action="ADD_FMEA_RECORD",
            previous_state=cr.state,
            new_state=cr.state,
            reason=f"Added failure mode: {payload.failure_mode} (RPN: {ra.rpn}, High Severity: {ra.high_severity_flag})"
        )

    db.refresh(ra)
    return ra
