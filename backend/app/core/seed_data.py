import json
import datetime
from sqlalchemy.orm import Session
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
    Approval,
    WorkflowEvent,
    QualityGateEvaluation
)
from backend.app.services.impact_engine.engine import ImpactAnalysisEngine
from backend.app.services.risk_engine.engine import RiskAnalysisEngine
from backend.app.services.gate_engine.engine import QualityGateEngine
from backend.app.services.audit_service.service import AuditService

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding ChangeLens database with Boeing 737-9 MAX case study configuration...")

        # 1. Users
        users = [
            User(
                id="usr-lead-eng",
                username="mvance",
                display_name="Marcus Vance (PE)",
                role="REQUESTER",
                email="m.vance@aerocraft.com",
                active=True
            ),
            User(
                id="usr-qa-mgr",
                username="erostova",
                display_name="Dr. Elena Rostova",
                role="ENGINEER_QA",
                email="e.rostova@aerocraft.com",
                active=True
            ),
            User(
                id="usr-chief-eng",
                username="apendelton",
                display_name="Arthur Pendelton",
                role="APPROVER",
                email="a.pendelton@aerocraft.com",
                active=True
            ),
            User(
                id="usr-auditor",
                username="slin",
                display_name="Sarah Lin",
                role="AUDITOR",
                email="s.lin@aerocraft.com",
                active=True
            ),
        ]
        db.add_all(users)
        db.commit()

        # 2. Configuration Baseline
        baseline = ConfigurationBaseline(
            id="BASE-737-9-DOORPLUG-A",
            name="Boeing 737-9 MAX Fuselage Station 500 Mid-Exit Door Plug Baseline",
            version="Rev A.1",
            status="ACTIVE",
            description="Production configuration baseline for the Station 500 MED plug assembly, stop fittings, retaining pins, and pressure boundaries."
        )
        db.add(baseline)
        db.commit()

        # 3. Configuration Items (20 items across 5 types)
        items_data = [
            ("C-101", "DWG-737-53-0101", "Fuselage Station 500 Frame Assembly", "COMPONENT", "Rev A", "Primary fuselage ring frame and pressure bulkhead interface.", "RELEASED", "CRITICAL"),
            ("C-102", "DWG-737-53-0102", "Upper Guide Track Assembly", "COMPONENT", "Rev A", "Overhead roller guide track ensuring vertical displacement arrest.", "RELEASED", "CRITICAL"),
            ("C-103", "DWG-737-53-0103", "Lower Hinge Fitting Assembly", "COMPONENT", "Rev A", "Lower pivot hinge supporting plug weight during maintenance opening.", "RELEASED", "CRITICAL"),
            ("C-104", "DWG-737-53-0104", "Mid-Exit Door Plug Panel", "COMPONENT", "Rev A", "De-activated emergency exit plug structure sealing cabin pressure.", "RELEASED", "CRITICAL"),
            ("C-105", "DWG-737-53-0105", "Upper Guide Pin & Retaining Bolt Assembly", "COMPONENT", "Rev A", "Four critical securing bolts and cotter pins preventing upward disengagement.", "RELEASED", "CRITICAL"),
            ("C-106", "DWG-737-53-0106", "Lower Hinge Pin & Arrestor Assembly", "COMPONENT", "Rev A", "Lower retaining pins with positive locking hardware.", "RELEASED", "MAJOR"),
            ("C-107", "DWG-737-53-0107", "Stop Pad / Fitting Alignment Shims", "COMPONENT", "Rev A", "12 load-bearing stop pads bearing outward pressurization loads against frame.", "RELEASED", "CRITICAL"),
            ("C-108", "DWG-737-53-0108", "Perimeter Pressure Relief & Environmental Seal", "COMPONENT", "Rev A", "Elastomeric continuous bulb seal maintaining cabin pressurization.", "RELEASED", "MAJOR"),
            ("S-201", "SPEC-AMS-250-11", "Material Alloy Spec AMS-QQ-A-250/11", "SPECIFICATION", "Rev B", "High-strength aluminum alloy 7075-T651 plate specification.", "RELEASED", "CRITICAL"),
            ("S-202", "SPEC-BAC-5001-4", "Fastener Installation & Torque Spec BAC-5001-4", "SPECIFICATION", "Rev C", "Torque ranges, thread engagement, and safety lockwire standards.", "RELEASED", "CRITICAL"),
            ("S-203", "SPEC-BAC-5400-A", "Door Rigging & Stop Pad Clearance Standard", "SPECIFICATION", "Rev A", "Allowable gap tolerances between door stop fittings and fuselage pins.", "RELEASED", "MAJOR"),
            ("P-301", "SOP-737-44-01", "Door Plug Opening & Removal Procedure", "PROCESS", "Rev A", "Work traveler authorization for opening plug to repair cabin interior defects.", "RELEASED", "CRITICAL"),
            ("P-302", "SOP-737-44-09", "Retaining Bolt Installation & Lockwire Procedure", "PROCESS", "Rev B", "Torque application, cotter pin insertion, and dual QA stamp required.", "RELEASED", "CRITICAL"),
            ("P-303", "SOP-737-44-14", "Final Rigging & Clearance Adjustment", "PROCESS", "Rev A", "Feeler gauge measurement of all 12 stop pads under preload.", "RELEASED", "MAJOR"),
            ("I-401", "QC-INSP-401", "Retaining Bolt Torque & Cotter Pin Buy-Off Inspection", "INSPECTION", "Rev A", "100% independent mandatory inspection verifying 4 retaining bolts installed and pinned.", "RELEASED", "CRITICAL"),
            ("I-402", "QC-INSP-402", "Stop Pad Contact Area Feeler Gauge Check", "INSPECTION", "Rev A", "Verification of minimum 0.030 in clearance and full engagement.", "RELEASED", "MAJOR"),
            ("I-403", "QC-INSP-403", "Cabin Pressure Boundary Seal Leak & Ultrasonic Test", "INSPECTION", "Rev A", "Non-destructive acoustic leak and ultrasonic compression scan.", "RELEASED", "CRITICAL"),
            ("T-501", "TEST-737-501", "Fuselage Joint Static Proof Pressure Test", "TEST", "Rev A", "1.33x operating differential pressure proof verification.", "RELEASED", "CRITICAL"),
            ("T-502", "TEST-737-502", "Door Plug Guide Pin Dynamic Shear & Retention Test", "TEST", "Rev A", "Dynamic upward shear pulse test validating retention without bolt shear.", "RELEASED", "CRITICAL"),
            ("T-503", "TEST-737-503", "Acoustic & Structural Vibration Cycling Test", "TEST", "Rev A", "Fatigue vibration endurance representing 50,000 flight cycles.", "RELEASED", "MAJOR"),
        ]

        items = []
        for i_id, pn, name, itype, rev, desc, lstatus, crit in items_data:
            item = ConfigurationItem(
                id=i_id,
                baseline_id=baseline.id,
                part_number=pn,
                name=name,
                item_type=itype,
                revision=rev,
                description=desc,
                lifecycle_status=lstatus,
                criticality=crit,
                metadata_json=json.dumps({"origin": "Boeing 737-9 MED Case Study Synthetic Baseline"})
            )
            items.append(item)
            db.add(item)
        db.commit()

        # 4. Dependencies
        dep_links = [
            ("C-104", "S-201", "SPECIFIED_BY"),
            ("C-105", "S-202", "SPECIFIED_BY"),
            ("C-107", "S-203", "SPECIFIED_BY"),
            ("C-104", "P-301", "MANUFACTURED_BY"),
            ("C-105", "P-302", "MANUFACTURED_BY"),
            ("C-107", "P-303", "MANUFACTURED_BY"),
            ("C-104", "C-101", "ASSEMBLED_INTO"),
            ("C-102", "C-101", "ASSEMBLED_INTO"),
            ("C-103", "C-101", "ASSEMBLED_INTO"),
            ("C-104", "C-105", "SECURED_BY"),
            ("C-104", "C-106", "SECURED_BY"),
            ("C-104", "C-107", "DEPENDS_ON"),
            ("C-104", "C-108", "DEPENDS_ON"),
            ("P-302", "I-401", "INSPECTED_BY"),
            ("P-303", "I-402", "INSPECTED_BY"),
            ("C-108", "I-403", "INSPECTED_BY"),
            ("C-101", "T-501", "VERIFIED_BY"),
            ("C-105", "T-502", "VERIFIED_BY"),
            ("C-104", "T-503", "VERIFIED_BY"),
            ("S-201", "T-501", "VERIFIED_BY"),
            ("P-301", "P-302", "DEPENDS_ON"),
        ]

        for s_id, t_id, rel in dep_links:
            db.add(Dependency(
                baseline_id=baseline.id,
                source_id=s_id,
                target_id=t_id,
                relationship_type=rel,
                validity_interval="ALWAYS",
                active=True
            ))
        db.commit()

        # 5. Seed Change Request CCR-2026-0001
        cr = ChangeRequest(
            id="CCR-2026-0001",
            title="Mid-Exit Door Plug Material Substitution (Al 7075-T651 to Al 2024-T351 Clad)",
            reason=(
                "Proposed substitution of outer skin and structural frame material to improve stress-corrosion "
                "cracking resistance in humid operational environments. Requires full downstream impact analysis "
                "across tooling, torque specs, proof pressure testing, and inspection buy-offs."
            ),
            change_type="MATERIAL_SUBSTITUTION",
            requester_id="usr-lead-eng",
            baseline_id=baseline.id,
            state="IMPACT_ASSESSED",
            priority="HIGH",
            created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2),
            updated_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=4)
        )
        db.add(cr)
        db.commit()

        # Change Item
        ci = ChangeItem(
            change_request_id=cr.id,
            affected_object_id="C-104",
            field_name="material_specification",
            proposed_operation="MODIFY",
            current_value="Al 7075-T651 per AMS-QQ-A-250/11",
            proposed_value="Al 2024-T351 Clad per AMS-QQ-A-250/5",
            justification="Eliminates micro-crack propagation risks identified during fleet maintenance cycles."
        )
        db.add(ci)
        db.commit()

        # Run Impact Analysis Engine
        impact_engine = ImpactAnalysisEngine()
        impact_results = impact_engine.analyze_change(baseline, cr, [ci])
        for ir in impact_results:
            db.add(ImpactResult(
                change_request_id=cr.id,
                algorithm_version=ir["algorithm_version"],
                impacted_object_id=ir["impacted_object_id"],
                impacted_object_name=ir["impacted_object_name"],
                impacted_object_type=ir["impacted_object_type"],
                classification=ir["classification"],
                path_json=ir["path_json"],
                propagation_rule=ir["propagation_rule"],
                rationale=ir["rationale"],
                verification_action=ir["verification_action"],
                unresolved_uncertainty=ir["unresolved_uncertainty"],
                baseline_revision_snapshot=ir["baseline_revision_snapshot"]
            ))
        db.commit()

        # Seed FMEA Risk Assessment
        risk_engine = RiskAnalysisEngine()
        fmea_data_list = [
            {
                "failure_mode": "Plug Structural Deflection under Cabin Differential Pressure",
                "effect": "Uncontrolled cabin depressurization during climb (FAR 25.841 violation); potential structural separation.",
                "cause": "Lower yield strength of substituted 2024-T351 alloy under combined pressurization & aerodynamic suction.",
                "severity": 9,  # S >= 8 triggers high severity flag
                "occurrence": 3,
                "detection": 4,
                "mitigation": "Perform finite element limit load re-analysis and physical 1.33x proof pressure test T-501 prior to release.",
                "accountable_owner": "Arthur Pendelton (Chief Airframe Engineer)",
                "residual_severity": 9,
                "residual_occurrence": 1,
                "residual_detection": 2
            },
            {
                "failure_mode": "Upper Guide Pin Disengagement due to Omitted Retaining Fasteners",
                "effect": "Plug translates upward under acoustic vibration; stop pads disengage from fuselage stop pins causing blow-out.",
                "cause": "Procedural failure during door plug opening rework (P-301) lacking formal traveler closure and QA buy-off.",
                "severity": 10, # S >= 8 Critical safety failure
                "occurrence": 3,
                "detection": 5,
                "mitigation": "Mandate 100% two-person independent buy-off (I-401) with tamper-evident lockwire and physical photographic evidence.",
                "accountable_owner": "Dr. Elena Rostova (QA Director)",
                "residual_severity": 10,
                "residual_occurrence": 1,
                "residual_detection": 1
            },
            {
                "failure_mode": "Perimeter Pressure Bulb Seal Compression Inconsistency",
                "effect": "Cabin pressurization leakage exceeding 120 SCFM allowable limit; excess bleed-air compressor load.",
                "cause": "Deflection difference along seal seating flange under altered alloy stiffness profile.",
                "severity": 5,
                "occurrence": 4,
                "detection": 3,
                "mitigation": "Ultrasonic compression thickness scan (I-403) and 100% smoke leak check on final assembly jig.",
                "accountable_owner": "Marcus Vance (Structural Lead)",
                "residual_severity": 5,
                "residual_occurrence": 2,
                "residual_detection": 2
            }
        ]

        evaluated_risks = []
        for fd in fmea_data_list:
            res = risk_engine.evaluate_fmea_item(fd)
            ra = RiskAssessment(
                change_request_id=cr.id,
                failure_mode=res["failure_mode"],
                effect=res["effect"],
                cause=res["cause"],
                severity=res["severity"],
                occurrence=res["occurrence"],
                detection=res["detection"],
                rpn=res["rpn"],
                high_severity_flag=res["high_severity_flag"],
                mitigation=res["mitigation"],
                accountable_owner=res["accountable_owner"],
                residual_severity=res["residual_severity"],
                residual_occurrence=res["residual_occurrence"],
                residual_detection=res["residual_detection"],
                residual_rpn=res["residual_rpn"],
                rubric_version=res["rubric_version"]
            )
            evaluated_risks.append(res)
            db.add(ra)
        db.commit()

        # Generate Adaptive Verification Requirements
        gen_reqs = risk_engine.generate_adaptive_verification_requirements(cr.change_type, impact_results, evaluated_risks)
        db_reqs = []
        for gr in gen_reqs:
            vr = VerificationRequirement(
                id=f"{cr.id}-{gr['id']}",
                change_request_id=cr.id,
                requirement_code=gr["requirement_code"],
                title=gr["title"],
                requirement_type=gr["requirement_type"],
                applicability_rule=gr["applicability_rule"],
                acceptance_criteria=gr["acceptance_criteria"],
                mandatory=gr["mandatory"],
                status=gr["status"]
            )
            db_reqs.append(vr)
            db.add(vr)
        db.commit()

        # Add initial verified evidence for 1 requirement (Material CMTR) to illustrate partial completion
        cmtr_req = next(r for r in db_reqs if r.requirement_type == "MATERIAL_QUALIFICATION")
        cmtr_evidence = EvidenceRecord(
            id=f"EV-{cr.id}-001",
            change_request_id=cr.id,
            requirement_id=cmtr_req.id,
            evidence_type="MATERIAL_CERT_CMTR",
            source_reference="Alcoa Certified Mill Test Report LOT-2026-AL-9921",
            document_revision="Rev 1.0",
            file_name="CMTR_2024_T351_LOT9921_Accredited.pdf",
            file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            file_size_bytes=1048576,
            verification_status="ACCEPTED",
            verified_by_id="usr-qa-mgr",
            verified_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=12),
            notes="Spectrometric chemistry & tensile tests comply with AMS-QQ-A-250/5. QA Buy-off stamped."
        )
        db.add(cmtr_evidence)
        db.commit()

        # Evaluate Quality Gate
        gate_engine = QualityGateEngine()
        all_reqs = db.query(VerificationRequirement).filter(VerificationRequirement.change_request_id == cr.id).all()
        all_ev = db.query(EvidenceRecord).filter(EvidenceRecord.change_request_id == cr.id).all()
        all_imp = db.query(ImpactResult).filter(ImpactResult.change_request_id == cr.id).all()

        gate_res = gate_engine.evaluate_gate(
            gate_name="PRE_AUTHORIZATION_GATE",
            change_request=cr,
            baseline=baseline,
            requirements=all_reqs,
            evidence_records=all_ev,
            approvals=[],
            impact_results=all_imp
        )

        db.add(QualityGateEvaluation(
            change_request_id=cr.id,
            gate_name=gate_res["gate_name"],
            overall_result=gate_res["overall_result"],
            evaluated_at=gate_res["evaluated_at"],
            evaluated_by_id="usr-qa-mgr",
            details_json=json.dumps(gate_res["checks"]),
            blocking_reasons_json=json.dumps(gate_res["blocking_reasons"]),
            corrective_actions_json=json.dumps(gate_res["corrective_actions"])
        ))
        db.commit()

        # Log Workflow Events
        AuditService.log_event(
            db=db,
            change_request_id=cr.id,
            actor=users[0],
            action="CREATE_PROPOSAL",
            previous_state="NONE",
            new_state="DRAFT",
            reason="Initiated material substitution change request for MED plug skin."
        )
        AuditService.log_event(
            db=db,
            change_request_id=cr.id,
            actor=users[0],
            action="SUBMIT",
            previous_state="DRAFT",
            new_state="SUBMITTED",
            reason="Completed change item description and submitted for impact traversal."
        )
        AuditService.log_event(
            db=db,
            change_request_id=cr.id,
            actor=users[1],
            action="RUN_IMPACT_ANALYSIS",
            previous_state="SUBMITTED",
            new_state="IMPACT_ASSESSED",
            reason="Executed deterministic BFS dependency graph analysis and FMEA risk evaluation."
        )

        # Also seed CCR-2026-0002 (Door plug rework procedure)
        cr2 = ChangeRequest(
            id="CCR-2026-0002",
            title="Manufacturing Rework Traveler & Door Opening Accountability Protocol",
            reason="Establish mandatory opening/closing traveler sign-off with photographic evidence of retaining bolts.",
            change_type="PROCESS_CHANGE",
            requester_id="usr-lead-eng",
            baseline_id=baseline.id,
            state="UNDER_REVIEW",
            priority="URGENT",
            created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=4),
            updated_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
        )
        db.add(cr2)
        db.commit()

        ci2 = ChangeItem(
            change_request_id=cr2.id,
            affected_object_id="P-301",
            field_name="rework_traveler_signoff",
            proposed_operation="MODIFY",
            current_value="Single operator sign-off in shop-floor logbook",
            proposed_value="Dual mandatory traveler sign-off: Operations Lead + Independent QA Buy-Off with torque certificate",
            justification="Addresses FAA oversight findings regarding undocumented opening/closing of door plugs during interior cabin completion."
        )
        db.add(ci2)
        db.commit()

        AuditService.log_event(
            db=db,
            change_request_id=cr2.id,
            actor=users[0],
            action="SUBMIT",
            previous_state="DRAFT",
            new_state="UNDER_REVIEW",
            reason="Submitted revised rework procedure under FAA oversight review."
        )

        print("Seeding completed successfully.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
