import json
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import WorkflowEvent, User

class AuditService:
    """
    Append-only audit trail logging service.
    Records every workflow transition, review decision, gate evaluation,
    and evidence verification event with actor identity, role, timestamp,
    previous state, new state, and rationale.
    """

    @staticmethod
    def log_event(
        db: Session,
        change_request_id: str,
        actor: User,
        action: str,
        previous_state: str,
        new_state: str,
        reason: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> WorkflowEvent:
        event = WorkflowEvent(
            change_request_id=change_request_id,
            actor_id=actor.id,
            actor_role=actor.role,
            action=action,
            previous_state=previous_state,
            new_state=new_state,
            reason=reason,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            metadata_json=json.dumps(metadata or {})
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def get_events_for_change(db: Session, change_request_id: str):
        return (
            db.query(WorkflowEvent)
            .filter(WorkflowEvent.change_request_id == change_request_id)
            .order_by(WorkflowEvent.timestamp.asc())
            .all()
        )
