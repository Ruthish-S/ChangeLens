import { 
  User, 
  ConfigurationBaseline, 
  ChangeRequest, 
  ImpactResult, 
  RiskAssessment, 
  VerificationRequirement, 
  EvidenceRecord, 
  QualityGateEvaluation, 
  WorkflowEvent, 
  ReportRun, 
  OverviewMetrics 
} from './client';

export const MOCK_USERS: User[] = [
  {
    id: "usr-lead-eng",
    username: "mvance",
    display_name: "Marcus Vance (PE)",
    role: "REQUESTER",
    email: "m.vance@aerocraft.com",
    active: true
  },
  {
    id: "usr-qa-mgr",
    username: "erostova",
    display_name: "Dr. Elena Rostova",
    role: "ENGINEER_QA",
    email: "e.rostova@aerocraft.com",
    active: true
  },
  {
    id: "usr-chief-eng",
    username: "apendelton",
    display_name: "Arthur Pendelton",
    role: "APPROVER",
    email: "a.pendelton@aerocraft.com",
    active: true
  },
  {
    id: "usr-auditor",
    username: "slin",
    display_name: "Sarah Lin",
    role: "AUDITOR",
    email: "s.lin@aerocraft.com",
    active: true
  }
];

export const MOCK_BASELINE: ConfigurationBaseline = {
  id: "BASE-737-9-DOORPLUG-A",
  name: "Boeing 737-9 MAX Station 500 Mid-Exit Door Plug Baseline",
  version: "Rev A.1",
  status: "ACTIVE",
  description: "Production configuration baseline for the Station 500 MED plug assembly, stop fittings, retaining pins, and pressure boundaries.",
  items: [
    { id: "C-101", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0101", name: "Fuselage Station 500 Frame Assembly", item_type: "COMPONENT", revision: "Rev A", description: "Primary fuselage ring frame and pressure bulkhead interface.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "C-102", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0102", name: "Upper Guide Track Assembly", item_type: "COMPONENT", revision: "Rev A", description: "Overhead roller guide track ensuring vertical displacement arrest.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "C-103", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0103", name: "Lower Hinge Fitting Assembly", item_type: "COMPONENT", revision: "Rev A", description: "Lower pivot hinge supporting plug weight during maintenance opening.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "C-104", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0104", name: "Mid-Exit Door Plug Panel", item_type: "COMPONENT", revision: "Rev A", description: "De-activated emergency exit plug structure sealing cabin pressure.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "C-105", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0105", name: "Upper Guide Pin & Retaining Bolt Assembly", item_type: "COMPONENT", revision: "Rev A", description: "Four critical securing bolts and cotter pins preventing upward disengagement.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "C-106", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0106", name: "Lower Hinge Pin & Arrestor Assembly", item_type: "COMPONENT", revision: "Rev A", description: "Lower retaining pins with positive locking hardware.", lifecycle_status: "RELEASED", criticality: "MAJOR", metadata_json: "{}" },
    { id: "C-107", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0107", name: "Stop Pad / Fitting Alignment Shims", item_type: "COMPONENT", revision: "Rev A", description: "12 load-bearing stop pads bearing outward pressurization loads against frame.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "C-108", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "DWG-737-53-0108", name: "Perimeter Pressure Relief & Environmental Seal", item_type: "COMPONENT", revision: "Rev A", description: "Elastomeric continuous bulb seal maintaining cabin pressurization.", lifecycle_status: "RELEASED", criticality: "MAJOR", metadata_json: "{}" },
    { id: "S-201", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "SPEC-AMS-250-11", name: "Material Alloy Spec AMS-QQ-A-250/11", item_type: "SPECIFICATION", revision: "Rev B", description: "High-strength aluminum alloy 7075-T651 plate specification.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "S-202", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "SPEC-BAC-5001-4", name: "Fastener Installation & Torque Spec BAC-5001-4", item_type: "SPECIFICATION", revision: "Rev C", description: "Torque ranges, thread engagement, and safety lockwire standards.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "S-203", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "SPEC-BAC-5400-A", name: "Door Rigging & Stop Pad Clearance Standard", item_type: "SPECIFICATION", revision: "Rev A", description: "Allowable gap tolerances between door stop fittings and fuselage pins.", lifecycle_status: "RELEASED", criticality: "MAJOR", metadata_json: "{}" },
    { id: "P-301", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "SOP-737-44-01", name: "Door Plug Opening & Removal Procedure", item_type: "PROCESS", revision: "Rev A", description: "Work traveler authorization for opening plug to repair cabin interior defects.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "P-302", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "SOP-737-44-09", name: "Retaining Bolt Installation & Lockwire Procedure", item_type: "PROCESS", revision: "Rev B", description: "Torque application, cotter pin insertion, and dual QA stamp required.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "P-303", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "SOP-737-53-12", name: "Cabin Pressure Boundary Sealing & Inspection", item_type: "PROCESS", revision: "Rev C", description: "Pressure test chamber verification and mastic sealant application.", lifecycle_status: "RELEASED", criticality: "MAJOR", metadata_json: "{}" },
    { id: "I-401", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "INSP-737-001", name: "Visual Bolt Installation & Cotter Pin Inspection", item_type: "INSPECTION", revision: "Rev A", description: "Independent visual verification that 4 retaining bolts and safety pins are installed.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "I-402", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "INSP-737-002", name: "Stop Fitting Clearance Feeler Gauge Inspection", item_type: "INSPECTION", revision: "Rev A", description: "12-point clearance check to verify equal contact on fuselage frame lugs.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "I-403", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "INSP-737-003", name: "Mastic Seal Continuity & Adhesion Inspection", item_type: "INSPECTION", revision: "Rev A", description: "Continuous bead inspection for acoustic and pressure seal integrity.", lifecycle_status: "RELEASED", criticality: "STANDARD", metadata_json: "{}" },
    { id: "T-501", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "TEST-FAA-25-807", name: "Fuselage Station 500 Proof Pressure Differential Test", item_type: "TEST", revision: "Rev A", description: "Cabin proof pressurization to 1.33x max operating differential (9.2 psid).", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" },
    { id: "T-502", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "TEST-BOE-53-VIB", name: "Door Plug Acoustic Vibration & Flutter Verification", item_type: "TEST", revision: "Rev A", description: "Dynamic response resonance testing under simulated transonic cruise.", lifecycle_status: "RELEASED", criticality: "MAJOR", metadata_json: "{}" },
    { id: "T-503", baseline_id: "BASE-737-9-DOORPLUG-A", part_number: "TEST-BOE-TORQ-VER", name: "Fastener Torque & Pin Retention Calibration Verification", item_type: "TEST", revision: "Rev B", description: "Calibrated wrench verification of fastener seating torque and cotter engagement.", lifecycle_status: "RELEASED", criticality: "CRITICAL", metadata_json: "{}" }
  ],
  dependencies: [
    { id: 1, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-104", target_id: "C-101", relationship_type: "ASSEMBLED_INTO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 2, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-105", target_id: "C-102", relationship_type: "MATES_WITH", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 3, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-105", target_id: "C-104", relationship_type: "FASTENED_TO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 4, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-106", target_id: "C-103", relationship_type: "MATES_WITH", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 5, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-106", target_id: "C-104", relationship_type: "FASTENED_TO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 6, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-107", target_id: "C-104", relationship_type: "ASSEMBLED_INTO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 7, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-108", target_id: "C-104", relationship_type: "ASSEMBLED_INTO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 8, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-104", target_id: "S-201", relationship_type: "CONFORMS_TO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 9, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-105", target_id: "S-202", relationship_type: "CONFORMS_TO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 10, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-107", target_id: "S-203", relationship_type: "CONFORMS_TO", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 11, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "P-301", target_id: "C-104", relationship_type: "OPERATES_ON", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 12, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "P-302", target_id: "C-105", relationship_type: "OPERATES_ON", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 13, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "P-303", target_id: "C-108", relationship_type: "OPERATES_ON", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 14, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "I-401", target_id: "P-302", relationship_type: "INSPECTS", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 15, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "I-402", target_id: "C-107", relationship_type: "INSPECTS", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 16, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "I-403", target_id: "C-108", relationship_type: "INSPECTS", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 17, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-104", target_id: "T-501", relationship_type: "VERIFIED_BY", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 18, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-104", target_id: "T-502", relationship_type: "VERIFIED_BY", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 19, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-105", target_id: "T-503", relationship_type: "VERIFIED_BY", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 20, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "C-107", target_id: "T-501", relationship_type: "VERIFIED_BY", validity_interval: "2026-01-01 to infinity", active: true },
    { id: 21, baseline_id: "BASE-737-9-DOORPLUG-A", source_id: "P-302", target_id: "S-202", relationship_type: "CONFORMS_TO", validity_interval: "2026-01-01 to infinity", active: true }
  ]
};

export const MOCK_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: "CCR-2026-0001",
    title: "Fuselage Station 500 Door Plug Rework & Retaining Pin Re-installation Protocol",
    reason: "Correct cabin interior seal installation defect requiring opening and re-closing mid-exit plug panel during final fuselage assembly.",
    change_type: "DESIGN_MODIFICATION",
    requester_id: "usr-lead-eng",
    baseline_id: "BASE-737-9-DOORPLUG-A",
    state: "IMPACT_ASSESSED",
    priority: "HIGH",
    created_at: "2026-10-18T14:30:00Z",
    updated_at: "2026-10-19T09:15:00Z",
    requester: MOCK_USERS[0],
    change_items: [
      {
        id: 1,
        change_request_id: "CCR-2026-0001",
        affected_object_id: "C-105",
        field_name: "installation_procedure_revision",
        proposed_operation: "MODIFY",
        current_value: "SOP-737-44-09 Rev A (Single sign-off)",
        proposed_value: "SOP-737-44-09 Rev B (Mandatory dual-stamp QA & torque verification)",
        justification: "NTSB preliminary findings indicate 4 retaining bolts were not reinstalled after interior insulation rework."
      },
      {
        id: 2,
        change_request_id: "CCR-2026-0001",
        affected_object_id: "S-202",
        field_name: "safety_lockwire_requirement",
        proposed_operation: "MODIFY",
        current_value: "Optional secondary locking",
        proposed_value: "Mandatory positive locking cotter pin with calibrated torque seal striping",
        justification: "Eliminate risk of bolt disengagement under cyclic cabin pressurization loads."
      }
    ],
    impact_results: [
      { id: 1, change_request_id: "CCR-2026-0001", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "C-105", impacted_object_name: "Upper Guide Pin & Retaining Bolt Assembly", impacted_object_type: "COMPONENT", distance_from_source: 0, traversal_path: "C-105", impact_classification: "DIRECT_PRIMARY", rationale: "Directly specified in change request scope items.", created_at: "2026-10-18T14:35:00Z" },
      { id: 2, change_request_id: "CCR-2026-0001", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "S-202", impacted_object_name: "Fastener Installation & Torque Spec BAC-5001-4", impacted_object_type: "SPECIFICATION", distance_from_source: 0, traversal_path: "S-202", impact_classification: "DIRECT_PRIMARY", rationale: "Directly specified in change request scope items.", created_at: "2026-10-18T14:35:00Z" },
      { id: 3, change_request_id: "CCR-2026-0001", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "P-302", impacted_object_name: "Retaining Bolt Installation & Lockwire Procedure", impacted_object_type: "PROCESS", distance_from_source: 1, traversal_path: "C-105 <- P-302", impact_classification: "DIRECT_PRIMARY", rationale: "Process operates directly on modified component C-105.", created_at: "2026-10-18T14:35:00Z" },
      { id: 4, change_request_id: "CCR-2026-0001", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "C-102", impacted_object_name: "Upper Guide Track Assembly", impacted_object_type: "COMPONENT", distance_from_source: 1, traversal_path: "C-105 -> C-102", impact_classification: "COUPLED_SECONDARY", rationale: "Mates directly with guide pin; upward arrest depends on bolt retention.", created_at: "2026-10-18T14:35:00Z" },
      { id: 5, change_request_id: "CCR-2026-0001", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "C-104", impacted_object_name: "Mid-Exit Door Plug Panel", impacted_object_type: "COMPONENT", distance_from_source: 1, traversal_path: "C-105 -> C-104", impact_classification: "COUPLED_SECONDARY", rationale: "Plug panel vertical upward disengagement arrested by retaining bolts.", created_at: "2026-10-18T14:35:00Z" },
      { id: 6, change_request_id: "CCR-2026-0001", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "I-401", impacted_object_name: "Visual Bolt Installation & Cotter Pin Inspection", impacted_object_type: "INSPECTION", distance_from_source: 2, traversal_path: "C-105 <- P-302 <- I-401", impact_classification: "VERIFICATION_SCOPE", rationale: "Inspection required to verify P-302 procedure compliance.", created_at: "2026-10-18T14:35:00Z" },
      { id: 7, change_request_id: "CCR-2026-0001", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "T-503", impacted_object_name: "Fastener Torque & Pin Retention Calibration Verification", impacted_object_type: "TEST", distance_from_source: 1, traversal_path: "C-105 -> T-503", impact_classification: "VERIFICATION_SCOPE", rationale: "Direct verification test for C-105 fastener retention.", created_at: "2026-10-18T14:35:00Z" }
    ],
    risk_assessments: [
      {
        id: 1,
        change_request_id: "CCR-2026-0001",
        failure_mode: "Failure to reinstall 4 retaining bolts during door opening traveler rework",
        effect: "Plug translates upward under cyclic cabin pressurization, disengaging stop fittings and causing rapid explosive decompression at altitude.",
        cause: "Informal door opening without formal manufacturing traveler or independent QA inspection sign-off.",
        severity: 10,
        occurrence: 4,
        detection: 7,
        rpn: 280,
        action_priority: "HIGH",
        mitigation: "Mandatory digital traveler gate requiring photo evidence, calibrated torque logs, and dual QA stamp before pressure testing.",
        status: "ACTIVE"
      },
      {
        id: 2,
        change_request_id: "CCR-2026-0001",
        failure_mode: "Incorrect bolt torque causing premature thread fatigue or stripping",
        effect: "Bolt shears under dynamic acoustic flutter and aerodynamic turbulence.",
        cause: "Uncalibrated manual wrench used on assembly station floor.",
        severity: 9,
        occurrence: 3,
        detection: 5,
        rpn: 135,
        action_priority: "HIGH",
        mitigation: "Calibrated digital torque tool with Bluetooth telemetry logged directly to manufacturing execution system (BAC-5001-4).",
        status: "ACTIVE"
      },
      {
        id: 3,
        change_request_id: "CCR-2026-0001",
        failure_mode: "Cotter pin omission on upper guide pin retaining nuts",
        effect: "Nut vibrates loose over 1,500 flight cycles; bolt migrates out of guide track bracket.",
        cause: "Insufficient visual lighting and restricted access during cabin interior insulation installation.",
        severity: 9,
        occurrence: 3,
        detection: 6,
        rpn: 162,
        action_priority: "HIGH",
        mitigation: "Color-coded visual inspection standard (INSP-737-001) and borescope photo upload to gate checklist.",
        status: "ACTIVE"
      }
    ],
    verification_requirements: [
      {
        id: "REQ-CCR-2026-0001-01",
        change_request_id: "CCR-2026-0001",
        requirement_type: "TEST",
        target_object_id: "T-503",
        title: "Calibrated Torque Tool Verification Log",
        description: "Recorded digital torque values for all 4 retaining bolts confirming compliance with BAC-5001-4.",
        acceptance_criteria: "Torque 125-140 in-lbs recorded with serialized calibrated tool ID.",
        mandatory: true,
        source_rule: "RISK_SEV_ESCALATION"
      },
      {
        id: "REQ-CCR-2026-0001-02",
        change_request_id: "CCR-2026-0001",
        requirement_type: "INSPECTION",
        target_object_id: "I-401",
        title: "Independent Quality Stamp & Photo Evidence",
        description: "Dual QA stamp confirming physical presence of 4 bolts and installed cotter pins.",
        acceptance_criteria: "High-resolution digital photo showing all 4 pinned locations signed by Level II QA inspector.",
        mandatory: true,
        source_rule: "RISK_SEV_ESCALATION"
      },
      {
        id: "REQ-CCR-2026-0001-03",
        change_request_id: "CCR-2026-0001",
        requirement_type: "PROCESS",
        target_object_id: "P-302",
        title: "Work Traveler Sign-Off SOP-737-44-09",
        description: "Closed traveler document certifying door plug re-installation completed per revision B.",
        acceptance_criteria: "Complete traveler record with technician signature and timestamp.",
        mandatory: true,
        source_rule: "WORKFLOW_GATE"
      }
    ],
    evidence_records: [
      {
        id: "EVD-2026-001",
        change_request_id: "CCR-2026-0001",
        requirement_id: "REQ-CCR-2026-0001-03",
        evidence_type: "PROCESS_TRAVELER",
        source_reference: "TRAVELER-STATION500-2026-0412",
        document_revision: "Rev B",
        file_name: "traveler_station500_closure_signed.pdf",
        file_hash: "8f4a1e9c2b3d5f7a0e1c2d3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f",
        file_size_bytes: 428192,
        verification_status: "ACCEPTED",
        verified_by_id: "usr-qa-mgr",
        verified_at: "2026-10-18T16:45:00Z",
        notes: "Work traveler verified closed with technician timestamp and supervisor endorsement."
      }
    ],
    gate_evaluations: [
      {
        id: 1,
        change_request_id: "CCR-2026-0001",
        gate_name: "PRE_AUTHORIZATION_GATE",
        overall_result: "BLOCKED",
        evaluated_at: "2026-10-19T09:30:00Z",
        evaluated_by_id: "usr-qa-mgr",
        details_json: JSON.stringify({
          mandatory_requirements_total: 3,
          evidence_provided: 1,
          accepted_evidence: 1,
          missing_or_unaccepted: 2,
          high_severity_risks_unmitigated: 0
        }),
        blocking_reasons_json: JSON.stringify([
          "Mandatory requirement [REQ-CCR-2026-0001-01] (Calibrated Torque Tool Verification Log) has no accepted evidence on file.",
          "Mandatory requirement [REQ-CCR-2026-0001-02] (Independent Quality Stamp & Photo Evidence) has no accepted evidence on file."
        ]),
        corrective_actions_json: JSON.stringify([
          "Upload serialized torque telemetry log meeting BAC-5001-4 specifications to REQ-CCR-2026-0001-01.",
          "Provide dual-stamped QA inspection certificate and photo confirmation to REQ-CCR-2026-0001-02."
        ])
      }
    ],
    approvals: []
  },
  {
    id: "CCR-2026-0002",
    title: "Standard Fastener Revision for Lower Hinge Bracket Assembly",
    reason: "Supplier obsolescence substitution of standard NAS aerospace washer on lower pivot hinge assembly.",
    change_type: "FASTENER_SUBSTITUTION",
    requester_id: "usr-lead-eng",
    baseline_id: "BASE-737-9-DOORPLUG-A",
    state: "UNDER_REVIEW",
    priority: "MEDIUM",
    created_at: "2026-10-17T10:00:00Z",
    updated_at: "2026-10-18T11:00:00Z",
    requester: MOCK_USERS[0],
    change_items: [
      {
        id: 3,
        change_request_id: "CCR-2026-0002",
        affected_object_id: "C-106",
        field_name: "washer_part_specification",
        proposed_operation: "SUBSTITUTE",
        current_value: "NAS1149F0463P",
        proposed_value: "NAS1149F0463M (Passivated stainless steel alternate)",
        justification: "Equivalent shear and galvanic corrosion resistance per MIL-STD-1312."
      }
    ],
    impact_results: [
      { id: 8, change_request_id: "CCR-2026-0002", algorithm_version: "NetworkX-BFS-v2.1", impacted_object_id: "C-106", impacted_object_name: "Lower Hinge Pin & Arrestor Assembly", impacted_object_type: "COMPONENT", distance_from_source: 0, traversal_path: "C-106", impact_classification: "DIRECT_PRIMARY", rationale: "Directly specified in change request scope items.", created_at: "2026-10-17T10:05:00Z" }
    ],
    risk_assessments: [
      {
        id: 4,
        change_request_id: "CCR-2026-0002",
        failure_mode: "Galvanic corrosion between stainless washer and 7075-T6 aluminum hinge lug",
        effect: "Local surface oxidation requiring premature overhaul during C-check inspection.",
        cause: "Electrochemical potential difference in marine / humid operating environments.",
        severity: 4,
        occurrence: 3,
        detection: 3,
        rpn: 36,
        action_priority: "LOW",
        mitigation: "Apply zinc chromate primer per BAC-5710 before fastener installation.",
        status: "ACTIVE"
      }
    ],
    verification_requirements: [
      {
        id: "REQ-CCR-2026-0002-01",
        change_request_id: "CCR-2026-0002",
        requirement_type: "SPECIFICATION",
        target_object_id: "C-106",
        title: "Material Conformity Certificate NAS1149F0463M",
        description: "Supplier mill test certificate verifying chemical composition and passivation.",
        acceptance_criteria: "Certified test report compliant with AMS-QQ-P-35.",
        mandatory: true,
        source_rule: "STANDARD_QA"
      }
    ],
    evidence_records: [
      {
        id: "EVD-2026-002",
        change_request_id: "CCR-2026-0002",
        requirement_id: "REQ-CCR-2026-0002-01",
        evidence_type: "CERTIFICATE_OF_CONFORMANCE",
        source_reference: "COC-AERO-FAST-8841",
        document_revision: "Rev 1",
        file_name: "coc_nas1149_passivated_certified.pdf",
        file_hash: "3b7c9a1d2e5f8a0b1c4d7e9f2a5b8c1d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b",
        file_size_bytes: 184512,
        verification_status: "ACCEPTED",
        verified_by_id: "usr-qa-mgr",
        verified_at: "2026-10-17T14:20:00Z",
        notes: "Mill certificate verified; chemical passivation confirmed."
      }
    ],
    gate_evaluations: [
      {
        id: 2,
        change_request_id: "CCR-2026-0002",
        gate_name: "PRE_AUTHORIZATION_GATE",
        overall_result: "PASS",
        evaluated_at: "2026-10-18T10:30:00Z",
        evaluated_by_id: "usr-qa-mgr",
        details_json: JSON.stringify({
          mandatory_requirements_total: 1,
          evidence_provided: 1,
          accepted_evidence: 1,
          missing_or_unaccepted: 0,
          high_severity_risks_unmitigated: 0
        }),
        blocking_reasons_json: "[]",
        corrective_actions_json: "[]"
      }
    ],
    approvals: [
      {
        id: 1,
        change_request_id: "CCR-2026-0002",
        reviewer_id: "usr-chief-eng",
        reviewer_role: "APPROVER",
        decision: "APPROVED",
        rationale: "Fastener substitution verified equivalent; corrosion mitigation acceptable. Compliant with separation of duties.",
        timestamp: "2026-10-18T11:00:00Z"
      }
    ]
  }
];

export const MOCK_METRICS: OverviewMetrics = {
  total_changes: 2,
  blocked_changes: 1,
  in_review: 1,
  closed_changes: 0,
  high_severity_risks: 3,
  total_risks: 4,
  total_mandatory_requirements: 4,
  accepted_evidence_records: 2,
  evidence_completeness_rate_pct: 50.0,
  median_cycle_time_hours: 18.5,
  sample_size_evaluated: 2
};

export const MOCK_RISK_LANDSCAPE = [
  { failure_mode: "Reinstall 4 retaining bolts", severity: 10, occurrence: 4, detection: 7, rpn: 280, action_priority: "HIGH", change_id: "CCR-2026-0001" },
  { failure_mode: "Incorrect bolt torque", severity: 9, occurrence: 3, detection: 5, rpn: 135, action_priority: "HIGH", change_id: "CCR-2026-0001" },
  { failure_mode: "Cotter pin omission", severity: 9, occurrence: 3, detection: 6, rpn: 162, action_priority: "HIGH", change_id: "CCR-2026-0001" },
  { failure_mode: "Galvanic corrosion on washer", severity: 4, occurrence: 3, detection: 3, rpn: 36, action_priority: "LOW", change_id: "CCR-2026-0002" }
];

export const MOCK_BOTTLENECK_DATA = [
  { gate_name: "Baseline Integrity", pass_count: 2, blocked_count: 0 },
  { gate_name: "Impact Analysis", pass_count: 2, blocked_count: 0 },
  { gate_name: "FMEA Risk Scoring", pass_count: 2, blocked_count: 0 },
  { gate_name: "Evidence Verification", pass_count: 1, blocked_count: 1 },
  { gate_name: "Independent QA", pass_count: 1, blocked_count: 1 },
  { gate_name: "Chief Eng Release", pass_count: 1, blocked_count: 1 }
];

export const MOCK_CYCLE_DATA = [
  { stage: "Draft to Impact", hours: 4.2 },
  { stage: "Impact to Risk", hours: 6.8 },
  { stage: "Risk to Evidence", hours: 24.5 },
  { stage: "Evidence to QA", hours: 12.0 },
  { stage: "QA to Release", hours: 8.3 }
];

export const MOCK_EVIDENCE_DATA = [
  { category: "CRITICAL Components", mandatory: 3, accepted: 1, missing: 2 },
  { category: "MAJOR Assembly", mandatory: 1, accepted: 1, missing: 0 },
  { category: "STANDARD Fasteners", mandatory: 0, accepted: 0, missing: 0 }
];

export const MOCK_AUDIT_TRAIL: WorkflowEvent[] = [
  {
    id: 1,
    change_request_id: "CCR-2026-0001",
    actor_id: "usr-lead-eng",
    actor_role: "REQUESTER",
    action: "CREATED",
    previous_state: "NONE",
    new_state: "DRAFT",
    reason: "Initial submission of Station 500 rework protocol.",
    timestamp: "2026-10-18T14:30:00Z",
    metadata_json: "{}"
  },
  {
    id: 2,
    change_request_id: "CCR-2026-0001",
    actor_id: "usr-qa-mgr",
    actor_role: "ENGINEER_QA",
    action: "IMPACT_ANALYSIS_COMPLETED",
    previous_state: "DRAFT",
    new_state: "IMPACT_ASSESSED",
    reason: "NetworkX BFS traversal mapped 7 affected nodes across 3 degrees of separation.",
    timestamp: "2026-10-18T14:35:00Z",
    metadata_json: "{}"
  },
  {
    id: 3,
    change_request_id: "CCR-2026-0001",
    actor_id: "usr-qa-mgr",
    actor_role: "ENGINEER_QA",
    action: "QUALITY_GATE_EVALUATED",
    previous_state: "IMPACT_ASSESSED",
    new_state: "IMPACT_ASSESSED",
    reason: "Quality gate evaluated: BLOCKED due to 2 missing mandatory verification records.",
    timestamp: "2026-10-19T09:30:00Z",
    metadata_json: "{}"
  }
];

export const MOCK_REPORTS: ReportRun[] = [
  {
    id: "RPT-CCR-2026-0001-202610190950",
    report_type: "CHANGE_ASSESSMENT",
    change_request_id: "CCR-2026-0001",
    template_version: "2026.1-FAA-COMPLIANT",
    source_snapshot_hash: "a4f8c2e1b3d5",
    generated_at: "2026-10-19T09:50:00Z",
    generated_by_id: "usr-lead-eng",
    file_path_pdf: "storage/reports/CCR-2026-0001-Assessment.pdf",
    file_path_docx: "storage/reports/CCR-2026-0001-Assessment.docx",
    file_path_xlsx: "storage/reports/CCR-2026-0001-Assessment.xlsx",
    file_path_csv: "storage/reports/CCR-2026-0001-Assessment.csv",
    summary_json: JSON.stringify({
      title: "CCR-2026-0001 Engineering Change Assessment",
      decision_recommendation: "DO_NOT_AUTHORIZE",
      gate_status: "BLOCKED",
      risk_items_evaluated: 3,
      highest_rpn: 280
    })
  }
];
