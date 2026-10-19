import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# --- User Schemas ---
class UserBase(BaseModel):
    id: str
    username: str
    display_name: str
    role: str  # REQUESTER, ENGINEER_QA, APPROVER, AUDITOR
    email: str
    active: bool = True

class UserResponse(UserBase):
    created_at: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Baseline & Configuration Item Schemas ---
class ConfigurationItemBase(BaseModel):
    id: str
    part_number: str
    name: str
    item_type: str  # COMPONENT, SPECIFICATION, PROCESS, INSPECTION, TEST
    revision: str
    description: Optional[str] = None
    lifecycle_status: str = "RELEASED"
    criticality: str = "STANDARD"
    metadata_json: Optional[str] = "{}"

class ConfigurationItemResponse(ConfigurationItemBase):
    baseline_id: str
    model_config = ConfigDict(from_attributes=True)

class DependencyBase(BaseModel):
    source_id: str
    target_id: str
    relationship_type: str
    validity_interval: str = "ALWAYS"
    active: bool = True

class DependencyResponse(DependencyBase):
    id: int
    baseline_id: str
    model_config = ConfigDict(from_attributes=True)

class ConfigurationBaselineResponse(BaseModel):
    id: str
    name: str
    version: str
    status: str
    description: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    items: List[ConfigurationItemResponse] = []
    dependencies: List[DependencyResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- Change Items & Requests ---
class ChangeItemCreate(BaseModel):
    affected_object_id: str
    field_name: str
    proposed_operation: str = "MODIFY"  # MODIFY, ADD, DELETE, REPLACE
    current_value: str
    proposed_value: str
    justification: Optional[str] = None

class ChangeItemResponse(ChangeItemCreate):
    id: int
    change_request_id: str
    model_config = ConfigDict(from_attributes=True)

class ChangeRequestCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    reason: str = Field(..., min_length=10)
    change_type: str  # MATERIAL_SUBSTITUTION, DESIGN_REVISION, PROCESS_CHANGE, FASTENER_REVISION
    requester_id: str
    baseline_id: str
    priority: str = "HIGH"
    change_items: List[ChangeItemCreate] = []

class ChangeRequestUpdate(BaseModel):
    title: Optional[str] = None
    reason: Optional[str] = None
    priority: Optional[str] = None

# --- Impact Results ---
class ImpactPathStep(BaseModel):
    from_node: str
    from_name: str
    relationship: str
    to_node: str
    to_name: str
    rule_applied: str

class ImpactResultResponse(BaseModel):
    id: int
    change_request_id: str
    algorithm_version: str
    impacted_object_id: str
    impacted_object_name: str
    impacted_object_type: str
    classification: str  # DIRECTLY_CHANGED, POTENTIALLY_IMPACTED, VERIFICATION_REQUIRED, UNAFFECTED
    path_json: str
    propagation_rule: str
    rationale: str
    verification_action: str
    unresolved_uncertainty: str
    baseline_revision_snapshot: str
    created_at: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Risk (FMEA) Schemas ---
class RiskAssessmentCreate(BaseModel):
    failure_mode: str
    effect: str
    cause: str
    severity: int = Field(..., ge=1, le=10)
    occurrence: int = Field(..., ge=1, le=10)
    detection: int = Field(..., ge=1, le=10)
    mitigation: str
    accountable_owner: str
    residual_severity: int = Field(..., ge=1, le=10)
    residual_occurrence: int = Field(..., ge=1, le=10)
    residual_detection: int = Field(..., ge=1, le=10)

class RiskAssessmentResponse(RiskAssessmentCreate):
    id: int
    change_request_id: str
    rpn: int
    high_severity_flag: bool
    residual_rpn: int
    rubric_version: str
    created_at: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Verification Requirements & Evidence ---
class VerificationRequirementResponse(BaseModel):
    id: str
    change_request_id: str
    requirement_code: str
    title: str
    requirement_type: str
    applicability_rule: str
    acceptance_criteria: str
    mandatory: bool
    status: str
    created_at: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

class EvidenceRecordCreate(BaseModel):
    requirement_id: str
    evidence_type: str  # TEST_REPORT, CALIBRATION_CERT, INSPECTION_RECORD, MATERIAL_CERT_CMTR, FEA_SIMULATION
    source_reference: str
    document_revision: str
    file_name: str
    file_content_base64: Optional[str] = None
    notes: Optional[str] = ""

class EvidenceRecordResponse(BaseModel):
    id: str
    change_request_id: str
    requirement_id: str
    evidence_type: str
    source_reference: str
    document_revision: str
    file_name: str
    file_hash: str
    file_size_bytes: int
    verification_status: str
    verified_by_id: Optional[str] = None
    verified_at: Optional[datetime.datetime] = None
    notes: str
    created_at: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Quality Gate Evaluations ---
class QualityGateEvaluationResponse(BaseModel):
    id: int
    change_request_id: str
    gate_name: str
    overall_result: str  # PASS, BLOCKED, REVIEW_REQUIRED, NOT_APPLICABLE
    evaluated_at: Optional[datetime.datetime] = None
    evaluated_by_id: Optional[str] = None
    details_json: str
    blocking_reasons_json: str
    corrective_actions_json: str
    model_config = ConfigDict(from_attributes=True)

# --- Approvals & Workflow ---
class ApprovalRequest(BaseModel):
    reviewer_id: str
    decision: str  # APPROVED, REJECTED, RETURNED_FOR_REVISION
    rationale: str

class ApprovalResponse(BaseModel):
    id: int
    change_request_id: str
    reviewer_id: str
    reviewer_role: str
    decision: str
    rationale: str
    timestamp: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

class TransitionRequest(BaseModel):
    actor_id: str
    target_state: str
    reason: str

class WorkflowEventResponse(BaseModel):
    id: int
    change_request_id: str
    actor_id: str
    actor_role: str
    action: str
    previous_state: str
    new_state: str
    reason: str
    timestamp: Optional[datetime.datetime] = None
    metadata_json: str
    model_config = ConfigDict(from_attributes=True)

# --- Full Change Request Detail ---
class ChangeRequestDetailResponse(BaseModel):
    id: str
    title: str
    reason: str
    change_type: str
    requester_id: str
    baseline_id: str
    proposed_baseline_id: Optional[str] = None
    state: str
    priority: str
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    requester: Optional[UserResponse] = None
    change_items: List[ChangeItemResponse] = []
    impact_results: List[ImpactResultResponse] = []
    risk_assessments: List[RiskAssessmentResponse] = []
    verification_requirements: List[VerificationRequirementResponse] = []
    evidence_records: List[EvidenceRecordResponse] = []
    gate_evaluations: List[QualityGateEvaluationResponse] = []
    approvals: List[ApprovalResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- Report Models ---
class ReportRunResponse(BaseModel):
    id: str
    report_type: str
    change_request_id: Optional[str] = None
    template_version: str
    source_snapshot_hash: str
    generated_at: Optional[datetime.datetime] = None
    generated_by_id: str
    file_path_pdf: Optional[str] = None
    file_path_docx: Optional[str] = None
    file_path_xlsx: Optional[str] = None
    file_path_csv: Optional[str] = None
    summary_json: str
    model_config = ConfigDict(from_attributes=True)
