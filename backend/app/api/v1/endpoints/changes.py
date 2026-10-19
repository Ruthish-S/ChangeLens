from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from backend.app.core.database import get_db
from backend.app.models.models import ChangeRequest, ChangeItem, User, ConfigurationBaseline
from backend.app.schemas.schemas import (
    ChangeRequestCreate,
    ChangeRequestUpdate,
    ChangeRequestDetailResponse,
    ChangeItemCreate
)
from backend.app.services.audit_service.service import AuditService

router = APIRouter()

@router.get("", response_model=List[ChangeRequestDetailResponse])
def list_change_requests(
    state: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ChangeRequest)
    if state:
        query = query.filter(ChangeRequest.state == state)
    if priority:
        query = query.filter(ChangeRequest.priority == priority)
    if search:
        query = query.filter(ChangeRequest.title.ilike(f"%{search}%") | ChangeRequest.id.ilike(f"%{search}%"))
    return query.order_by(ChangeRequest.created_at.desc()).all()

@router.post("", response_model=ChangeRequestDetailResponse)
def create_change_request(payload: ChangeRequestCreate, db: Session = Depends(get_db)):
    requester = db.query(User).filter(User.id == payload.requester_id).first()
    if not requester:
        raise HTTPException(status_code=400, detail="Invalid requester ID")

    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == payload.baseline_id).first()
    if not baseline:
        raise HTTPException(status_code=400, detail="Invalid baseline ID")

    count = db.query(ChangeRequest).count() + 1
    new_id = f"CCR-2026-{count:04d}"

    cr = ChangeRequest(
        id=new_id,
        title=payload.title,
        reason=payload.reason,
        change_type=payload.change_type,
        requester_id=payload.requester_id,
        baseline_id=payload.baseline_id,
        priority=payload.priority,
        state="DRAFT"
    )
    db.add(cr)
    db.commit()

    for item in payload.change_items:
        ci = ChangeItem(
            change_request_id=new_id,
            affected_object_id=item.affected_object_id,
            field_name=item.field_name,
            proposed_operation=item.proposed_operation,
            current_value=item.current_value,
            proposed_value=item.proposed_value,
            justification=item.justification
        )
        db.add(ci)
    db.commit()

    AuditService.log_event(
        db=db,
        change_request_id=new_id,
        actor=requester,
        action="CREATE_PROPOSAL",
        previous_state="NONE",
        new_state="DRAFT",
        reason=f"Created change request proposal: {payload.title}"
    )

    db.refresh(cr)
    return cr

@router.get("/{change_id}", response_model=ChangeRequestDetailResponse)
def get_change_request(change_id: str, db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")
    return cr

@router.patch("/{change_id}", response_model=ChangeRequestDetailResponse)
def update_change_request(change_id: str, payload: ChangeRequestUpdate, db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    if cr.state not in ["DRAFT", "RETURNED_FOR_REVISION"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot edit change request while in '{cr.state}' state. Only DRAFT and RETURNED_FOR_REVISION are editable."
        )

    if payload.title is not None:
        cr.title = payload.title
    if payload.reason is not None:
        cr.reason = payload.reason
    if payload.priority is not None:
        cr.priority = payload.priority

    db.commit()
    db.refresh(cr)
    return cr
