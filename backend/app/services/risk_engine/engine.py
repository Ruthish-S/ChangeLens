from typing import Dict, List, Any
from backend.app.core.config import settings

class RiskAnalysisEngine:
    """
    FMEA Risk Engine implementing AIAG & VDA adapted methodology.
    Enforces that RPN = S * O * D is calculated rigorously, and strictly
    flags high-severity failure modes (S >= 8) for mandatory escalation,
    preventing low occurrence or detection numbers from hiding safety-critical risks.
    """

    def __init__(self, rubric_version: str = settings.FMEA_RUBRIC_VERSION):
        self.rubric_version = rubric_version

    def calculate_rpn(self, severity: int, occurrence: int, detection: int) -> int:
        return int(severity * occurrence * detection)

    def is_high_severity(self, severity: int) -> bool:
        # Boeing 737-9 case lesson: Loss of pressure boundary or retaining pin disengagement
        # is critical (S >= 8) and must mandate independent engineering review regardless of RPN.
        return severity >= 8

    def evaluate_fmea_item(self, data: Dict[str, Any]) -> Dict[str, Any]:
        s = data.get("severity", 1)
        o = data.get("occurrence", 1)
        d = data.get("detection", 1)
        rpn = self.calculate_rpn(s, o, d)
        high_sev = self.is_high_severity(s)

        res_s = data.get("residual_severity", s)
        res_o = data.get("residual_occurrence", o)
        res_d = data.get("residual_detection", d)
        res_rpn = self.calculate_rpn(res_s, res_o, res_d)

        return {
            "failure_mode": data["failure_mode"],
            "effect": data["effect"],
            "cause": data["cause"],
            "severity": s,
            "occurrence": o,
            "detection": d,
            "rpn": rpn,
            "high_severity_flag": high_sev,
            "mitigation": data["mitigation"],
            "accountable_owner": data["accountable_owner"],
            "residual_severity": res_s,
            "residual_occurrence": res_o,
            "residual_detection": res_d,
            "residual_rpn": res_rpn,
            "rubric_version": self.rubric_version
        }

    def generate_adaptive_verification_requirements(
        self,
        change_type: str,
        impact_results: List[Dict[str, Any]],
        risk_assessments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Dynamically generates mandatory and conditional verification requirements
        based on change type, identified impact nodes, and FMEA high-severity triggers.
        """
        reqs = []
        req_counter = 1

        # Check for High-Severity FMEA trigger
        has_high_severity = any(r.get("severity", 0) >= 8 or r.get("high_severity_flag", False) for r in risk_assessments)
        if has_high_severity:
            reqs.append({
                "id": f"VR-{req_counter:03d}",
                "requirement_code": "REQ-GATE-SAFETY-ESCALATION",
                "title": "Mandatory Independent Engineering Authority Safety Sign-off",
                "requirement_type": "INDEPENDENT_QA_REVIEW",
                "applicability_rule": "FMEA Severity S >= 8 Safety Escalation Rule",
                "acceptance_criteria": "Dual independent signature by Chief Airframe Engineer & Quality Assurance Director with documented risk justification.",
                "mandatory": True,
                "status": "PENDING"
            })
            req_counter += 1

        # Material substitution rules
        if change_type == "MATERIAL_SUBSTITUTION":
            reqs.append({
                "id": f"VR-{req_counter:03d}",
                "requirement_code": "REQ-MAT-QUAL-01",
                "title": "Certified Material Test Report (CMTR) & Traceability Review",
                "requirement_type": "MATERIAL_QUALIFICATION",
                "applicability_rule": "Rule CAT-MAT-01: All raw alloy substitutions require mill certificate verification",
                "acceptance_criteria": "Lot-specific CMTR validating chemistry, temper, tensile strength, and ultrasonic grain boundary test per AMS-QQ-A-250/11.",
                "mandatory": True,
                "status": "PENDING"
            })
            req_counter += 1

        # Check for fastener / retaining pin impacts (Boeing 737-9 door plug guide pin case)
        affected_item_ids = {r.get("impacted_object_id") for r in impact_results}
        if any(item in affected_item_ids for item in ["C-105", "P-302", "I-401"]):
            reqs.append({
                "id": f"VR-{req_counter:03d}",
                "requirement_code": "REQ-FASTENER-RETENTION-02",
                "title": "Positive Locking & Torque Buy-Off Verification",
                "requirement_type": "TORQUE_INSPECTION",
                "applicability_rule": "Rule CAT-FASTENER-02: Critical joint retaining bolt and cotter pin lockwire check",
                "acceptance_criteria": "100% independent inspection confirming all four retaining pins/bolts installed, torqued with calibrated tool, and secured with cotter pin/lockwire.",
                "mandatory": True,
                "status": "PENDING"
            })
            req_counter += 1

        # Check for proof pressure test impact
        if "T-501" in affected_item_ids or any("Pressure" in r.get("impacted_object_name", "") for r in impact_results):
            reqs.append({
                "id": f"VR-{req_counter:03d}",
                "requirement_code": "REQ-TEST-PROOF-PRESS-03",
                "title": "Cabin Differential Proof Pressure & Leakage Validation",
                "requirement_type": "PRESSURE_PROOF_TEST",
                "applicability_rule": "Rule CAT-PRESS-03: Pressure boundary component alterations require static pressurization proof",
                "acceptance_criteria": "Successful proof pressurization to 1.33x delta-P without structural deflection exceeding 0.015 in, and zero acoustic leakage.",
                "mandatory": True,
                "status": "PENDING"
            })
            req_counter += 1

        # Check for manufacturing rework process impact
        if "P-301" in affected_item_ids or "P-302" in affected_item_ids:
            reqs.append({
                "id": f"VR-{req_counter:03d}",
                "requirement_code": "REQ-PROC-TRAVELER-04",
                "title": "Manufacturing Rework Work Order & Removal Tracking Sign-off",
                "requirement_type": "INDEPENDENT_QA_REVIEW",
                "applicability_rule": "Rule CAT-PROC-04: Door opening/removal during final assembly requires controlled traveler documentation",
                "acceptance_criteria": "Authorized non-conformance traveler signed off showing removal reason, interim protection, re-installation verification, and final QA buy-off stamp.",
                "mandatory": True,
                "status": "PENDING"
            })
            req_counter += 1

        return reqs
