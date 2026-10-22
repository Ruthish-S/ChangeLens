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
    "id": "CCR-2026-0001",
    "title": "Fuselage Station 500 Door Plug Rework & Retaining Pin Re-installation Protocol",
    "reason": "Correct cabin interior seal installation defect requiring opening and re-closing mid-exit plug panel during final fuselage assembly.",
    "change_type": "DESIGN_MODIFICATION",
    "requester_id": "usr-lead-eng",
    "baseline_id": "BASE-737-9-DOORPLUG-A",
    "state": "IMPACT_ASSESSED",
    "priority": "HIGH",
    "industry": "AEROSPACE",
    "compliance_standard": "FAA AC-05 / AS9100 Rev D",
    "target_system": "Boeing 737-9 MAX Mid-Exit Door Plug",
    "created_at": "2026-10-18T14:30:00Z",
    "updated_at": "2026-10-19T09:15:00Z",
    "requester": {
      "id": "usr-lead-eng",
      "username": "mvance",
      "display_name": "Marcus Vance (PE)",
      "role": "REQUESTER",
      "email": "m.vance@aerocraft.com",
      "active": true
    },
    "change_items": [
      {
        "id": 1,
        "change_request_id": "CCR-2026-0001",
        "affected_object_id": "C-105",
        "field_name": "installation_procedure_revision",
        "proposed_operation": "MODIFY",
        "current_value": "SOP-737-44-09 Rev A (Single sign-off)",
        "proposed_value": "SOP-737-44-09 Rev B (Mandatory dual-stamp QA & torque verification)",
        "justification": "NTSB findings indicate 4 retaining bolts were not reinstalled after interior insulation rework."
      },
      {
        "id": 2,
        "change_request_id": "CCR-2026-0001",
        "affected_object_id": "S-202",
        "field_name": "safety_lockwire_requirement",
        "proposed_operation": "MODIFY",
        "current_value": "Optional secondary locking",
        "proposed_value": "Mandatory positive locking cotter pin with calibrated torque seal striping",
        "justification": "Eliminate risk of bolt disengagement under cyclic cabin pressurization loads."
      }
    ],
    "impact_results": [
      {
        "id": 1,
        "change_request_id": "CCR-2026-0001",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "C-105",
        "impacted_object_name": "Upper Guide Pin & Retaining Bolt Assembly",
        "impacted_object_type": "COMPONENT",
        "distance_from_source": 0,
        "traversal_path": "C-105",
        "impact_classification": "DIRECT_PRIMARY",
        "rationale": "Directly specified in change request scope items.",
        "created_at": "2026-10-18T14:35:00Z"
      },
      {
        "id": 2,
        "change_request_id": "CCR-2026-0001",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "S-202",
        "impacted_object_name": "Fastener Installation & Torque Spec BAC-5001-4",
        "impacted_object_type": "SPECIFICATION",
        "distance_from_source": 0,
        "traversal_path": "S-202",
        "impact_classification": "DIRECT_PRIMARY",
        "rationale": "Directly specified in change request scope items.",
        "created_at": "2026-10-18T14:35:00Z"
      },
      {
        "id": 3,
        "change_request_id": "CCR-2026-0001",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "P-302",
        "impacted_object_name": "Retaining Bolt Installation & Lockwire Procedure",
        "impacted_object_type": "PROCESS",
        "distance_from_source": 1,
        "traversal_path": "C-105 <- P-302",
        "impact_classification": "DIRECT_PRIMARY",
        "rationale": "Process operates directly on modified component C-105.",
        "created_at": "2026-10-18T14:35:00Z"
      },
      {
        "id": 4,
        "change_request_id": "CCR-2026-0001",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "C-102",
        "impacted_object_name": "Upper Guide Track Assembly",
        "impacted_object_type": "COMPONENT",
        "distance_from_source": 1,
        "traversal_path": "C-105 -> C-102",
        "impact_classification": "COUPLED_SECONDARY",
        "rationale": "Mates directly with guide pin; upward arrest depends on bolt retention.",
        "created_at": "2026-10-18T14:35:00Z"
      },
      {
        "id": 5,
        "change_request_id": "CCR-2026-0001",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "C-104",
        "impacted_object_name": "Mid-Exit Door Plug Panel",
        "impacted_object_type": "COMPONENT",
        "distance_from_source": 1,
        "traversal_path": "C-105 -> C-104",
        "impact_classification": "COUPLED_SECONDARY",
        "rationale": "Plug panel vertical upward disengagement arrested by retaining bolts.",
        "created_at": "2026-10-18T14:35:00Z"
      },
      {
        "id": 6,
        "change_request_id": "CCR-2026-0001",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "I-401",
        "impacted_object_name": "Visual Bolt Installation & Cotter Pin Inspection",
        "impacted_object_type": "INSPECTION",
        "distance_from_source": 2,
        "traversal_path": "C-105 <- P-302 <- I-401",
        "impact_classification": "VERIFICATION_SCOPE",
        "rationale": "Inspection required to verify P-302 procedure compliance.",
        "created_at": "2026-10-18T14:35:00Z"
      },
      {
        "id": 7,
        "change_request_id": "CCR-2026-0001",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "T-503",
        "impacted_object_name": "Fastener Torque & Pin Retention Calibration Verification",
        "impacted_object_type": "TEST",
        "distance_from_source": 1,
        "traversal_path": "C-105 -> T-503",
        "impact_classification": "VERIFICATION_SCOPE",
        "rationale": "Direct verification test for C-105 fastener retention.",
        "created_at": "2026-10-18T14:35:00Z"
      }
    ],
    "risk_assessments": [
      {
        "id": 1,
        "change_request_id": "CCR-2026-0001",
        "failure_mode": "Failure to reinstall 4 retaining bolts during door opening traveler rework",
        "effect": "Plug translates upward under cyclic cabin pressurization, disengaging stop fittings and causing rapid explosive decompression at altitude.",
        "cause": "Informal door opening without formal manufacturing traveler or independent QA inspection sign-off.",
        "severity": 10,
        "occurrence": 4,
        "detection": 7,
        "rpn": 280,
        "action_priority": "HIGH",
        "mitigation": "Mandatory digital traveler gate requiring photo evidence, calibrated torque logs, and dual QA stamp before pressure testing.",
        "status": "ACTIVE",
        "high_severity_flag": true,
        "accountable_owner": "Chief Airframe Engineer"
      },
      {
        "id": 2,
        "change_request_id": "CCR-2026-0001",
        "failure_mode": "Incorrect bolt torque causing premature thread fatigue or stripping",
        "effect": "Bolt shears under dynamic acoustic flutter and aerodynamic turbulence.",
        "cause": "Uncalibrated manual wrench used on assembly station floor.",
        "severity": 9,
        "occurrence": 3,
        "detection": 5,
        "rpn": 135,
        "action_priority": "HIGH",
        "mitigation": "Calibrated digital torque tool with Bluetooth telemetry logged directly to manufacturing execution system (BAC-5001-4).",
        "status": "ACTIVE",
        "high_severity_flag": true,
        "accountable_owner": "Lead Fastener Specialist"
      },
      {
        "id": 3,
        "change_request_id": "CCR-2026-0001",
        "failure_mode": "Cotter pin omission on upper guide pin retaining nuts",
        "effect": "Nut vibrates loose over 1,500 flight cycles; bolt migrates out of guide track bracket.",
        "cause": "Insufficient visual lighting and restricted access during cabin interior insulation installation.",
        "severity": 9,
        "occurrence": 3,
        "detection": 6,
        "rpn": 162,
        "action_priority": "HIGH",
        "mitigation": "Color-coded visual inspection standard (INSP-737-001) and borescope photo upload to gate checklist.",
        "status": "ACTIVE",
        "high_severity_flag": true,
        "accountable_owner": "Lead QA Inspector"
      }
    ],
    "verification_requirements": [
      {
        "id": "REQ-CCR-2026-0001-01",
        "change_request_id": "CCR-2026-0001",
        "requirement_type": "TEST",
        "target_object_id": "T-503",
        "title": "Calibrated Torque Tool Verification Log",
        "description": "Recorded digital torque values for all 4 retaining bolts confirming compliance with BAC-5001-4.",
        "acceptance_criteria": "Torque 160-190 in-lbs recorded with serialized calibrated tool ID.",
        "mandatory": true,
        "source_rule": "RISK_SEV_ESCALATION"
      },
      {
        "id": "REQ-CCR-2026-0001-02",
        "change_request_id": "CCR-2026-0001",
        "requirement_type": "INSPECTION",
        "target_object_id": "I-401",
        "title": "Independent Quality Stamp & Photo Evidence",
        "description": "Dual QA stamp confirming physical presence of 4 bolts and installed cotter pins.",
        "acceptance_criteria": "High-resolution digital photo showing all 4 pinned locations signed by Level II QA inspector.",
        "mandatory": true,
        "source_rule": "RISK_SEV_ESCALATION"
      },
      {
        "id": "REQ-CCR-2026-0001-03",
        "change_request_id": "CCR-2026-0001",
        "requirement_type": "PROCESS",
        "target_object_id": "P-302",
        "title": "Work Traveler Sign-Off SOP-737-44-09",
        "description": "Closed traveler document certifying door plug re-installation completed per revision B.",
        "acceptance_criteria": "Complete traveler record with technician signature and timestamp.",
        "mandatory": true,
        "source_rule": "WORKFLOW_GATE"
      }
    ],
    "evidence_records": [
      {
        "id": "EVD-2026-001",
        "change_request_id": "CCR-2026-0001",
        "requirement_id": "REQ-CCR-2026-0001-03",
        "evidence_type": "PROCESS_TRAVELER",
        "source_reference": "TRAVELER-STATION500-2026-0412",
        "document_revision": "Rev B",
        "file_name": "traveler_station500_closure_signed.pdf",
        "file_hash": "8f4a1e9c2b3d5f7a0e1c2d3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f",
        "file_size_bytes": 428192,
        "verification_status": "ACCEPTED",
        "verified_by_id": "usr-qa-mgr",
        "verified_at": "2026-10-18T16:45:00Z",
        "notes": "Work traveler verified closed with technician timestamp and supervisor endorsement."
      }
    ],
    "gate_evaluations": [
      {
        "id": 1,
        "change_request_id": "CCR-2026-0001",
        "gate_name": "PRE_AUTHORIZATION_GATE",
        "overall_result": "BLOCKED",
        "evaluated_at": "2026-10-19T09:30:00Z",
        "evaluated_by_id": "usr-qa-mgr",
        "details_json": "{\"mandatory_requirements_total\": 3, \"evidence_provided\": 1, \"accepted_evidence\": 1, \"missing_or_unaccepted\": 2, \"high_severity_risks_unmitigated\": 0}",
        "blocking_reasons_json": "[\"Mandatory requirement [REQ-CCR-2026-0001-01] (Calibrated Torque Tool Verification Log) has no accepted evidence on file.\", \"Mandatory requirement [REQ-CCR-2026-0001-02] (Independent Quality Stamp & Photo Evidence) has no accepted evidence on file.\"]",
        "corrective_actions_json": "[\"Upload serialized torque telemetry log meeting BAC-5001-4 specifications to REQ-CCR-2026-0001-01.\", \"Provide dual-stamped QA inspection certificate and photo confirmation to REQ-CCR-2026-0001-02.\"]"
      }
    ],
    "approvals": []
  },
  {
    "id": "ECO-2026-0814",
    "title": "High-Voltage EV Battery Pack Busbar Insulation & Thermal Runaway Barrier Revision",
    "reason": "Mitigate cell-to-cell thermal propagation risk in 800V silicon-carbide architecture under UN 38.3 vibration profile.",
    "change_type": "MATERIAL_SUBSTITUTION",
    "requester_id": "usr-lead-eng",
    "baseline_id": "BASE-EV-BATTERY-800V",
    "state": "AUTHORIZED",
    "priority": "HIGH",
    "industry": "AUTOMOTIVE",
    "compliance_standard": "ISO 26262 ASIL-D / IATF 16949",
    "target_system": "800V High-Voltage Battery Module",
    "created_at": "2026-10-15T08:00:00Z",
    "updated_at": "2026-10-17T11:20:00Z",
    "requester": {
      "id": "usr-lead-eng",
      "username": "mvance",
      "display_name": "Marcus Vance (PE)",
      "role": "REQUESTER",
      "email": "m.vance@aerocraft.com",
      "active": true
    },
    "change_items": [
      {
        "id": 10,
        "change_request_id": "ECO-2026-0814",
        "affected_object_id": "B-301",
        "field_name": "thermal_barrier_material",
        "proposed_operation": "SUBSTITUTE",
        "current_value": "Nomex 410 (0.25mm, dielectric breakdown 18 kV/mm)",
        "proposed_value": "Ceramic Aerogel Composite (1.0mm, dielectric breakdown 32 kV/mm)",
        "justification": "Prevent cascade cell rupture during fast DC charging at 350 kW."
      }
    ],
    "impact_results": [
      {
        "id": 11,
        "change_request_id": "ECO-2026-0814",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "B-301",
        "impacted_object_name": "Module Cell Interconnect Busbar",
        "impacted_object_type": "COMPONENT",
        "distance_from_source": 0,
        "traversal_path": "B-301",
        "impact_classification": "DIRECT_PRIMARY",
        "rationale": "Primary modified component.",
        "created_at": "2026-10-15T08:05:00Z"
      },
      {
        "id": 12,
        "change_request_id": "ECO-2026-0814",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "S-901",
        "impacted_object_name": "Dielectric Isolation Specification IEC 60664",
        "impacted_object_type": "SPECIFICATION",
        "distance_from_source": 1,
        "traversal_path": "B-301 -> S-901",
        "impact_classification": "VERIFICATION_SCOPE",
        "rationale": "Dielectric test mandatory for ASIL-D rating.",
        "created_at": "2026-10-15T08:05:00Z"
      }
    ],
    "risk_assessments": [
      {
        "id": 13,
        "change_request_id": "ECO-2026-0814",
        "failure_mode": "Dielectric punch-through during regenerative braking surge",
        "effect": "High-voltage chassis short circuit resulting in pyrotechnic fuse blow.",
        "cause": "Aerogel compression tolerance stack-up during pack enclosure assembly.",
        "severity": 8,
        "occurrence": 2,
        "detection": 4,
        "rpn": 64,
        "action_priority": "MEDIUM",
        "mitigation": "Automated 2,500V Hi-Pot isolation test on end-of-line jig.",
        "status": "ACTIVE",
        "high_severity_flag": true,
        "accountable_owner": "High-Voltage Safety Lead"
      }
    ],
    "verification_requirements": [
      {
        "id": "REQ-ECO-0814-01",
        "change_request_id": "ECO-2026-0814",
        "requirement_type": "TEST",
        "target_object_id": "T-801",
        "title": "2,500V DC Hi-Pot Dielectric Leakage Test",
        "description": "Verify leakage current under 0.5 mA across all 16 busbar cell connections.",
        "acceptance_criteria": "Zero breakdown at 2.5 kV for 60 seconds.",
        "mandatory": true,
        "source_rule": "ISO_26262_ASIL_D"
      }
    ],
    "evidence_records": [
      {
        "id": "EVD-ECO-0814-01",
        "change_request_id": "ECO-2026-0814",
        "requirement_id": "REQ-ECO-0814-01",
        "evidence_type": "TEST_REPORT",
        "source_reference": "HIPOT-REPORT-SN-088192",
        "document_revision": "Rev A",
        "file_name": "hipot_2500v_test_certified.pdf",
        "file_hash": "4a7b2c9e1f3d5a8b0c2e4f6a8b1d3f5a7c9e0b2d4f6a8c1e3b5d7f9a1c3e5b7d",
        "file_size_bytes": 312450,
        "verification_status": "ACCEPTED",
        "verified_by_id": "usr-qa-mgr",
        "verified_at": "2026-10-16T14:00:00Z",
        "notes": "Dielectric leakage 0.12 mA recorded; certified conforming."
      }
    ],
    "gate_evaluations": [
      {
        "id": 14,
        "change_request_id": "ECO-2026-0814",
        "gate_name": "PRE_AUTHORIZATION_GATE",
        "overall_result": "PASS",
        "evaluated_at": "2026-10-17T11:00:00Z",
        "evaluated_by_id": "usr-qa-mgr",
        "details_json": "{\"mandatory_requirements_total\": 1, \"evidence_provided\": 1, \"accepted_evidence\": 1, \"missing_or_unaccepted\": 0, \"high_severity_risks_unmitigated\": 0}",
        "blocking_reasons_json": "[]",
        "corrective_actions_json": "[]"
      }
    ],
    "approvals": [
      {
        "id": 15,
        "change_request_id": "ECO-2026-0814",
        "reviewer_id": "usr-chief-eng",
        "reviewer_role": "APPROVER",
        "decision": "APPROVED",
        "rationale": "ASIL-D electrical isolation requirements fully validated; release authorized.",
        "timestamp": "2026-10-17T11:20:00Z"
      }
    ]
  },
  {
    "id": "ECN-2026-4402",
    "title": "Implantable Cardiac Pacemaker Hermetic Laser Titanium Casing Weld Protocol",
    "reason": "Upgrade laser weld pulse duration to eliminate micro-porosity in Grade 23 Ti-6Al-4V ELI titanium capsule.",
    "change_type": "PROCESS_CHANGE",
    "requester_id": "usr-lead-eng",
    "baseline_id": "BASE-MED-PACEMAKER-GEN4",
    "state": "UNDER_REVIEW",
    "priority": "HIGH",
    "industry": "MEDTECH",
    "compliance_standard": "FDA 21 CFR Part 820 / ISO 13485",
    "target_system": "Class III Implantable Pulse Generator",
    "created_at": "2026-10-16T11:00:00Z",
    "updated_at": "2026-10-18T15:30:00Z",
    "requester": {
      "id": "usr-lead-eng",
      "username": "mvance",
      "display_name": "Marcus Vance (PE)",
      "role": "REQUESTER",
      "email": "m.vance@aerocraft.com",
      "active": true
    },
    "change_items": [
      {
        "id": 20,
        "change_request_id": "ECN-2026-4402",
        "affected_object_id": "MED-101",
        "field_name": "laser_weld_pulse_schedule",
        "proposed_operation": "MODIFY",
        "current_value": "Nd:YAG Pulse 4.2ms @ 18J (Single pass)",
        "proposed_value": "Fiber Laser Wobble 6.5ms @ 22J (Overlap 85%)",
        "justification": "Hermetic seal failure rate reduced from 0.08% to zero over 10-year simulated in-vivo immersion."
      }
    ],
    "impact_results": [
      {
        "id": 21,
        "change_request_id": "ECN-2026-4402",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "MED-101",
        "impacted_object_name": "Titanium Casing Shell Assembly",
        "impacted_object_type": "COMPONENT",
        "distance_from_source": 0,
        "traversal_path": "MED-101",
        "impact_classification": "DIRECT_PRIMARY",
        "rationale": "Primary medical implant enclosure.",
        "created_at": "2026-10-16T11:05:00Z"
      },
      {
        "id": 22,
        "change_request_id": "ECN-2026-4402",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "TEST-HELIUM",
        "impacted_object_name": "Helium Mass Spectrometer Leak Test MIL-STD-883",
        "impacted_object_type": "TEST",
        "distance_from_source": 1,
        "traversal_path": "MED-101 -> TEST-HELIUM",
        "impact_classification": "VERIFICATION_SCOPE",
        "rationale": "FDA Class III mandatory hermetic seal verification.",
        "created_at": "2026-10-16T11:05:00Z"
      }
    ],
    "risk_assessments": [
      {
        "id": 23,
        "change_request_id": "ECN-2026-4402",
        "failure_mode": "Hermetic breach causing bodily fluid ingress into lithium battery compartment",
        "effect": "Pacing output failure; catastrophic loss of cardiac synchronization in patient.",
        "cause": "Micro-fissure at seam radius under thermal contraction.",
        "severity": 10,
        "occurrence": 1,
        "detection": 3,
        "rpn": 30,
        "action_priority": "HIGH",
        "mitigation": "100% fine leak helium vacuum test with detection sensitivity 1e-9 atm-cc/s.",
        "status": "ACTIVE",
        "high_severity_flag": true,
        "accountable_owner": "Biomedical Regulatory VP"
      }
    ],
    "verification_requirements": [
      {
        "id": "REQ-MED-4402-01",
        "change_request_id": "ECN-2026-4402",
        "requirement_type": "TEST",
        "target_object_id": "TEST-HELIUM",
        "title": "Helium Mass Spectrometer Leak Certificate",
        "description": "Test to verify leak rate < 5x10^-9 atm-cc/sec per MIL-STD-883 Method 1014.",
        "acceptance_criteria": "Leak rate under 1.0x10^-9 recorded on NIST-calibrated spectrometer.",
        "mandatory": true,
        "source_rule": "FDA_CLASS_III_CRITICAL"
      }
    ],
    "evidence_records": [
      {
        "id": "EVD-MED-4402-01",
        "change_request_id": "ECN-2026-4402",
        "requirement_id": "REQ-MED-4402-01",
        "evidence_type": "TEST_REPORT",
        "source_reference": "SPECTRO-LAB-CERT-9901",
        "document_revision": "Rev 1.0",
        "file_name": "helium_leak_test_nist_certified.pdf",
        "file_hash": "7c8b9a0e1f2d3c4b5a6e7f8d9c0b1a2e3f4d5c6b7a8e9f0d1c2b3a4e5f6d7c8b",
        "file_size_bytes": 288410,
        "verification_status": "ACCEPTED",
        "verified_by_id": "usr-qa-mgr",
        "verified_at": "2026-10-17T16:00:00Z",
        "notes": "Leak rate 3.4x10^-10 atm-cc/sec certified; zero porosity observed."
      }
    ],
    "gate_evaluations": [
      {
        "id": 24,
        "change_request_id": "ECN-2026-4402",
        "gate_name": "PRE_AUTHORIZATION_GATE",
        "overall_result": "PASS",
        "evaluated_at": "2026-10-18T10:00:00Z",
        "evaluated_by_id": "usr-qa-mgr",
        "details_json": "{\"mandatory_requirements_total\": 1, \"evidence_provided\": 1, \"accepted_evidence\": 1, \"missing_or_unaccepted\": 0, \"high_severity_risks_unmitigated\": 0}",
        "blocking_reasons_json": "[]",
        "corrective_actions_json": "[]"
      }
    ],
    "approvals": []
  },
  {
    "id": "CR-2026-9011",
    "title": "3nm EUV Lithography Stepper Reticle Chuck Thermal Expansion Calibration",
    "reason": "Compensate 0.15nm overlay drift induced by 400W EUV plasma source thermal load on silicon carbide chuck.",
    "change_type": "DESIGN_REVISION",
    "requester_id": "usr-lead-eng",
    "baseline_id": "BASE-SEMI-EUV-3NM",
    "state": "IMPACT_ASSESSED",
    "priority": "HIGH",
    "industry": "SEMICONDUCTOR",
    "compliance_standard": "SEMI E10 / ISO 9001",
    "target_system": "High-NA EUV Scanner Reticle Stage",
    "created_at": "2026-10-17T07:30:00Z",
    "updated_at": "2026-10-19T08:00:00Z",
    "requester": {
      "id": "usr-lead-eng",
      "username": "mvance",
      "display_name": "Marcus Vance (PE)",
      "role": "REQUESTER",
      "email": "m.vance@aerocraft.com",
      "active": true
    },
    "change_items": [
      {
        "id": 30,
        "change_request_id": "CR-2026-9011",
        "affected_object_id": "SEMI-CHUCK",
        "field_name": "piezo_cooling_feedforward_gain",
        "proposed_operation": "MODIFY",
        "current_value": "Gain 1.24 V/mK (Open-loop)",
        "proposed_value": "Gain 1.82 V/mK with multi-zone interferometric feedback",
        "justification": "Yield improvement of 4.2% across 300mm wafer edge dies."
      }
    ],
    "impact_results": [
      {
        "id": 31,
        "change_request_id": "CR-2026-9011",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "SEMI-CHUCK",
        "impacted_object_name": "Electrostatic Reticle Clamping Chuck",
        "impacted_object_type": "COMPONENT",
        "distance_from_source": 0,
        "traversal_path": "SEMI-CHUCK",
        "impact_classification": "DIRECT_PRIMARY",
        "rationale": "Directly calibrated component.",
        "created_at": "2026-10-17T07:35:00Z"
      }
    ],
    "risk_assessments": [
      {
        "id": 32,
        "change_request_id": "CR-2026-9011",
        "failure_mode": "Over-damping causing reticle slip during 15G stage acceleration",
        "effect": "Reticle particle generation; destruction of ,000 photomask.",
        "cause": "Control loop gain overshoot under high throughput stepping.",
        "severity": 9,
        "occurrence": 2,
        "detection": 5,
        "rpn": 90,
        "action_priority": "HIGH",
        "mitigation": "Dual laser interferometer slip detector with sub-nanometer threshold lock.",
        "status": "ACTIVE",
        "high_severity_flag": true,
        "accountable_owner": "Chief Lithography Architect"
      }
    ],
    "verification_requirements": [
      {
        "id": "REQ-SEMI-9011-01",
        "change_request_id": "CR-2026-9011",
        "requirement_type": "TEST",
        "target_object_id": "TEST-OVERLAY",
        "title": "Sub-Nanometer Overlay Yield Verification",
        "description": "50-wafer qualification run showing mean overlay error < 0.8nm 3-sigma.",
        "acceptance_criteria": "Overlay measurement across 100 die locations verified compliant.",
        "mandatory": true,
        "source_rule": "SEMI_E10_CRITICAL"
      }
    ],
    "evidence_records": [],
    "gate_evaluations": [
      {
        "id": 33,
        "change_request_id": "CR-2026-9011",
        "gate_name": "PRE_AUTHORIZATION_GATE",
        "overall_result": "BLOCKED",
        "evaluated_at": "2026-10-19T08:15:00Z",
        "evaluated_by_id": "usr-qa-mgr",
        "details_json": "{\"mandatory_requirements_total\": 1, \"evidence_provided\": 0, \"accepted_evidence\": 0, \"missing_or_unaccepted\": 1, \"high_severity_risks_unmitigated\": 0}",
        "blocking_reasons_json": "[\"Mandatory requirement [REQ-SEMI-9011-01] has no evidence submitted.\"]",
        "corrective_actions_json": "[\"Upload certified 50-wafer overlay metrology run report.\"]"
      }
    ],
    "approvals": []
  },
  {
    "id": "MOC-2026-1180",
    "title": "Nuclear Power Plant Main Steam Isolation Valve Hydrostatic Pressure Boundary Ceramic Seal Upgrade",
    "reason": "Substitute cobalt-base Stellite hardfacing with nickel-chromium ceramic matrix to eliminate activation corrosion products in reactor primary loop.",
    "change_type": "MATERIAL_SUBSTITUTION",
    "requester_id": "usr-lead-eng",
    "baseline_id": "BASE-NUCLEAR-MSIV-LOOP1",
    "state": "CLOSED",
    "priority": "HIGH",
    "industry": "ENERGY",
    "compliance_standard": "ASME Section III / API 6D",
    "target_system": "Reactor Primary Coolant Boundary MSIV",
    "created_at": "2026-10-10T06:00:00Z",
    "updated_at": "2026-10-14T18:00:00Z",
    "requester": {
      "id": "usr-lead-eng",
      "username": "mvance",
      "display_name": "Marcus Vance (PE)",
      "role": "REQUESTER",
      "email": "m.vance@aerocraft.com",
      "active": true
    },
    "change_items": [
      {
        "id": 40,
        "change_request_id": "MOC-2026-1180",
        "affected_object_id": "MSIV-VALVE-SEAT",
        "field_name": "hardfacing_alloy_composition",
        "proposed_operation": "MODIFY",
        "current_value": "Stellite 6 (Co-Cr-W-C alloy)",
        "proposed_value": "Ni-Cr-B-Si Colmonoy 5 with Y2O3 ceramic dispersion",
        "justification": "Eliminates Cobalt-60 radiation fields during refueling outages."
      }
    ],
    "impact_results": [
      {
        "id": 41,
        "change_request_id": "MOC-2026-1180",
        "algorithm_version": "NetworkX-BFS-v2.1",
        "impacted_object_id": "MSIV-VALVE-SEAT",
        "impacted_object_name": "Main Steam Isolation Valve Disc & Seat",
        "impacted_object_type": "COMPONENT",
        "distance_from_source": 0,
        "traversal_path": "MSIV-VALVE-SEAT",
        "impact_classification": "DIRECT_PRIMARY",
        "rationale": "Pressure boundary component.",
        "created_at": "2026-10-10T06:05:00Z"
      }
    ],
    "risk_assessments": [
      {
        "id": 42,
        "change_request_id": "MOC-2026-1180",
        "failure_mode": "Thermal shock delamination during emergency reactor trip (SCRAM)",
        "effect": "Containment steam leakage exceeding 10 CFR 50 Appendix J technical limits.",
        "cause": "Differential coefficient of thermal expansion under 560\u00b0F steam quenching.",
        "severity": 10,
        "occurrence": 1,
        "detection": 4,
        "rpn": 40,
        "action_priority": "HIGH",
        "mitigation": "Hydrostatic proof test at 3,750 psig (1.5x design pressure) with acoustic emission monitoring.",
        "status": "ACTIVE",
        "high_severity_flag": true,
        "accountable_owner": "Nuclear Plant Chief Engineer"
      }
    ],
    "verification_requirements": [
      {
        "id": "REQ-MOC-1180-01",
        "change_request_id": "MOC-2026-1180",
        "requirement_type": "TEST",
        "target_object_id": "MSIV-HYDRO-TEST",
        "title": "ASME Section III 3,750 psig Hydrostatic Proof Test",
        "description": "Full pressure vessel hydrostatic test with zero seat leakage for 30 minutes.",
        "acceptance_criteria": "Zero pressure drop and zero detectable leakage per ASME Section III NB-6220.",
        "mandatory": true,
        "source_rule": "ASME_SECTION_III_NB"
      }
    ],
    "evidence_records": [
      {
        "id": "EVD-MOC-1180-01",
        "change_request_id": "MOC-2026-1180",
        "requirement_id": "REQ-MOC-1180-01",
        "evidence_type": "TEST_REPORT",
        "source_reference": "ASME-HYDRO-CERT-VALVE-01",
        "document_revision": "Rev 2.0",
        "file_name": "asme_hydro_proof_certified.pdf",
        "file_hash": "1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d",
        "file_size_bytes": 512940,
        "verification_status": "ACCEPTED",
        "verified_by_id": "usr-qa-mgr",
        "verified_at": "2026-10-12T16:30:00Z",
        "notes": "Test witnessed by Authorized Nuclear Inservice Inspector (ANII); zero leakage confirmed."
      }
    ],
    "gate_evaluations": [
      {
        "id": 43,
        "change_request_id": "MOC-2026-1180",
        "gate_name": "CLOSURE_GATE",
        "overall_result": "PASS",
        "evaluated_at": "2026-10-14T17:00:00Z",
        "evaluated_by_id": "usr-qa-mgr",
        "details_json": "{\"mandatory_requirements_total\": 1, \"evidence_provided\": 1, \"accepted_evidence\": 1, \"missing_or_unaccepted\": 0, \"high_severity_risks_unmitigated\": 0}",
        "blocking_reasons_json": "[]",
        "corrective_actions_json": "[]"
      }
    ],
    "approvals": [
      {
        "id": 44,
        "change_request_id": "MOC-2026-1180",
        "reviewer_id": "usr-chief-eng",
        "reviewer_role": "APPROVER",
        "decision": "APPROVED",
        "rationale": "Hydrostatic proof test certified by ANII; nuclear containment isolation verified.",
        "timestamp": "2026-10-14T17:30:00Z"
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
