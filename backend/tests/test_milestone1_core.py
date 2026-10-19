import pytest
import os
import json
import hashlib
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.models.models import (
    User,
    ConfigurationBaseline,
    ConfigurationItem,
    Dependency,
    ChangeRequest,
    ChangeItem,
    ImpactResult,
    RiskAssessment,
    VerificationRequirement,
    EvidenceRecord,
    QualityGateEvaluation,
    Approval,
    WorkflowEvent
)
from backend.app.services.impact_engine.engine import ImpactAnalysisEngine
from backend.app.services.risk_engine.engine import RiskAnalysisEngine
from backend.app.services.gate_engine.engine import QualityGateEngine
from backend.app.services.workflow_engine.engine import WorkflowEngine
from backend.app.services.audit_service.service import AuditService
from backend.app.services.report_engine.engine import ReportGeneratorService
from backend.app.analytics.engine import AnalyticsEngine
from backend.app.core.config import settings

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_ac01_change_request_identity_and_baseline(db):
    """AC-01: Every valid change request receives a unique ID and retains its baseline reference."""
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == "CCR-2026-0001").first()
    assert cr is not None
    assert cr.id.startswith("CCR-")
    assert cr.baseline_id == "BASE-737-9-DOORPLUG-A"
    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == cr.baseline_id).first()
    assert baseline is not None
    assert baseline.version == "Rev A.1"

def test_ac02_ac03_synthetic_oracle_precision_recall_and_traceability(db):
    """
    AC-02 & AC-03: Impact analysis returns expected reachable objects for synthetic test oracle
    with traceable explanation paths.
    """
    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == "BASE-737-9-DOORPLUG-A").first()
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == "CCR-2026-0001").first()
    change_items = db.query(ChangeItem).filter(ChangeItem.change_request_id == cr.id).all()

    engine = ImpactAnalysisEngine()
    results = engine.analyze_change(baseline, cr, change_items)

    # Synthetic Test Oracle for C-104 (Door Plug) modification:
    # Known reachable set in ground truth:
    # 1. C-104 (Directly Changed)
    # 2. S-201 (Material spec)
    # 3. P-301 (Removal procedure)
    # 4. C-101 (Fuselage frame assembly)
    # 5. C-105 (Retaining bolt assembly)
    # 6. C-106 (Lower hinge pin)
    # 7. C-107 (Stop pads)
    # 8. C-108 (Pressure seal)
    # 9. P-302 (Fastener procedure via P-301 and C-105)
    # 10. I-401 (Retaining bolt inspection)
    # 11. I-403 (Pressure seal inspection)
    # 12. T-501 (Proof pressure test)
    # 13. T-502 (Guide pin test)
    # 14. T-503 (Vibration test)
    oracle_expected_ids = {
        "C-104", "S-201", "P-301", "C-101", "C-105", "C-106", "C-107", "C-108",
        "P-302", "I-401", "I-403", "T-501", "T-502", "T-503"
    }

    predicted_ids = {r["impacted_object_id"] for r in results}

    # Calculate Impact Precision & Recall
    true_positives = len(predicted_ids.intersection(oracle_expected_ids))
    precision = true_positives / len(predicted_ids) if predicted_ids else 0
    recall = true_positives / len(oracle_expected_ids) if oracle_expected_ids else 0

    assert recall >= 0.90, f"Impact Recall ({recall:.2f}) below 0.90 target."
    assert precision >= 0.80, f"Impact Precision ({precision:.2f}) below 0.80 target."

    # AC-03: Verify traceable path for every impacted object
    for r in results:
        path = json.loads(r["path_json"])
        assert len(path) > 0, f"Object {r['impacted_object_id']} missing path."
        assert path[0]["node_id"] == "C-104", "Path root must be changed item C-104."
        assert len(r["rationale"]) > 10, "Rationale must contain explainable justification."
        assert len(r["verification_action"]) > 5, "Verification action must be specified."

def test_ac04_missing_evidence_blocks_gate(db):
    """AC-04: Missing mandatory evidence prevents the relevant transition."""
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == "CCR-2026-0001").first()
    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == cr.baseline_id).first()
    reqs = db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == cr.id).all()
    evs = db.query(EvidenceRecord).filter(EvidenceRecord.change_request_id == cr.id).all()
    impacts = db.query(ImpactResult).filter(ImpactResult.change_request_id == cr.id).all()

    # Currently only 1 of 4 requirements has evidence, 3 are missing
    gate_engine = QualityGateEngine()
    result = gate_engine.evaluate_gate(
        gate_name="PRE_AUTHORIZATION_GATE",
        change_request=cr,
        baseline=baseline,
        requirements=reqs,
        evidence_records=evs,
        approvals=[],
        impact_results=impacts
    )

    assert result["overall_result"] == "BLOCKED"
    assert len(result["blocking_reasons"]) > 0
    assert any("missing" in r.lower() for r in result["blocking_reasons"])
    assert len(result["corrective_actions"]) > 0

    # Test workflow transition rejection when gate is BLOCKED
    # Temporarily set state to UNDER_REVIEW to test authorization transition
    orig_state = cr.state
    cr.state = "UNDER_REVIEW"
    try:
        user_qa = db.query(User).filter(User.id == "usr-qa-mgr").first()
        allowed, msg = WorkflowEngine.validate_transition(
            change_request=cr,
            actor=user_qa,
            target_state="AUTHORIZED",
            gate_evaluation=result
        )
        assert not allowed
        assert "BLOCKED" in msg
    finally:
        cr.state = orig_state

def test_ac05_separation_of_duties_and_unauthorized_approvals(db):
    """AC-05: Unauthorized approval attempts and self-approvals are strictly rejected."""
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == "CCR-2026-0001").first()
    requester = db.query(User).filter(User.id == cr.requester_id).first()
    auditor = db.query(User).filter(User.id == "usr-auditor").first()
    approver = db.query(User).filter(User.id == "usr-chief-eng").first()

    # 1. Requester cannot approve their own change request
    valid, msg = WorkflowEngine.validate_approval(cr, requester, "APPROVED")
    assert not valid
    assert "Separation of Duties Violation" in msg

    # 2. Requester cannot transition to AUTHORIZED
    orig_state = cr.state
    cr.state = "UNDER_REVIEW"
    try:
        valid, msg = WorkflowEngine.validate_transition(cr, requester, "AUTHORIZED")
        assert not valid
        assert "Separation of Duties Violation" in msg
    finally:
        cr.state = orig_state

    # 3. Auditor cannot approve or modify workflow states
    valid, msg = WorkflowEngine.validate_approval(cr, auditor, "APPROVED")
    assert not valid
    assert "Auditor" in msg

    valid, msg = WorkflowEngine.validate_transition(cr, auditor, "UNDER_REVIEW")
    assert not valid
    assert "Auditor" in msg

    # 4. Authorized approver is accepted
    valid, msg = WorkflowEngine.validate_approval(cr, approver, "APPROVED")
    assert valid

def test_ac06_baseline_mismatch_invalidates_stale_impact(db):
    """AC-06: A changed baseline invalidates stale impact results."""
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == "CCR-2026-0001").first()
    reqs = db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == cr.id).all()
    evs = db.query(EvidenceRecord).filter(EvidenceRecord.change_request_id == cr.id).all()
    impacts = db.query(ImpactResult).filter(ImpactResult.change_request_id == cr.id).all()

    # Simulate updated baseline revision (e.g. baseline bumped to Rev B.0)
    stale_baseline = ConfigurationBaseline(
        id="BASE-737-9-DOORPLUG-A",
        name="Updated Baseline",
        version="Rev B.0",
        status="ACTIVE"
    )

    gate_engine = QualityGateEngine()
    result = gate_engine.evaluate_gate(
        gate_name="PRE_AUTHORIZATION_GATE",
        change_request=cr,
        baseline=stale_baseline,
        requirements=reqs,
        evidence_records=evs,
        approvals=[],
        impact_results=impacts
    )

    assert result["overall_result"] == "BLOCKED"
    assert any("stale" in r.lower() or "baseline" in r.lower() for r in result["blocking_reasons"])

def test_ac07_rejected_changes_retain_decision_and_audit(db):
    """AC-07: Rejected changes retain the decision and rationale."""
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == "CCR-2026-0001").first()
    approver = db.query(User).filter(User.id == "usr-chief-eng").first()

    # Submit a formal rejection decision with documented rationale
    app = Approval(
        change_request_id=cr.id,
        reviewer_id=approver.id,
        reviewer_role=approver.role,
        decision="REJECTED",
        rationale="Proof test T-501 showed seal deflection exceeding 0.015 in tolerance."
    )
    db.add(app)
    db.commit()

    # Log audit event
    AuditService.log_event(
        db=db,
        change_request_id=cr.id,
        actor=approver,
        action="REJECT_CHANGE",
        previous_state=cr.state,
        new_state="REJECTED",
        reason=app.rationale
    )

    # Check persistence and retrieval
    saved_app = db.query(Approval).filter(Approval.change_request_id == cr.id, Approval.decision == "REJECTED").first()
    assert saved_app is not None
    assert "T-501" in saved_app.rationale

    events = AuditService.get_events_for_change(db, cr.id)
    assert any(e.action == "REJECT_CHANGE" and "T-501" in e.reason for e in events)

def test_ac08_ac09_reports_contain_required_sections_and_data(db):
    """AC-08 & AC-09: Reports reproduce underlying risk calculations and contain all required sections."""
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == "CCR-2026-0001").first()
    base = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == cr.baseline_id).first()
    cis = db.query(ChangeItem).filter(ChangeItem.change_request_id == cr.id).all()
    imps = db.query(ImpactResult).filter(ImpactResult.change_request_id == cr.id).all()
    risks = db.query(RiskAssessment).filter(RiskAssessment.change_request_id == cr.id).all()
    reqs = db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == cr.id).all()
    evs = db.query(EvidenceRecord).filter(EvidenceRecord.change_request_id == cr.id).all()
    gates = db.query(QualityGateEvaluation).filter(QualityGateEvaluation.change_request_id == cr.id).all()
    apps = db.query(Approval).filter(Approval.change_request_id == cr.id).all()
    events = db.query(WorkflowEvent).filter(WorkflowEvent.change_request_id == cr.id).all()

    data = ReportGeneratorService.build_canonical_change_data(
        cr, base, cis, imps, risks, reqs, evs, gates, apps, events
    )

    # Verify canonical data contents
    assert data["metadata"]["change_id"] == cr.id
    assert len(data["impact_items"]) == len(imps)
    assert len(data["fmea_items"]) == len(risks)
    assert len(data["verification_items"]) == len(reqs)

    # Verify FMEA calculation consistency
    for f in data["fmea_items"]:
        assert f["rpn"] == f["severity"] * f["occurrence"] * f["detection"]
        assert f["res_rpn"] == f["res_s"] * f["res_o"] * f["res_d"]
        if f["severity"] >= 8:
            assert f["high_severity"] is True

    # Verify physical file existence
    pdf_path = settings.REPORT_OUTPUT_DIR / "CCR-2026-0001-Assessment.pdf"
    docx_path = settings.REPORT_OUTPUT_DIR / "CCR-2026-0001-Assessment.docx"
    xlsx_path = settings.REPORT_OUTPUT_DIR / "CCR-2026-0001-Assessment.xlsx"
    csv_path = settings.REPORT_OUTPUT_DIR / "CCR-2026-0001-Assessment.csv"

    assert pdf_path.exists() and pdf_path.stat().st_size > 1000
    assert docx_path.exists() and docx_path.stat().st_size > 1000
    assert xlsx_path.exists() and xlsx_path.stat().st_size > 1000
    assert csv_path.exists() and csv_path.stat().st_size > 100

def test_ac10_dashboard_metrics_reconciliation(db):
    """AC-10: Dashboard metrics agree with independently calculated values from the same dataset."""
    metrics = AnalyticsEngine.get_overview_metrics(db)
    
    actual_total_changes = db.query(ChangeRequest).count()
    actual_high_sev_risks = db.query(RiskAssessment).filter(RiskAssessment.high_severity_flag == True).count()
    actual_reqs = db.query(VerificationRequirement).filter(VerificationRequirement.mandatory == True).count()
    actual_acc_ev = db.query(EvidenceRecord).filter(EvidenceRecord.verification_status == "ACCEPTED").count()

    assert metrics["total_changes"] == actual_total_changes
    assert metrics["high_severity_risks"] == actual_high_sev_risks
    assert metrics["total_mandatory_requirements"] == actual_reqs
    assert metrics["accepted_evidence_records"] == actual_acc_ev

def test_ac11_restart_persistence(db):
    """AC-11: A restart or new database session retains committed records."""
    new_session = SessionLocal()
    try:
        users_count = new_session.query(User).count()
        baseline = new_session.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == "BASE-737-9-DOORPLUG-A").first()
        items_count = new_session.query(ConfigurationItem).count()
        
        assert users_count >= 4
        assert baseline is not None
        assert items_count >= 20
    finally:
        new_session.close()
