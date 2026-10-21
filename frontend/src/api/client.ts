import {
  MOCK_USERS,
  MOCK_BASELINE,
  MOCK_CHANGE_REQUESTS,
  MOCK_METRICS,
  MOCK_RISK_LANDSCAPE,
  MOCK_BOTTLENECK_DATA,
  MOCK_CYCLE_DATA,
  MOCK_EVIDENCE_DATA,
  MOCK_AUDIT_TRAIL,
  MOCK_REPORTS
} from './mockData';

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
  distance_from_source: number;
  traversal_path: string;
  impact_classification: string;
  rationale: string;
  created_at?: string;
  classification?: string;
  propagation_rule?: string;
  verification_action?: string;
  path_json?: string;
  unresolved_uncertainty?: string;
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
  action_priority: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation: string;
  status: string;
  high_severity_flag?: boolean;
  accountable_owner?: string;
  residual_rpn?: number;
  residual_severity?: number;
  residual_occurrence?: number;
  residual_detection?: number;
}

export interface VerificationRequirement {
  id: string;
  change_request_id: string;
  requirement_type: string;
  target_object_id: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  mandatory: boolean;
  source_rule: string;
  status?: string;
  requirement_code?: string;
  applicability_rule?: string;
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

// In-memory simulation state for offline showcase mode
let localChanges = [...MOCK_CHANGE_REQUESTS];
let localReports = [...MOCK_REPORTS];
let localAuditTrail = [...MOCK_AUDIT_TRAIL];
let isLiveBackend = true;

// Helper to fetch with timeout and fallback
async function safeFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    isLiveBackend = true;
    return await res.json();
  } catch (err) {
    isLiveBackend = false;
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const api = {
  getIsLiveBackend: () => isLiveBackend,

  // Baselines
  getBaselines: async (): Promise<ConfigurationBaseline[]> => {
    return safeFetch(`${API_BASE}/baselines`, undefined, [MOCK_BASELINE]);
  },
  getBaselineGraph: async (baselineId: string) => {
    return safeFetch(`${API_BASE}/baselines/${baselineId}/graph`, undefined, {
      nodes: MOCK_BASELINE.items.map((i) => ({
        id: i.id,
        label: `${i.part_number} (${i.name})`,
        item_type: i.item_type,
        criticality: i.criticality,
        revision: i.revision
      })),
      edges: MOCK_BASELINE.dependencies.map((d) => ({
        source: d.source_id,
        target: d.target_id,
        relationship: d.relationship_type
      }))
    });
  },

  // Change Requests
  listChangeRequests: async (): Promise<ChangeRequest[]> => {
    return safeFetch(`${API_BASE}/changes`, undefined, localChanges);
  },
  getChangeRequest: async (id: string): Promise<ChangeRequest> => {
    const fallback = localChanges.find((c) => c.id === id) || localChanges[0];
    return safeFetch(`${API_BASE}/changes/${id}`, undefined, fallback);
  },
  createChangeRequest: async (payload: any): Promise<ChangeRequest> => {
    try {
      const res = await fetch(`${API_BASE}/changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create change request');
      return await res.json();
    } catch {
      const newCR: ChangeRequest = {
        id: `CCR-2026-000${localChanges.length + 1}`,
        title: payload.title,
        reason: payload.reason,
        change_type: payload.change_type || 'ENGINEERING_CHANGE',
        requester_id: payload.requester_id || 'usr-lead-eng',
        baseline_id: payload.baseline_id || 'BASE-737-9-DOORPLUG-A',
        state: 'DRAFT',
        priority: payload.priority || 'MEDIUM',
        created_at: new Date().toISOString(),
        change_items: [],
        impact_results: [],
        risk_assessments: [],
        verification_requirements: [],
        evidence_records: [],
        gate_evaluations: [],
        approvals: []
      };
      localChanges = [newCR, ...localChanges];
      return newCR;
    }
  },

  // Impact Engine
  runImpactAnalysis: async (changeId: string, actorId: string = 'usr-qa-mgr'): Promise<ImpactResult[]> => {
    try {
      const res = await fetch(`${API_BASE}/changes/${changeId}/impact-analysis?actor_id=${actorId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to run impact analysis');
      return await res.json();
    } catch {
      const targetCR = localChanges.find((c) => c.id === changeId);
      return targetCR?.impact_results || MOCK_CHANGE_REQUESTS[0].impact_results;
    }
  },
  getImpactResults: async (changeId: string): Promise<ImpactResult[]> => {
    const targetCR = localChanges.find((c) => c.id === changeId);
    const fallback = targetCR?.impact_results || MOCK_CHANGE_REQUESTS[0].impact_results;
    return safeFetch(`${API_BASE}/changes/${changeId}/impact`, undefined, fallback);
  },

  // Risk Engine
  getRisks: async (changeId: string): Promise<RiskAssessment[]> => {
    const targetCR = localChanges.find((c) => c.id === changeId);
    const fallback = targetCR?.risk_assessments || MOCK_CHANGE_REQUESTS[0].risk_assessments;
    return safeFetch(`${API_BASE}/changes/${changeId}/risk-assessment`, undefined, fallback);
  },
  addRisk: async (changeId: string, payload: any, actorId: string = 'usr-lead-eng'): Promise<RiskAssessment> => {
    try {
      const res = await fetch(`${API_BASE}/changes/${changeId}/risk-assessment?actor_id=${actorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to add risk assessment');
      return await res.json();
    } catch {
      const rpn = payload.severity * payload.occurrence * payload.detection;
      const newRisk: RiskAssessment = {
        id: Math.floor(Math.random() * 1000) + 10,
        change_request_id: changeId,
        failure_mode: payload.failure_mode,
        effect: payload.effect,
        cause: payload.cause,
        severity: payload.severity,
        occurrence: payload.occurrence,
        detection: payload.detection,
        rpn,
        action_priority: payload.severity >= 8 || rpn >= 100 ? 'HIGH' : rpn >= 60 ? 'MEDIUM' : 'LOW',
        mitigation: payload.mitigation,
        status: 'ACTIVE'
      };
      return newRisk;
    }
  },

  // Evidence & Gates
  getRequirements: async (changeId: string): Promise<VerificationRequirement[]> => {
    const targetCR = localChanges.find((c) => c.id === changeId);
    const fallback = targetCR?.verification_requirements || MOCK_CHANGE_REQUESTS[0].verification_requirements;
    return safeFetch(`${API_BASE}/evidence/${changeId}/requirements`, undefined, fallback);
  },
  getEvidenceRecords: async (changeId: string): Promise<EvidenceRecord[]> => {
    const targetCR = localChanges.find((c) => c.id === changeId);
    const fallback = targetCR?.evidence_records || MOCK_CHANGE_REQUESTS[0].evidence_records;
    return safeFetch(`${API_BASE}/evidence/${changeId}/records`, undefined, fallback);
  },
  uploadEvidence: async (changeId: string, payload: any, actorId: string = 'usr-lead-eng'): Promise<EvidenceRecord> => {
    try {
      const res = await fetch(`${API_BASE}/evidence/${changeId}/records?actor_id=${actorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to upload evidence');
      return await res.json();
    } catch {
      const newEvd: EvidenceRecord = {
        id: `EVD-2026-${Math.floor(Math.random() * 900) + 100}`,
        change_request_id: changeId,
        requirement_id: payload.requirement_id,
        evidence_type: payload.evidence_type || 'TEST_RECORD',
        source_reference: payload.source_reference || 'REF-AUTO-UPLOAD',
        document_revision: payload.document_revision || 'Rev A',
        file_name: payload.file_name || 'evidence_document.pdf',
        file_hash: payload.file_hash || '7d9b2a1c4e6f8a0b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1',
        file_size_bytes: payload.file_size_bytes || 245760,
        verification_status: 'PENDING_REVIEW',
        notes: payload.notes || 'Uploaded via client simulation'
      };
      return newEvd;
    }
  },
  verifyEvidence: async (evidenceId: string, status: string, reviewerId: string = 'usr-qa-mgr', notes: string = ''): Promise<EvidenceRecord> => {
    try {
      const res = await fetch(`${API_BASE}/evidence/records/${evidenceId}/verify?status=${status}&reviewer_id=${reviewerId}&notes=${encodeURIComponent(notes)}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to verify evidence');
      return await res.json();
    } catch {
      return {
        id: evidenceId,
        change_request_id: 'CCR-2026-0001',
        requirement_id: 'REQ-CCR-2026-0001-01',
        evidence_type: 'TEST_RECORD',
        source_reference: 'CAL-TORQUE-2026',
        document_revision: 'Rev A',
        file_name: 'torque_calibration_log.pdf',
        file_hash: '9f8e7d6c5b4a3b2c1d0e1f2a3b4c5d6e',
        file_size_bytes: 198000,
        verification_status: status as any,
        verified_by_id: reviewerId,
        verified_at: new Date().toISOString(),
        notes: notes || 'Verified in simulation'
      };
    }
  },
  getGateEvaluation: async (changeId: string, gateName: string = 'PRE_AUTHORIZATION_GATE'): Promise<QualityGateEvaluation> => {
    const targetCR = localChanges.find((c) => c.id === changeId);
    const fallback = targetCR?.gate_evaluations[0] || MOCK_CHANGE_REQUESTS[0].gate_evaluations[0];
    return safeFetch(`${API_BASE}/evidence/${changeId}/gate-evaluation?gate_name=${gateName}`, undefined, fallback);
  },

  // Governance
  listUsers: async (): Promise<User[]> => {
    return safeFetch(`${API_BASE}/governance/users`, undefined, MOCK_USERS);
  },
  getAuditTrail: async (changeId: string): Promise<WorkflowEvent[]> => {
    return safeFetch(`${API_BASE}/governance/${changeId}/audit`, undefined, localAuditTrail);
  },
  submitDecision: async (changeId: string, payload: { reviewer_id: string; decision: string; rationale: string }): Promise<Approval> => {
    try {
      const res = await fetch(`${API_BASE}/governance/${changeId}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to submit decision');
      return await res.json();
    } catch {
      const reviewer = MOCK_USERS.find((u) => u.id === payload.reviewer_id) || MOCK_USERS[2];
      const newApproval: Approval = {
        id: Math.floor(Math.random() * 1000) + 1,
        change_request_id: changeId,
        reviewer_id: payload.reviewer_id,
        reviewer_role: reviewer.role,
        decision: payload.decision as any,
        rationale: payload.rationale,
        timestamp: new Date().toISOString()
      };
      // Record audit event in simulation
      localAuditTrail.push({
        id: localAuditTrail.length + 1,
        change_request_id: changeId,
        actor_id: payload.reviewer_id,
        actor_role: reviewer.role,
        action: payload.decision,
        previous_state: 'UNDER_REVIEW',
        new_state: payload.decision === 'APPROVED' ? 'AUTHORIZED' : 'REJECTED',
        reason: payload.rationale,
        timestamp: new Date().toISOString(),
        metadata_json: '{}'
      });
      return newApproval;
    }
  },
  transitionState: async (changeId: string, payload: { actor_id: string; target_state: string; reason: string }) => {
    try {
      const res = await fetch(`${API_BASE}/governance/${changeId}/transitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to transition state');
      return await res.json();
    } catch {
      const target = localChanges.find((c) => c.id === changeId);
      if (target) target.state = payload.target_state;
      return { success: true, new_state: payload.target_state };
    }
  },

  // Reports
  listReports: async (changeId?: string): Promise<ReportRun[]> => {
    const url = changeId ? `${API_BASE}/reports?change_id=${changeId}` : `${API_BASE}/reports`;
    return safeFetch(url, undefined, localReports);
  },
  generateChangeAssessment: async (changeId: string, actorId: string = 'usr-lead-eng'): Promise<ReportRun> => {
    try {
      const res = await fetch(`${API_BASE}/reports/change-assessment/${changeId}?actor_id=${actorId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed to generate report');
      return await res.json();
    } catch {
      const newReport: ReportRun = {
        id: `RPT-${changeId}-${Date.now().toString(36)}`,
        report_type: 'CHANGE_ASSESSMENT',
        change_request_id: changeId,
        template_version: '2026.1-FAA-COMPLIANT',
        source_snapshot_hash: Math.random().toString(16).substring(2, 10),
        generated_at: new Date().toISOString(),
        generated_by_id: actorId,
        file_path_pdf: `storage/reports/${changeId}-Assessment.pdf`,
        file_path_docx: `storage/reports/${changeId}-Assessment.docx`,
        file_path_xlsx: `storage/reports/${changeId}-Assessment.xlsx`,
        file_path_csv: `storage/reports/${changeId}-Assessment.csv`,
        summary_json: JSON.stringify({
          title: `${changeId} Change Impact & Gate Assessment Dossier`,
          gate_status: changeId === 'CCR-2026-0001' ? 'BLOCKED' : 'PASS',
          generated_mode: 'Interactive Showcase Engine'
        })
      };
      localReports = [newReport, ...localReports];
      return newReport;
    }
  },
  getDownloadUrl: (reportId: string, format: string) => `${API_BASE}/reports/${reportId}/download/${format}`,

  // Analytics
  getOverviewMetrics: async (): Promise<OverviewMetrics> => {
    return safeFetch(`${API_BASE}/analytics/overview`, undefined, MOCK_METRICS);
  },
  getRiskLandscape: async (): Promise<any[]> => {
    return safeFetch(`${API_BASE}/analytics/risk-landscape`, undefined, MOCK_RISK_LANDSCAPE);
  },
  getGateBottlenecks: async (): Promise<any[]> => {
    return safeFetch(`${API_BASE}/analytics/gate-bottlenecks`, undefined, MOCK_BOTTLENECK_DATA);
  },
  getReviewCycleTrends: async (): Promise<any[]> => {
    return safeFetch(`${API_BASE}/analytics/review-cycle-trends`, undefined, MOCK_CYCLE_DATA);
  },
  getEvidenceCompleteness: async (): Promise<any[]> => {
    return safeFetch(`${API_BASE}/analytics/evidence-completeness`, undefined, MOCK_EVIDENCE_DATA);
  }
};
