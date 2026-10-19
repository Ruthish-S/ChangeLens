from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.core.database import get_db
from backend.app.models.models import ChangeRequest, ChangeItem, ImpactResult, ConfigurationBaseline, User
from backend.app.schemas.schemas import ImpactResultResponse
from backend.app.services.impact_engine.engine import ImpactAnalysisEngine
from backend.app.services.audit_service.service import AuditService

router = APIRouter()

@router.post("/{change_id}/impact-analysis", response_model=List[ImpactResultResponse])
def run_impact_analysis(change_id: str, actor_id: str = "usr-qa-mgr", db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == cr.baseline_id).first()
    if not baseline:
        raise HTTPException(status_code=400, detail="Configuration baseline not found")

    change_items = db.query(ChangeItem).filter(ChangeItem.change_request_id == cr.id).all()
    if not change_items:
        raise HTTPException(status_code=400, detail="Change request has no change items defined")

    # Clear previous impact results
    db.query(ImpactResult).filter(ImpactResult.change_request_id == cr.id).delete()

    engine = ImpactAnalysisEngine()
    results = engine.analyze_change(baseline, cr, change_items)

    db_records = []
    for r in results:
        ir = ImpactResult(
            change_request_id=cr.id,
            algorithm_version=r["algorithm_version"],
            impacted_object_id=r["impacted_object_id"],
            impacted_object_name=r["impacted_object_name"],
            impacted_object_type=r["impacted_object_type"],
            classification=r["classification"],
            path_json=r["path_json"],
            propagation_rule=r["propagation_rule"],
            rationale=r["rationale"],
            verification_action=r["verification_action"],
            unresolved_uncertainty=r["unresolved_uncertainty"],
            baseline_revision_snapshot=r["baseline_revision_snapshot"]
        )
        db_records.append(ir)
        db.add(ir)

    # Transition state to IMPACT_ASSESSED if currently DRAFT or SUBMITTED
    if cr.state in ["DRAFT", "SUBMITTED"]:
        prev = cr.state
        cr.state = "IMPACT_ASSESSED"
        actor = db.query(User).filter(User.id == actor_id).first()
        if actor:
            AuditService.log_event(
                db=db,
                change_request_id=cr.id,
                actor=actor,
                action="RUN_IMPACT_ANALYSIS",
                previous_state=prev,
                new_state="IMPACT_ASSESSED",
                reason=f"Calculated impact traversal: {len(results)} affected nodes identified."
            )

    db.commit()
    for rec in db_records:
        db.refresh(rec)
    return db_records

@router.get("/{change_id}/impact", response_model=List[ImpactResultResponse])
def get_impact_results(change_id: str, db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    return db.query(ImpactResult).filter(ImpactResult.change_request_id == change_id).all()
