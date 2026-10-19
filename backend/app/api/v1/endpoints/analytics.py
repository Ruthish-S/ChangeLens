from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from backend.app.core.database import get_db
from backend.app.analytics.engine import AnalyticsEngine

router = APIRouter()

@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    return AnalyticsEngine.get_overview_metrics(db)

@router.get("/risk-landscape")
def get_risk_landscape(db: Session = Depends(get_db)):
    return AnalyticsEngine.get_risk_landscape(db)

@router.get("/gate-bottlenecks")
def get_gate_bottlenecks(db: Session = Depends(get_db)):
    return AnalyticsEngine.get_gate_bottlenecks(db)

@router.get("/review-cycle-trends")
def get_review_cycle_trends(db: Session = Depends(get_db)):
    return AnalyticsEngine.get_review_cycle_trends(db)

@router.get("/evidence-completeness")
def get_evidence_completeness(db: Session = Depends(get_db)):
    return AnalyticsEngine.get_evidence_completeness_distribution(db)
