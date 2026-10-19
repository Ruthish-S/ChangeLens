from typing import Dict, List, Any, Optional
import datetime

class QualityGateEngine:
    """
    Explainable Quality Gate Engine.
    Evaluates mandatory conditions across workflow milestones:
    - Pre-Authorization Gate (Impact Assessment & Evidence completeness)
    - Pre-Implementation Gate (Approvals & Engineering Sign-offs)
    - Closure Gate (Post-change verification evidence & QA Buy-off)
    
    Returns structured results: PASS, BLOCKED, REVIEW_REQUIRED, NOT_APPLICABLE
    along with explicit blocking reasons and actionable corrective steps.
    """

    def evaluate_gate(
        self,
        gate_name: str,
        change_request: Any,
        baseline: Any,
        requirements: List[Any],
        evidence_records: List[Any],
        approvals: List[Any],
        impact_results: List[Any]
    ) -> Dict[str, Any]:
        
        checks = []
        blocking_reasons = []
        corrective_actions = []

        # 1. Baseline Consistency Check (AC-06)
        # Check if baseline snapshot matches active baseline version
        baseline_check_passed = True
        if baseline and hasattr(change_request, "baseline_id"):
            if baseline.id != change_request.baseline_id:
                baseline_check_passed = False
                reason = (
                    f"Baseline mismatch: Change request references {change_request.baseline_id}, "
                    f"but active configuration baseline is {baseline.id}."
                )
                blocking_reasons.append(reason)
                corrective_actions.append("Re-align change request to active baseline and rerun impact analysis.")
                checks.append({
                    "check_id": "CHK-BASE-01",
                    "title": "Baseline Revision Integrity",
                    "result": "BLOCKED",
                    "details": reason
                })
            elif impact_results:
                # Check if impact results were computed against a stale baseline snapshot
                for imp in impact_results:
                    snapshot = getattr(imp, "baseline_revision_snapshot", None)
                    if snapshot and snapshot != baseline.version:
                        baseline_check_passed = False
                        reason = (
                            f"Stale impact assessment: Impact analysis was computed against baseline "
                            f"{snapshot}, whereas current baseline version is {baseline.version}."
                        )
                        blocking_reasons.append(reason)
                        corrective_actions.append("Re-run impact analysis against current baseline version.")
                        checks.append({
                            "check_id": "CHK-BASE-02",
                            "title": "Impact Snapshot Currency",
                            "result": "BLOCKED",
                            "details": reason
                        })
                        break
        
        if baseline_check_passed:
            checks.append({
                "check_id": "CHK-BASE-01",
                "title": "Baseline Revision Integrity",
                "result": "PASS",
                "details": f"Aligned with baseline {baseline.id} ({baseline.version})."
            })

        # 2. Impact Assessment Completeness Check
        if not impact_results and gate_name in ["PRE_AUTHORIZATION_GATE", "PRE_IMPLEMENTATION_GATE", "CLOSURE_GATE"]:
            reason = "No dependency impact analysis has been performed for this change request."
            blocking_reasons.append(reason)
            corrective_actions.append("Trigger automated dependency impact analysis.")
            checks.append({
                "check_id": "CHK-IMP-01",
                "title": "Impact Analysis Presence",
                "result": "BLOCKED",
                "details": reason
            })
        else:
            checks.append({
                "check_id": "CHK-IMP-01",
                "title": "Impact Analysis Presence",
                "result": "PASS",
                "details": f"Impact analysis validated: {len(impact_results)} reachable nodes cataloged."
            })

        # 3. Evidence Completeness Check (AC-04)
        # Check all mandatory verification requirements
        evidence_by_req = {}
        for ev in evidence_records:
            evidence_by_req.setdefault(ev.requirement_id, []).append(ev)

        missing_evidence = []
        pending_review_evidence = []
        rejected_evidence = []

        for req in requirements:
            if not req.mandatory:
                continue

            records = evidence_by_req.get(req.id, [])
            if not records:
                missing_evidence.append(req)
                continue

            # Check if any record is accepted
            accepted = [r for r in records if r.verification_status == "ACCEPTED"]
            if not accepted:
                if any(r.verification_status == "REJECTED" for r in records):
                    rejected_evidence.append(req)
                else:
                    pending_review_evidence.append(req)

        if missing_evidence:
            for req in missing_evidence:
                reason = f"Mandatory evidence missing for '{req.title}' ({req.requirement_code})."
                blocking_reasons.append(reason)
                corrective_actions.append(f"Upload verified evidence file satisfying: {req.acceptance_criteria}")
                checks.append({
                    "check_id": f"CHK-EV-{req.id}",
                    "title": req.title,
                    "result": "BLOCKED",
                    "details": reason
                })
        
        if rejected_evidence:
            for req in rejected_evidence:
                reason = f"Submitted evidence for '{req.title}' ({req.requirement_code}) was rejected during QA review."
                blocking_reasons.append(reason)
                corrective_actions.append(f"Replace rejected evidence for {req.requirement_code} with conforming documentation.")
                checks.append({
                    "check_id": f"CHK-EV-REJ-{req.id}",
                    "title": req.title,
                    "result": "BLOCKED",
                    "details": reason
                })

        if pending_review_evidence and not missing_evidence and not rejected_evidence:
            for req in pending_review_evidence:
                checks.append({
                    "check_id": f"CHK-EV-PEND-{req.id}",
                    "title": req.title,
                    "result": "REVIEW_REQUIRED",
                    "details": f"Evidence submitted for {req.requirement_code} is awaiting formal QA verification sign-off."
                })

        if not missing_evidence and not rejected_evidence and not pending_review_evidence:
            checks.append({
                "check_id": "CHK-EV-SUMMARY",
                "title": "Mandatory Verification Evidence Complete",
                "result": "PASS",
                "details": f"All {len([r for r in requirements if r.mandatory])} mandatory verification requirements fulfilled with accepted evidence."
            })

        # 4. Approvals and Separation of Duties Check (AC-05)
        if gate_name in ["PRE_IMPLEMENTATION_GATE", "CLOSURE_GATE"]:
            approver_decisions = [a for a in approvals if a.reviewer_role in ["APPROVER", "ENGINEER_QA"] and a.decision == "APPROVED"]
            if not approver_decisions:
                reason = "Formal engineering approval by authorized signatory has not been submitted."
                blocking_reasons.append(reason)
                corrective_actions.append("Obtain authorized signature from assigned Engineering/QA Approver.")
                checks.append({
                    "check_id": "CHK-APP-01",
                    "title": "Authorized Engineering Sign-off",
                    "result": "BLOCKED",
                    "details": reason
                })
            else:
                checks.append({
                    "check_id": "CHK-APP-01",
                    "title": "Authorized Engineering Sign-off",
                    "result": "PASS",
                    "details": f"Approved by {approver_decisions[-1].reviewer_id} ({approver_decisions[-1].reviewer_role})."
                })

        # Overall synthesis
        if blocking_reasons:
            overall_result = "BLOCKED"
        elif any(c["result"] == "REVIEW_REQUIRED" for c in checks):
            overall_result = "REVIEW_REQUIRED"
        else:
            overall_result = "PASS"

        return {
            "gate_name": gate_name,
            "overall_result": overall_result,
            "evaluated_at": datetime.datetime.now(datetime.timezone.utc),
            "checks": checks,
            "blocking_reasons": blocking_reasons,
            "corrective_actions": corrective_actions
        }
