import os
import json
import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.models import (
    ChangeRequest,
    ConfigurationBaseline,
    ChangeItem,
    ImpactResult,
    RiskAssessment,
    VerificationRequirement,
    EvidenceRecord,
    QualityGateEvaluation,
    Approval,
    WorkflowEvent,
    ReportRun,
    User
)
from backend.app.schemas.schemas import ReportRunResponse
from backend.app.services.report_engine.engine import ReportGeneratorService

router = APIRouter()

@router.get("", response_model=List[ReportRunResponse])
def list_reports(change_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ReportRun)
    if change_id:
        query = query.filter(ReportRun.change_request_id == change_id)
    return query.order_by(ReportRun.generated_at.desc()).all()

@router.post("/change-assessment/{change_id}", response_model=ReportRunResponse)
def generate_change_assessment_report(change_id: str, actor_id: str = "usr-lead-eng", db: Session = Depends(get_db)):
    cr = db.query(ChangeRequest).filter(ChangeRequest.id == change_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")

    actor = db.query(User).filter(User.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=400, detail="Invalid actor ID")

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

    meta = data["metadata"]
    report_id = meta["report_id"]
    pdf_path = str(settings.REPORT_OUTPUT_DIR / f"{report_id}.pdf")
    docx_path = str(settings.REPORT_OUTPUT_DIR / f"{report_id}.docx")
    xlsx_path = str(settings.REPORT_OUTPUT_DIR / f"{report_id}.xlsx")
    csv_path = str(settings.REPORT_OUTPUT_DIR / f"{report_id}.csv")

    ReportGeneratorService.generate_pdf(data, pdf_path)
    ReportGeneratorService.generate_docx(data, docx_path)
    ReportGeneratorService.generate_xlsx(data, xlsx_path)
    ReportGeneratorService.generate_csv(data, csv_path)

    run = ReportRun(
        id=report_id,
        report_type="CHANGE_ASSESSMENT",
        change_request_id=cr.id,
        template_version="1.0.0",
        source_snapshot_hash=meta["source_snapshot_hash"],
        generated_at=datetime.datetime.now(datetime.timezone.utc),
        generated_by_id=actor.id,
        file_path_pdf=pdf_path,
        file_path_docx=docx_path,
        file_path_xlsx=xlsx_path,
        file_path_csv=csv_path,
        summary_json=json.dumps({
            "title": cr.title,
            "impact_count": len(imps),
            "risk_count": len(risks),
            "evidence_count": len(evs),
            "state": cr.state
        })
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run

@router.get("/{report_id}/download/{format}")
def download_report_file(report_id: str, format: str, db: Session = Depends(get_db)):
    run = db.query(ReportRun).filter(ReportRun.id == report_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Report not found")

    fmt = format.lower()
    path_map = {
        "pdf": (run.file_path_pdf, "application/pdf", f"{report_id}.pdf"),
        "docx": (run.file_path_docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", f"{report_id}.docx"),
        "xlsx": (run.file_path_xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", f"{report_id}.xlsx"),
        "csv": (run.file_path_csv, "text/csv", f"{report_id}.csv"),
    }

    if fmt not in path_map:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: pdf, docx, xlsx, csv")

    file_path, media_type, filename = path_map[fmt]
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found on server disk")

    return FileResponse(file_path, media_type=media_type, filename=filename)
