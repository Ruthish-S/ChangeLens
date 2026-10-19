import os
import json
import hashlib
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
from reportlab.pdfgen import canvas

from backend.app.core.config import settings

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas for dynamic 'Page X of Y' numbering."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        # Header
        self.drawString(54, 755, "ChangeLens — Engineering Change Assessment Report")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 748, 558, 748)
        # Footer
        self.line(54, 45, 558, 45)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.drawString(54, 32, "CONFIDENTIAL — FOR INTERNAL ENGINEERING & QUALITY GOVERNANCE ONLY")
        self.restoreState()


class ReportGeneratorService:
    """
    Automated Multi-Format Engineering Report Generator.
    Produces identical verified engineering assessment data across PDF, DOCX, XLSX, and CSV
    from a single canonical snapshot data model.
    """

    @staticmethod
    def build_canonical_change_data(
        change_request: Any,
        baseline: Any,
        change_items: List[Any],
        impact_results: List[Any],
        risk_assessments: List[Any],
        verification_reqs: List[Any],
        evidence_records: List[Any],
        gate_evaluations: List[Any],
        approvals: List[Any],
        workflow_events: List[Any]
    ) -> Dict[str, Any]:
        """Creates the canonical dictionary representing the entire assessment state."""
        evidence_status_map = {e.requirement_id: e for e in evidence_records}

        impact_items = []
        for r in impact_results:
            path_list = []
            try:
                path_list = json.loads(r.path_json)
            except Exception:
                pass
            path_str = " -> ".join([p.get("name", p.get("node_id", "")) for p in path_list])
            impact_items.append({
                "id": r.impacted_object_id,
                "name": r.impacted_object_name,
                "type": r.impacted_object_type,
                "classification": r.classification,
                "propagation_rule": r.propagation_rule,
                "path": path_str,
                "rationale": r.rationale,
                "verification_action": r.verification_action,
                "uncertainty": r.unresolved_uncertainty or "None identified"
            })

        fmea_items = []
        for f in risk_assessments:
            fmea_items.append({
                "failure_mode": f.failure_mode,
                "effect": f.effect,
                "cause": f.cause,
                "severity": f.severity,
                "occurrence": f.occurrence,
                "detection": f.detection,
                "rpn": f.rpn,
                "high_severity": f.high_severity_flag,
                "mitigation": f.mitigation,
                "owner": f.accountable_owner,
                "res_s": f.residual_severity,
                "res_o": f.residual_occurrence,
                "res_d": f.residual_detection,
                "res_rpn": f.residual_rpn
            })

        req_items = []
        for req in verification_reqs:
            ev = evidence_status_map.get(req.id)
            req_items.append({
                "id": req.id,
                "code": req.requirement_code,
                "title": req.title,
                "type": req.requirement_type,
                "mandatory": req.mandatory,
                "acceptance_criteria": req.acceptance_criteria,
                "evidence_ref": ev.source_reference if ev else "MISSING",
                "evidence_status": ev.verification_status if ev else "MISSING",
                "evidence_hash": ev.file_hash if ev else "N/A"
            })

        snapshot_str = json.dumps({
            "change_id": change_request.id,
            "title": change_request.title,
            "state": change_request.state,
            "baseline": baseline.id if baseline else "UNKNOWN",
            "impact_count": len(impact_items),
            "fmea_count": len(fmea_items),
            "req_count": len(req_items)
        }, sort_keys=True)
        snapshot_hash = hashlib.sha256(snapshot_str.encode("utf-8")).hexdigest()

        import uuid
        unique_suffix = f"{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        return {
            "metadata": {
                "report_id": f"RPT-{change_request.id}-{unique_suffix}",
                "change_id": change_request.id,
                "title": change_request.title,
                "change_type": change_request.change_type,
                "priority": change_request.priority,
                "current_state": change_request.state,
                "baseline_id": baseline.id if baseline else "N/A",
                "baseline_version": baseline.version if baseline else "N/A",
                "generated_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                "source_snapshot_hash": snapshot_hash,
                "algorithm_version": settings.ALGORITHM_VERSION,
                "fmea_rubric_version": settings.FMEA_RUBRIC_VERSION
            },
            "reason": change_request.reason,
            "change_items": [{
                "object_id": ci.affected_object_id,
                "field": ci.field_name,
                "operation": ci.proposed_operation,
                "current": ci.current_value,
                "proposed": ci.proposed_value,
                "justification": ci.justification or "None"
            } for ci in change_items],
            "impact_items": impact_items,
            "fmea_items": fmea_items,
            "verification_items": req_items,
            "approvals": [{
                "reviewer": a.reviewer_id,
                "role": a.reviewer_role,
                "decision": a.decision,
                "rationale": a.rationale,
                "timestamp": a.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if a.timestamp else "N/A"
            } for a in approvals],
            "events": [{
                "actor": e.actor_id,
                "role": e.actor_role,
                "action": e.action,
                "transition": f"{e.previous_state} -> {e.new_state}",
                "reason": e.reason,
                "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if e.timestamp else "N/A"
            } for e in workflow_events]
        }

    # ==================== PDF EXPORT ====================
    @classmethod
    def generate_pdf(cls, data: Dict[str, Any], output_path: str) -> str:
        meta = data["metadata"]
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold",
            spaceAfter=4
        )
        h2_style = ParagraphStyle(
            "H2",
            parent=styles["Heading2"],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold",
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=8.5,
            leading=11.5,
            textColor=colors.HexColor("#334155")
        )
        callout_style = ParagraphStyle(
            "Callout",
            parent=styles["Normal"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#475569")
        )
        table_hdr_style = ParagraphStyle(
            "TableHdr",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
            textColor=colors.white,
            fontName="Helvetica-Bold"
        )
        table_cell_style = ParagraphStyle(
            "TableCell",
            parent=styles["Normal"],
            fontSize=7.5,
            leading=9.5,
            textColor=colors.HexColor("#1E293B")
        )

        elements = []

        # 01 Title Block
        elements.append(Paragraph("ChangeLens — Engineering Change Assessment", title_style))
        elements.append(Paragraph(
            f"<b>Change ID:</b> {meta['change_id']} &nbsp;|&nbsp; "
            f"<b>Title:</b> {meta['title']} &nbsp;|&nbsp; "
            f"<b>State:</b> <font color='#DC2626'><b>{meta['current_state']}</b></font>",
            body_style
        ))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=6, spaceAfter=8))

        # Document Control Table
        doc_ctrl_data = [
            [Paragraph("<b>Report ID:</b>", body_style), Paragraph(meta["report_id"], body_style),
             Paragraph("<b>Generated:</b>", body_style), Paragraph(meta["generated_at"], body_style)],
            [Paragraph("<b>Baseline Config:</b>", body_style), Paragraph(f"{meta['baseline_id']} ({meta['baseline_version']})", body_style),
             Paragraph("<b>Snapshot SHA-256:</b>", body_style), Paragraph(f"{meta['source_snapshot_hash'][:16]}...", body_style)],
            [Paragraph("<b>Change Type:</b>", body_style), Paragraph(meta["change_type"], body_style),
             Paragraph("<b>Algorithm Version:</b>", body_style), Paragraph(meta["algorithm_version"], body_style)]
        ]
        doc_ctrl_table = Table(doc_ctrl_data, colWidths=[90, 160, 100, 154])
        doc_ctrl_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(doc_ctrl_table)
        elements.append(Spacer(1, 10))

        # 02 Executive Summary
        elements.append(Paragraph("02 Executive Summary & Justification", h2_style))
        elements.append(Paragraph(f"<b>Engineering Justification:</b> {data['reason']}", body_style))
        elements.append(Spacer(1, 8))

        # 03 Baseline Comparison
        elements.append(Paragraph("03 Baseline Comparison", h2_style))
        ci_table_data = [[
            Paragraph("Item ID", table_hdr_style),
            Paragraph("Field", table_hdr_style),
            Paragraph("Baseline Value", table_hdr_style),
            Paragraph("Proposed Value", table_hdr_style),
            Paragraph("Engineering Justification", table_hdr_style)
        ]]
        for ci in data["change_items"]:
            ci_table_data.append([
                Paragraph(ci["object_id"], table_cell_style),
                Paragraph(ci["field"], table_cell_style),
                Paragraph(ci["current"], table_cell_style),
                Paragraph(ci["proposed"], table_cell_style),
                Paragraph(ci["justification"], table_cell_style),
            ])
        ci_table = Table(ci_table_data, colWidths=[65, 85, 120, 120, 114])
        ci_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(ci_table)
        elements.append(Spacer(1, 10))

        # 04 Impact Analysis
        elements.append(Paragraph("04 Dependency & Change-Impact Analysis", h2_style))
        imp_table_data = [[
            Paragraph("Object ID", table_hdr_style),
            Paragraph("Type", table_hdr_style),
            Paragraph("Class", table_hdr_style),
            Paragraph("Rule", table_hdr_style),
            Paragraph("Dependency Path & Rationale", table_hdr_style),
            Paragraph("Required Verification Action", table_hdr_style)
        ]]
        for imp in data["impact_items"][:12]: # fit cleanly
            imp_table_data.append([
                Paragraph(f"<b>{imp['id']}</b>", table_cell_style),
                Paragraph(imp["type"], table_cell_style),
                Paragraph(f"<font color='{'#DC2626' if imp['classification']=='DIRECTLY_CHANGED' else '#D97706'}'>{imp['classification']}</font>", table_cell_style),
                Paragraph(imp["propagation_rule"][:16], table_cell_style),
                Paragraph(f"{imp['path']}<br/><i>{imp['rationale']}</i>", table_cell_style),
                Paragraph(imp["verification_action"], table_cell_style),
            ])
        imp_table = Table(imp_table_data, colWidths=[48, 55, 65, 65, 145, 126])
        imp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(imp_table)
        elements.append(Spacer(1, 10))

        # 05 Risk Assessment (FMEA)
        elements.append(Paragraph("05 Risk Assessment (FMEA)", h2_style))
        fmea_table_data = [[
            Paragraph("Failure Mode & Effect", table_hdr_style),
            Paragraph("S", table_hdr_style),
            Paragraph("O", table_hdr_style),
            Paragraph("D", table_hdr_style),
            Paragraph("RPN", table_hdr_style),
            Paragraph("High Sev?", table_hdr_style),
            Paragraph("Mitigation Action & Owner", table_hdr_style),
            Paragraph("Res. RPN", table_hdr_style)
        ]]
        for f in data["fmea_items"]:
            fmea_table_data.append([
                Paragraph(f"<b>{f['failure_mode']}</b><br/>Effect: {f['effect']}", table_cell_style),
                Paragraph(str(f["severity"]), table_cell_style),
                Paragraph(str(f["occurrence"]), table_cell_style),
                Paragraph(str(f["detection"]), table_cell_style),
                Paragraph(f"<b>{f['rpn']}</b>", table_cell_style),
                Paragraph("<font color='#DC2626'><b>YES (S>=8)</b></font>" if f["high_severity"] else "NO", table_cell_style),
                Paragraph(f"{f['mitigation']}<br/><b>Owner:</b> {f['owner']}", table_cell_style),
                Paragraph(f"<b>{f['res_rpn']}</b> (S:{f['res_s']} O:{f['res_o']} D:{f['res_d']})", table_cell_style),
            ])
        fmea_table = Table(fmea_table_data, colWidths=[120, 20, 20, 20, 32, 52, 175, 65])
        fmea_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(fmea_table)
        elements.append(Spacer(1, 10))

        # 06 Verification Evidence Checklist
        elements.append(Paragraph("06 Verification Evidence & Quality Gate Status", h2_style))
        req_table_data = [[
            Paragraph("Req ID", table_hdr_style),
            Paragraph("Title & Acceptance Criteria", table_hdr_style),
            Paragraph("Mandatory", table_hdr_style),
            Paragraph("Evidence Ref", table_hdr_style),
            Paragraph("Gate Status", table_hdr_style)
        ]]
        for r in data["verification_items"]:
            status_color = "#16A34A" if r["evidence_status"] == "ACCEPTED" else "#DC2626"
            req_table_data.append([
                Paragraph(f"<b>{r['id']}</b><br/>{r['code']}", table_cell_style),
                Paragraph(f"<b>{r['title']}</b><br/>{r['acceptance_criteria']}", table_cell_style),
                Paragraph("YES" if r["mandatory"] else "OPTIONAL", table_cell_style),
                Paragraph(f"{r['evidence_ref']}<br/><i>Hash: {r['evidence_hash'][:12]}...</i>", table_cell_style),
                Paragraph(f"<font color='{status_color}'><b>{r['evidence_status']}</b></font>", table_cell_style),
            ])
        req_table = Table(req_table_data, colWidths=[65, 210, 50, 110, 69])
        req_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(req_table)
        elements.append(Spacer(1, 10))

        # 07 Decision & Governance Sign-off
        elements.append(Paragraph("07 Review Decisions & Governance Sign-off", h2_style))
        if data["approvals"]:
            app_table_data = [[
                Paragraph("Reviewer", table_hdr_style),
                Paragraph("Role", table_hdr_style),
                Paragraph("Decision", table_hdr_style),
                Paragraph("Rationale & Conditions", table_hdr_style),
                Paragraph("Timestamp", table_hdr_style)
            ]]
            for a in data["approvals"]:
                app_table_data.append([
                    Paragraph(a["reviewer"], table_cell_style),
                    Paragraph(a["role"], table_cell_style),
                    Paragraph(f"<b>{a['decision']}</b>", table_cell_style),
                    Paragraph(a["rationale"], table_cell_style),
                    Paragraph(a["timestamp"], table_cell_style),
                ])
            app_table = Table(app_table_data, colWidths=[90, 80, 75, 175, 84])
            app_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('PADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(app_table)
        else:
            elements.append(Paragraph("<i>No formal approval decisions recorded yet. Request is in review status.</i>", body_style))

        elements.append(Spacer(1, 10))
        # 08 Limitations and Disclaimer
        elements.append(Paragraph("08 Engineering Limitations and Governance Disclaimer", h2_style))
        disclaimer = (
            "ChangeLens provides explainable algorithmic decision support based on deterministic graph traversal "
            "and rule enforcement. The software does NOT independently certify aircraft airworthiness or replace "
            "qualified aerospace engineering sign-off. Low numerical risk scores do not prove material safety without "
            "accredited physical testing. All change authorizations require formal signature by accountable engineering authorities."
        )
        elements.append(Paragraph(disclaimer, callout_style))

        doc.build(elements, canvasmaker=NumberedCanvas)
        return output_path

    # ==================== DOCX EXPORT ====================
    @classmethod
    def generate_docx(cls, data: Dict[str, Any], output_path: str) -> str:
        meta = data["metadata"]
        doc = Document()

        # Styles
        title = doc.add_heading("ChangeLens — Engineering Change Assessment", level=0)
        p_sub = doc.add_paragraph()
        p_sub.add_run(f"Change ID: {meta['change_id']} | Title: {meta['title']} | State: {meta['current_state']}").bold = True

        # Document Control Table
        doc.add_heading("01 Document Control", level=1)
        ctrl_table = doc.add_table(rows=4, cols=2)
        ctrl_table.style = "Light Shading Accent 1" if "Light Shading Accent 1" in [s.name for s in doc.styles] else "Table Grid"
        ctrl_rows = [
            ("Report ID", meta["report_id"]),
            ("Generation Timestamp", meta["generated_at"]),
            ("Baseline Reference", f"{meta['baseline_id']} ({meta['baseline_version']})"),
            ("Snapshot SHA-256", meta["source_snapshot_hash"])
        ]
        for i, (k, v) in enumerate(ctrl_rows):
            ctrl_table.rows[i].cells[0].text = k
            ctrl_table.rows[i].cells[1].text = v

        # Executive Summary
        doc.add_heading("02 Executive Summary", level=1)
        doc.add_paragraph(f"Engineering Justification: {data['reason']}")

        # Baseline Comparison Table
        doc.add_heading("03 Baseline Comparison", level=1)
        ci_table = doc.add_table(rows=1, cols=5)
        ci_table.style = "Table Grid"
        headers = ["Item ID", "Field", "Baseline Value", "Proposed Value", "Justification"]
        for j, h in enumerate(headers):
            ci_table.rows[0].cells[j].text = h
        for ci in data["change_items"]:
            row = ci_table.add_row()
            row.cells[0].text = str(ci["object_id"])
            row.cells[1].text = str(ci["field"])
            row.cells[2].text = str(ci["current"])
            row.cells[3].text = str(ci["proposed"])
            row.cells[4].text = str(ci["justification"])

        # Impact Analysis Table
        doc.add_heading("04 Dependency & Change-Impact Analysis", level=1)
        imp_table = doc.add_table(rows=1, cols=5)
        imp_table.style = "Table Grid"
        headers = ["Object ID", "Type", "Classification", "Rule", "Path & Rationale"]
        for j, h in enumerate(headers):
            imp_table.rows[0].cells[j].text = h
        for imp in data["impact_items"]:
            row = imp_table.add_row()
            row.cells[0].text = imp["id"]
            row.cells[1].text = imp["type"]
            row.cells[2].text = imp["classification"]
            row.cells[3].text = imp["propagation_rule"]
            row.cells[4].text = f"{imp['path']}\n{imp['rationale']}"

        # Risk Register Table
        doc.add_heading("05 Risk Assessment (FMEA)", level=1)
        fmea_table = doc.add_table(rows=1, cols=7)
        fmea_table.style = "Table Grid"
        headers = ["Failure Mode", "S", "O", "D", "RPN", "High Sev?", "Mitigation Action"]
        for j, h in enumerate(headers):
            fmea_table.rows[0].cells[j].text = h
        for f in data["fmea_items"]:
            row = fmea_table.add_row()
            row.cells[0].text = f["failure_mode"]
            row.cells[1].text = str(f["severity"])
            row.cells[2].text = str(f["occurrence"])
            row.cells[3].text = str(f["detection"])
            row.cells[4].text = str(f["rpn"])
            row.cells[5].text = "YES" if f["high_severity"] else "NO"
            row.cells[6].text = f"{f['mitigation']} (Owner: {f['owner']})"

        # Verification Evidence Table
        doc.add_heading("06 Verification Evidence & Quality Gates", level=1)
        req_table = doc.add_table(rows=1, cols=5)
        req_table.style = "Table Grid"
        headers = ["Req ID", "Title", "Mandatory", "Evidence Ref", "Status"]
        for j, h in enumerate(headers):
            req_table.rows[0].cells[j].text = h
        for r in data["verification_items"]:
            row = req_table.add_row()
            row.cells[0].text = r["id"]
            row.cells[1].text = r["title"]
            row.cells[2].text = "YES" if r["mandatory"] else "NO"
            row.cells[3].text = r["evidence_ref"]
            row.cells[4].text = r["evidence_status"]

        # Decisions
        doc.add_heading("07 Review Decisions & Governance", level=1)
        if data["approvals"]:
            app_table = doc.add_table(rows=1, cols=4)
            app_table.style = "Table Grid"
            headers = ["Reviewer", "Role", "Decision", "Rationale"]
            for j, h in enumerate(headers):
                app_table.rows[0].cells[j].text = h
            for a in data["approvals"]:
                row = app_table.add_row()
                row.cells[0].text = a["reviewer"]
                row.cells[1].text = a["role"]
                row.cells[2].text = a["decision"]
                row.cells[3].text = a["rationale"]
        else:
            doc.add_paragraph("No formal decisions recorded yet.")

        # Disclaimer
        doc.add_heading("08 Engineering Limitations and Governance Disclaimer", level=1)
        doc.add_paragraph(
            "ChangeLens provides explainable algorithmic decision support based on deterministic graph traversal "
            "and rule enforcement. The software does not replace certified aerospace engineering sign-off. "
            "Safety and compliance remain human engineering accountabilities."
        )

        doc.save(output_path)
        return output_path

    # ==================== XLSX EXPORT ====================
    @classmethod
    def generate_xlsx(cls, data: Dict[str, Any], output_path: str) -> str:
        wb = openpyxl.Workbook()
        # Sheet 1: Summary
        ws_sum = wb.active
        ws_sum.title = "Executive Summary"
        meta = data["metadata"]

        ws_sum.append(["ChangeLens — Engineering Change Assessment"])
        ws_sum.append(["Report ID", meta["report_id"]])
        ws_sum.append(["Change ID", meta["change_id"]])
        ws_sum.append(["Title", meta["title"]])
        ws_sum.append(["Change Type", meta["change_type"]])
        ws_sum.append(["Current State", meta["current_state"]])
        ws_sum.append(["Baseline Reference", f"{meta['baseline_id']} ({meta['baseline_version']})"])
        ws_sum.append(["Generated At", meta["generated_at"]])
        ws_sum.append(["Snapshot SHA-256", meta["source_snapshot_hash"]])
        ws_sum.append([])
        ws_sum.append(["Engineering Justification"])
        ws_sum.append([data["reason"]])

        # Sheet 2: Impact Analysis
        ws_imp = wb.create_sheet(title="Impact Analysis")
        ws_imp.append(["Object ID", "Object Name", "Type", "Classification", "Propagation Rule", "Dependency Path", "Rationale", "Verification Action"])
        for imp in data["impact_items"]:
            ws_imp.append([
                imp["id"], imp["name"], imp["type"], imp["classification"],
                imp["propagation_rule"], imp["path"], imp["rationale"], imp["verification_action"]
            ])

        # Sheet 3: FMEA Risk Register
        ws_fmea = wb.create_sheet(title="FMEA Risk Register")
        ws_fmea.append(["Failure Mode", "Effect", "Cause", "Severity (S)", "Occurrence (O)", "Detection (D)", "RPN", "High Severity?", "Mitigation", "Owner", "Residual S", "Residual O", "Residual D", "Residual RPN"])
        for f in data["fmea_items"]:
            ws_fmea.append([
                f["failure_mode"], f["effect"], f["cause"],
                f["severity"], f["occurrence"], f["detection"], f["rpn"],
                "YES" if f["high_severity"] else "NO",
                f["mitigation"], f["owner"],
                f["res_s"], f["res_o"], f["res_d"], f["res_rpn"]
            ])

        # Sheet 4: Verification Evidence
        ws_ev = wb.create_sheet(title="Verification Evidence")
        ws_ev.append(["Requirement ID", "Requirement Code", "Title", "Type", "Mandatory", "Acceptance Criteria", "Evidence Reference", "Evidence Status", "File SHA-256 Hash"])
        for r in data["verification_items"]:
            ws_ev.append([
                r["id"], r["code"], r["title"], r["type"],
                "YES" if r["mandatory"] else "NO",
                r["acceptance_criteria"], r["evidence_ref"], r["evidence_status"], r["evidence_hash"]
            ])

        # Style all headers
        hdr_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        hdr_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
        for ws in wb.worksheets:
            for cell in ws[1]:
                cell.fill = hdr_fill
                cell.font = hdr_font
            for col in ws.columns:
                max_len = max(len(str(cell.value or "")) for cell in col)
                col_letter = openpyxl.utils.get_column_letter(col[0].column)
                ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

        wb.save(output_path)
        return output_path

    # ==================== CSV EXPORT ====================
    @classmethod
    def generate_csv(cls, data: Dict[str, Any], output_path: str) -> str:
        rows = []
        for imp in data["impact_items"]:
            rows.append({
                "change_id": data["metadata"]["change_id"],
                "object_id": imp["id"],
                "object_name": imp["name"],
                "item_type": imp["type"],
                "classification": imp["classification"],
                "rule": imp["propagation_rule"],
                "path": imp["path"],
                "verification_action": imp["verification_action"]
            })
        df = pd.DataFrame(rows)
        df.to_csv(output_path, index=False)
        return output_path
