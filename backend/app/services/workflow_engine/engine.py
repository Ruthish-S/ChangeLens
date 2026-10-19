from typing import Dict, Any, Tuple, Optional
from backend.app.models.models import ChangeRequest, User

# Valid state machine transitions
ALLOWED_TRANSITIONS = {
    "DRAFT": ["SUBMITTED", "CANCELLED"],
    "SUBMITTED": ["IMPACT_ASSESSED", "RETURNED_FOR_REVISION", "CANCELLED"],
    "IMPACT_ASSESSED": ["UNDER_REVIEW", "RETURNED_FOR_REVISION", "CANCELLED"],
    "UNDER_REVIEW": ["AUTHORIZED", "RETURNED_FOR_REVISION", "REJECTED", "CANCELLED"],
    "AUTHORIZED": ["IMPLEMENTATION", "CANCELLED"],
    "IMPLEMENTATION": ["POST_VERIFICATION", "RETURNED_FOR_REVISION"],
    "POST_VERIFICATION": ["CLOSED", "RETURNED_FOR_REVISION"],
    "CLOSED": ["REOPENED"],
    "REJECTED": ["REOPENED"],
    "RETURNED_FOR_REVISION": ["SUBMITTED", "CANCELLED"],
    "CANCELLED": []
}

class WorkflowEngine:
    """
    Workflow State Machine & Separation-of-Duties Enforcement Engine.
    Ensures:
    1. Valid transitions only.
    2. Requesters cannot approve their own requests (Separation of Duties).
    3. Requesters cannot verify their own implementation.
    4. Mandatory quality gates must PASS before critical state transitions.
    5. Auditors cannot alter workflow states.
    """

    @staticmethod
    def validate_transition(
        change_request: ChangeRequest,
        actor: User,
        target_state: str,
        gate_evaluation: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        current_state = change_request.state

        # Check if actor is active
        if not actor.active:
            return False, f"User {actor.username} is inactive and cannot perform workflow actions."

        # Auditor role restriction
        if actor.role == "AUDITOR":
            return False, "Auditor role has read-only permissions and cannot advance or modify workflow states."

        # Check state machine definition
        allowed = ALLOWED_TRANSITIONS.get(current_state, [])
        if target_state not in allowed:
            return False, (
                f"Invalid transition: Cannot transition change request {change_request.id} "
                f"from '{current_state}' to '{target_state}'. Allowed targets: {allowed}."
            )

        # Separation of Duties: Authorization rule (AC-05)
        if target_state == "AUTHORIZED":
            if actor.id == change_request.requester_id:
                return False, (
                    f"Separation of Duties Violation: Requester ({actor.username}) "
                    f"cannot approve or authorize their own change request ({change_request.id})."
                )
            if actor.role not in ["APPROVER", "ENGINEER_QA"]:
                return False, f"User {actor.username} lacks APPROVER or ENGINEER_QA role to authorize changes."

        # Separation of Duties: Implementation & Verification
        if target_state == "CLOSED":
            if actor.id == change_request.requester_id:
                return False, (
                    f"Separation of Duties Violation: Requester ({actor.username}) "
                    f"cannot perform independent final verification and closure for their own request."
                )

        # Quality Gate Enforcement (AC-04)
        if gate_evaluation:
            result = gate_evaluation.get("overall_result")
            if result == "BLOCKED":
                reasons = "; ".join(gate_evaluation.get("blocking_reasons", ["Mandatory gate conditions failed."]))
                return False, f"Quality Gate '{gate_evaluation.get('gate_name')}' is BLOCKED: {reasons}"

        return True, "Transition authorized."

    @staticmethod
    def validate_approval(
        change_request: ChangeRequest,
        reviewer: User,
        decision: str
    ) -> Tuple[bool, str]:
        if not reviewer.active:
            return False, f"User {reviewer.username} is inactive."

        if reviewer.role == "AUDITOR":
            return False, "Auditors cannot submit approval decisions."

        # Separation of duties: Requester cannot approve their own change request (AC-05)
        if reviewer.id == change_request.requester_id and decision == "APPROVED":
            return False, (
                f"Separation of Duties Violation: Requester ({reviewer.username}) "
                f"cannot submit approval for their own change request {change_request.id}."
            )

        if reviewer.role not in ["APPROVER", "ENGINEER_QA"]:
            return False, f"Role {reviewer.role} is not authorized to submit formal review decisions."

        if decision not in ["APPROVED", "REJECTED", "RETURNED_FOR_REVISION"]:
            return False, f"Invalid decision: {decision}. Must be APPROVED, REJECTED, or RETURNED_FOR_REVISION."

        return True, "Approval decision valid."
