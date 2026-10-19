import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)  # e.g., "usr-lead-eng", "usr-qa-mgr"
    username = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # REQUESTER, ENGINEER_QA, APPROVER, AUDITOR
    email = Column(String(100), unique=True, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    change_requests = relationship("ChangeRequest", foreign_keys="ChangeRequest.requester_id", back_populates="requester")
    approvals = relationship("Approval", back_populates="reviewer")
    workflow_events = relationship("WorkflowEvent", back_populates="actor")


class ConfigurationBaseline(Base):
    __tablename__ = "configuration_baselines"

    id = Column(String(50), primary_key=True)  # e.g., "BASE-737-9-DOORPLUG-A"
    name = Column(String(150), nullable=False)
    version = Column(String(50), nullable=False)  # e.g., "Rev A.1"
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, SUPERSEDED, DRAFT
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    items = relationship("ConfigurationItem", back_populates="baseline", cascade="all, delete-orphan")
    dependencies = relationship("Dependency", back_populates="baseline", cascade="all, delete-orphan")
    change_requests = relationship("ChangeRequest", foreign_keys="ChangeRequest.baseline_id", back_populates="baseline")


class ConfigurationItem(Base):
    __tablename__ = "configuration_items"

    id = Column(String(50), primary_key=True)  # e.g., "C-104", "P-302", "T-501"
    baseline_id = Column(String(50), ForeignKey("configuration_baselines.id"), nullable=False)
    part_number = Column(String(100), nullable=False)
    name = Column(String(150), nullable=False)
    item_type = Column(String(50), nullable=False)  # COMPONENT, SPECIFICATION, PROCESS, INSPECTION, TEST
    revision = Column(String(20), nullable=False)  # Rev A
    description = Column(Text, nullable=True)
    lifecycle_status = Column(String(50), default="RELEASED", nullable=False)  # RELEASED, IN_REVIEW, OBSOLETE
    criticality = Column(String(50), default="STANDARD", nullable=False)  # CRITICAL, MAJOR, STANDARD
    metadata_json = Column(Text, default="{}", nullable=False)

    baseline = relationship("ConfigurationBaseline", back_populates="items")
    outgoing_deps = relationship("Dependency", foreign_keys="Dependency.source_id", back_populates="source_item")
    incoming_deps = relationship("Dependency", foreign_keys="Dependency.target_id", back_populates="target_item")


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    baseline_id = Column(String(50), ForeignKey("configuration_baselines.id"), nullable=False)
    source_id = Column(String(50), ForeignKey("configuration_items.id"), nullable=False)
    target_id = Column(String(50), ForeignKey("configuration_items.id"), nullable=False)
    relationship_type = Column(String(50), nullable=False)  # SPECIFIED_BY, MANUFACTURED_BY, ASSEMBLED_INTO, SECURED_BY, INSPECTED_BY, VERIFIED_BY, DEPENDS_ON
    validity_interval = Column(String(50), default="ALWAYS", nullable=False)
    active = Column(Boolean, default=True, nullable=False)

    baseline = relationship("ConfigurationBaseline", back_populates="dependencies")
    source_item = relationship("ConfigurationItem", foreign_keys=[source_id], back_populates="outgoing_deps")
    target_item = relationship("ConfigurationItem", foreign_keys=[target_id], back_populates="incoming_deps")

    __table_args__ = (
        Index("idx_dep_source", "source_id"),
        Index("idx_dep_target", "target_id"),
    )


class ChangeRequest(Base):
    __tablename__ = "change_requests"

    id = Column(String(50), primary_key=True)  # e.g., "CCR-2026-0001"
    title = Column(String(200), nullable=False)
    reason = Column(Text, nullable=False)
    change_type = Column(String(50), nullable=False)  # MATERIAL_SUBSTITUTION, DESIGN_REVISION, PROCESS_CHANGE, FASTENER_REVISION
    requester_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    baseline_id = Column(String(50), ForeignKey("configuration_baselines.id"), nullable=False)
    proposed_baseline_id = Column(String(50), ForeignKey("configuration_baselines.id"), nullable=True)
    state = Column(String(50), default="DRAFT", nullable=False)
    # DRAFT, SUBMITTED, IMPACT_ASSESSED, UNDER_REVIEW, AUTHORIZED, IMPLEMENTATION, POST_VERIFICATION, CLOSED, REJECTED, RETURNED_FOR_REVISION, CANCELLED
    priority = Column(String(20), default="HIGH", nullable=False)  # URGENT, HIGH, ROUTINE
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    requester = relationship("User", foreign_keys=[requester_id], back_populates="change_requests")
    baseline = relationship("ConfigurationBaseline", foreign_keys=[baseline_id], back_populates="change_requests")
    change_items = relationship("ChangeItem", back_populates="change_request", cascade="all, delete-orphan")
    impact_results = relationship("ImpactResult", back_populates="change_request", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="change_request", cascade="all, delete-orphan")
    verification_requirements = relationship("VerificationRequirement", back_populates="change_request", cascade="all, delete-orphan")
    evidence_records = relationship("EvidenceRecord", back_populates="change_request", cascade="all, delete-orphan")
    gate_evaluations = relationship("QualityGateEvaluation", back_populates="change_request", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="change_request", cascade="all, delete-orphan")
    workflow_events = relationship("WorkflowEvent", back_populates="change_request", cascade="all, delete-orphan")


class ChangeItem(Base):
    __tablename__ = "change_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    affected_object_id = Column(String(50), ForeignKey("configuration_items.id"), nullable=False)
    field_name = Column(String(100), nullable=False)  # e.g., "material_specification", "torque_setting", "rework_procedure"
    proposed_operation = Column(String(50), default="MODIFY", nullable=False)  # MODIFY, ADD, DELETE, REPLACE
    current_value = Column(Text, nullable=False)
    proposed_value = Column(Text, nullable=False)
    justification = Column(Text, nullable=True)

    change_request = relationship("ChangeRequest", back_populates="change_items")
    affected_item = relationship("ConfigurationItem")


class ImpactResult(Base):
    __tablename__ = "impact_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    algorithm_version = Column(String(50), nullable=False)
    impacted_object_id = Column(String(50), nullable=False)
    impacted_object_name = Column(String(150), nullable=False)
    impacted_object_type = Column(String(50), nullable=False)
    classification = Column(String(50), nullable=False)  # DIRECTLY_CHANGED, POTENTIALLY_IMPACTED, VERIFICATION_REQUIRED, UNAFFECTED
    path_json = Column(Text, nullable=False)  # JSON representation of traversal steps
    propagation_rule = Column(String(100), nullable=False)
    rationale = Column(Text, nullable=False)
    verification_action = Column(Text, nullable=False)
    unresolved_uncertainty = Column(Text, default="", nullable=False)
    baseline_revision_snapshot = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    change_request = relationship("ChangeRequest", back_populates="impact_results")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    failure_mode = Column(String(200), nullable=False)
    effect = Column(Text, nullable=False)
    cause = Column(Text, nullable=False)
    severity = Column(Integer, nullable=False)  # 1-10
    occurrence = Column(Integer, nullable=False)  # 1-10
    detection = Column(Integer, nullable=False)  # 1-10
    rpn = Column(Integer, nullable=False)  # S * O * D
    high_severity_flag = Column(Boolean, default=False, nullable=False)  # S >= 8
    mitigation = Column(Text, nullable=False)
    accountable_owner = Column(String(100), nullable=False)
    residual_severity = Column(Integer, nullable=False)
    residual_occurrence = Column(Integer, nullable=False)
    residual_detection = Column(Integer, nullable=False)
    residual_rpn = Column(Integer, nullable=False)
    rubric_version = Column(String(50), default="v2.0-aiag-vda-adapted", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    change_request = relationship("ChangeRequest", back_populates="risk_assessments")


class VerificationRequirement(Base):
    __tablename__ = "verification_requirements"

    id = Column(String(50), primary_key=True)  # e.g., "VR-001"
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    requirement_code = Column(String(50), nullable=False)  # e.g., "REQ-QUAL-01"
    title = Column(String(200), nullable=False)
    requirement_type = Column(String(50), nullable=False)  # MATERIAL_QUALIFICATION, TORQUE_INSPECTION, PRESSURE_PROOF_TEST, SEAL_LEAK_TEST, INDEPENDENT_QA_REVIEW
    applicability_rule = Column(String(150), nullable=False)
    acceptance_criteria = Column(Text, nullable=False)
    mandatory = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, ACCEPTED, REJECTED, INCOMPLETE, WAIVED
    created_at = Column(DateTime(timezone=True), default=utc_now)

    change_request = relationship("ChangeRequest", back_populates="verification_requirements")
    evidence_records = relationship("EvidenceRecord", back_populates="requirement")


class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id = Column(String(50), primary_key=True)  # e.g., "EV-001"
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    requirement_id = Column(String(50), ForeignKey("verification_requirements.id"), nullable=False)
    evidence_type = Column(String(50), nullable=False)  # TEST_REPORT, CALIBRATION_CERT, INSPECTION_RECORD, MATERIAL_CERT_CMTR, FEA_SIMULATION
    source_reference = Column(String(150), nullable=False)
    document_revision = Column(String(20), nullable=False)
    file_name = Column(String(150), nullable=False)
    file_hash = Column(String(64), nullable=False)  # SHA-256
    file_size_bytes = Column(Integer, default=0, nullable=False)
    verification_status = Column(String(50), default="PENDING_REVIEW", nullable=False)  # ACCEPTED, REJECTED, PENDING_REVIEW, EXPIRED, INVALID
    verified_by_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, default="", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    change_request = relationship("ChangeRequest", back_populates="evidence_records")
    requirement = relationship("VerificationRequirement", back_populates="evidence_records")
    verified_by = relationship("User")


class QualityGateEvaluation(Base):
    __tablename__ = "quality_gate_evaluations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    gate_name = Column(String(50), nullable=False)  # IMPACT_GATE, PRE_AUTHORIZATION_GATE, PRE_IMPLEMENTATION_GATE, CLOSURE_GATE
    overall_result = Column(String(50), nullable=False)  # PASS, BLOCKED, REVIEW_REQUIRED, NOT_APPLICABLE
    evaluated_at = Column(DateTime(timezone=True), default=utc_now)
    evaluated_by_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    details_json = Column(Text, nullable=False)  # Detailed list of checks evaluated
    blocking_reasons_json = Column(Text, nullable=False)  # Explicit reasons why blocked
    corrective_actions_json = Column(Text, nullable=False)  # Explicit steps to unblock

    change_request = relationship("ChangeRequest", back_populates="gate_evaluations")
    evaluated_by = relationship("User")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    reviewer_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    reviewer_role = Column(String(50), nullable=False)
    decision = Column(String(50), nullable=False)  # APPROVED, REJECTED, RETURNED_FOR_REVISION
    rationale = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utc_now)

    change_request = relationship("ChangeRequest", back_populates="approvals")
    reviewer = relationship("User", back_populates="approvals")


class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=False)
    actor_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)  # SUBMIT, RUN_IMPACT, APPROVE, REJECT, TRANSITION, UPLOAD_EVIDENCE
    previous_state = Column(String(50), nullable=False)
    new_state = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utc_now)
    metadata_json = Column(Text, default="{}", nullable=False)

    change_request = relationship("ChangeRequest", back_populates="workflow_events")
    actor = relationship("User", back_populates="workflow_events")


class ReportRun(Base):
    __tablename__ = "report_runs"

    id = Column(String(50), primary_key=True)  # e.g., "RPT-2026-0001"
    report_type = Column(String(50), nullable=False)  # CHANGE_ASSESSMENT, MANAGEMENT_REVIEW
    change_request_id = Column(String(50), ForeignKey("change_requests.id"), nullable=True)
    template_version = Column(String(50), default="1.0.0", nullable=False)
    source_snapshot_hash = Column(String(64), nullable=False)
    generated_at = Column(DateTime(timezone=True), default=utc_now)
    generated_by_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    file_path_pdf = Column(String(255), nullable=True)
    file_path_docx = Column(String(255), nullable=True)
    file_path_xlsx = Column(String(255), nullable=True)
    file_path_csv = Column(String(255), nullable=True)
    summary_json = Column(Text, default="{}", nullable=False)

    change_request = relationship("ChangeRequest")
    generated_by = relationship("User")


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String(50), primary_key=True)
    test_id = Column(String(100), nullable=False)  # e.g., "AC-01", "AC-02"
    test_suite = Column(String(100), nullable=False)
    software_version = Column(String(50), nullable=False)
    expected_result = Column(Text, nullable=False)
    actual_result = Column(Text, nullable=False)
    outcome = Column(String(20), nullable=False)  # PASS, FAIL
    execution_time_ms = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
