export interface User {
  id: string;
  username: string;
  display_name: string;
  role: 'REQUESTER' | 'ENGINEER_QA' | 'APPROVER' | 'AUDITOR';
  email: string;
  active: boolean;
}

export interface ConfigurationItem {
  id: string;
  baseline_id: string;
  part_number: string;
  name: string;
  item_type: 'COMPONENT' | 'SPECIFICATION' | 'PROCESS' | 'INSPECTION' | 'TEST';
  revision: string;
  description?: string;
  lifecycle_status: string;
  criticality: 'CRITICAL' | 'MAJOR' | 'STANDARD';
  metadata_json: string;
}

export interface Dependency {
  id: number;
  baseline_id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  validity_interval: string;
  active: boolean;
}

export interface ConfigurationBaseline {
  id: string;
  name: string;
  version: string;
  status: string;
  description?: string;
  items: ConfigurationItem[];
  dependencies: Dependency[];
}

export interface ChangeItem {
  id: number;
  change_request_id: string;
  affected_object_id: string;
  field_name: string;
  proposed_operation: string;
  current_value: string;
  proposed_value: string;
  justification?: string;
}

export interface ImpactResult {
  id: number;
  change_request_id: string;
  algorithm_version: string;
  impacted_object_id: string;
  impacted_object_name: string;
  impacted_object_type: string;
  classification: 'DIRECTLY_CHANGED' | 'POTENTIALLY_IMPACTED' | 'VERIFICATION_REQUIRED' | 'UNAFFECTED';
  path_json: string;
  propagation_rule: string;
  rationale: string;
  verification_action: string;
  unresolved_uncertainty: string;
  baseline_revision_snapshot: string;
  created_at?: string;
}

export interface RiskAssessment {
  id: number;
  change_request_id: string;
  failure_mode: string;
  effect: string;
  cause: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  high_severity_flag: boolean;
  mitigation: string;
  accountable_owner: string;
  residual_severity: number;
  residual_occurrence: number;
  residual_detection: number;
  residual_rpn: number;
  rubric_version: string;
}

export interface VerificationRequirement {
  id: string;
  change_request_id: string;
  requirement_code: string;
  title: string;
  requirement_type: string;
  applicability_rule: string;
  acceptance_criteria: string;
  mandatory: boolean;
  status: string;
}

export interface EvidenceRecord {
  id: string;
  change_request_id: string;
  requirement_id: string;
  evidence_type: string;
  source_reference: string;
  document_revision: string;
  file_name: string;
  file_hash: string;
  file_size_bytes: number;
  verification_status: 'ACCEPTED' | 'REJECTED' | 'PENDING_REVIEW' | 'EXPIRED' | 'INVALID';
  verified_by_id?: string;
  verified_at?: string;
  notes: string;
}

export interface QualityGateEvaluation {
  id: number;
  change_request_id: string;
  gate_name: string;
  overall_result: 'PASS' | 'BLOCKED' | 'REVIEW_REQUIRED' | 'NOT_APPLICABLE';
  evaluated_at?: string;
  evaluated_by_id?: string;
  details_json: string;
  blocking_reasons_json: string;
  corrective_actions_json: string;
}

export interface Approval {
  id: number;
  change_request_id: string;
  reviewer_id: string;
  reviewer_role: string;
  decision: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION';
  rationale: string;
  timestamp?: string;
}

export interface WorkflowEvent {
  id: number;
  change_request_id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  previous_state: string;
  new_state: string;
  reason: string;
  timestamp?: string;
  metadata_json: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  reason: string;
  change_type: string;
  requester_id: string;
  baseline_id: string;
  proposed_baseline_id?: string;
  state: string;
  priority: string;
  created_at?: string;
  updated_at?: string;
  requester?: User;
  change_items: ChangeItem[];
  impact_results: ImpactResult[];
  risk_assessments: RiskAssessment[];
  verification_requirements: VerificationRequirement[];
  evidence_records: EvidenceRecord[];
  gate_evaluations: QualityGateEvaluation[];
  approvals: Approval[];
}

export interface ReportRun {
  id: string;
  report_type: string;
  change_request_id?: string;
  template_version: string;
  source_snapshot_hash: string;
  generated_at?: string;
  generated_by_id: string;
  file_path_pdf?: string;
  file_path_docx?: string;
  file_path_xlsx?: string;
  file_path_csv?: string;
  summary_json: string;
}

export interface OverviewMetrics {
  total_changes: number;
  blocked_changes: number;
  in_review: number;
  closed_changes: number;
  high_severity_risks: number;
  total_risks: number;
  total_mandatory_requirements: number;
  accepted_evidence_records: number;
  evidence_completeness_rate_pct: number;
  median_cycle_time_hours: number;
  sample_size_evaluated: number;
}

const API_BASE = '/api/v1';

export const api = {
  // Baselines
  getBaselines: async (): Promise<ConfigurationBaseline[]> => {
    const res = await fetch(`${API_BASE}/baselines`);
    return res.json();
  },
  getBaselineGraph: async (baselineId: string) => {
    const res = await fetch(`${API_BASE}/baselines/${baselineId}/graph`);
    return res.json();
  },

  // Change Requests
  listChangeRequests: async (): Promise<ChangeRequest[]> => {
    const res = await fetch(`${API_BASE}/changes`);
    return res.json();
  },
  getChangeRequest: async (id: string): Promise<ChangeRequest> => {
    const res = await fetch(`${API_BASE}/changes/${id}`);
    return res.json();
  },
  createChangeRequest: async (payload: any): Promise<ChangeRequest> => {
    const res = await fetch(`${API_BASE}/changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create change request');
    return res.json();
  },

  // Impact Engine
  runImpactAnalysis: async (changeId: string, actorId: string = 'usr-qa-mgr'): Promise<ImpactResult[]> => {
    const res = await fetch(`${API_BASE}/changes/${changeId}/impact-analysis?actor_id=${actorId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to run impact analysis');
    return res.json();
  },
  getImpactResults: async (changeId: string): Promise<ImpactResult[]> => {
    const res = await fetch(`${API_BASE}/changes/${changeId}/impact`);
    return res.json();
  },

  // Risk Engine
  getRisks: async (changeId: string): Promise<RiskAssessment[]> => {
    const res = await fetch(`${API_BASE}/changes/${changeId}/risk-assessment`);
    return res.json();
  },
  addRisk: async (changeId: string, payload: any, actorId: string = 'usr-lead-eng'): Promise<RiskAssessment> => {
    const res = await fetch(`${API_BASE}/changes/${changeId}/risk-assessment?actor_id=${actorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to add risk assessment');
    return res.json();
  },

  // Evidence & Gates
  getRequirements: async (changeId: string): Promise<VerificationRequirement[]> => {
    const res = await fetch(`${API_BASE}/evidence/${changeId}/requirements`);
    return res.json();
  },
  getEvidenceRecords: async (changeId: string): Promise<EvidenceRecord[]> => {
    const res = await fetch(`${API_BASE}/evidence/${changeId}/records`);
    return res.json();
  },
  uploadEvidence: async (changeId: string, payload: any, actorId: string = 'usr-lead-eng'): Promise<EvidenceRecord> => {
    const res = await fetch(`${API_BASE}/evidence/${changeId}/records?actor_id=${actorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to upload evidence');
    return res.json();
  },
  verifyEvidence: async (evidenceId: string, status: string, reviewerId: string = 'usr-qa-mgr', notes: string = ''): Promise<EvidenceRecord> => {
    const res = await fetch(`${API_BASE}/evidence/records/${evidenceId}/verify?status=${status}&reviewer_id=${reviewerId}&notes=${encodeURIComponent(notes)}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to verify evidence');
    return res.json();
  },
  getGateEvaluation: async (changeId: string, gateName: string = 'PRE_AUTHORIZATION_GATE'): Promise<QualityGateEvaluation> => {
    const res = await fetch(`${API_BASE}/evidence/${changeId}/gate-evaluation?gate_name=${gateName}`);
    return res.json();
  },

  // Governance
  listUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/governance/users`);
    return res.json();
  },
  getAuditTrail: async (changeId: string): Promise<WorkflowEvent[]> => {
    const res = await fetch(`${API_BASE}/governance/${changeId}/audit`);
    return res.json();
  },
  submitDecision: async (changeId: string, payload: { reviewer_id: string; decision: string; rationale: string }): Promise<Approval> => {
    const res = await fetch(`${API_BASE}/governance/${changeId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to submit decision');
    return res.json();
  },
  transitionState: async (changeId: string, payload: { actor_id: string; target_state: string; reason: string }) => {
    const res = await fetch(`${API_BASE}/governance/${changeId}/transitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to transition state');
    return res.json();
  },

  // Reports
  listReports: async (changeId?: string): Promise<ReportRun[]> => {
    const url = changeId ? `${API_BASE}/reports?change_id=${changeId}` : `${API_BASE}/reports`;
    const res = await fetch(url);
    return res.json();
  },
  generateChangeAssessment: async (changeId: string, actorId: string = 'usr-lead-eng'): Promise<ReportRun> => {
    const res = await fetch(`${API_BASE}/reports/change-assessment/${changeId}?actor_id=${actorId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to generate report');
    return res.json();
  },
  getDownloadUrl: (reportId: string, format: string) => `${API_BASE}/reports/${reportId}/download/${format}`,

  // Analytics
  getOverviewMetrics: async (): Promise<OverviewMetrics> => {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    return res.json();
  },
  getRiskLandscape: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/analytics/risk-landscape`);
    return res.json();
  },
  getGateBottlenecks: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/analytics/gate-bottlenecks`);
    return res.json();
  },
  getReviewCycleTrends: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/analytics/review-cycle-trends`);
    return res.json();
  },
  getEvidenceCompleteness: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/analytics/evidence-completeness`);
    return res.json();
  }
};
