from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    changes,
    impact,
    risks,
    evidence,
    governance,
    reports,
    analytics,
    baselines
)

api_router = APIRouter()

api_router.include_router(changes.router, prefix="/changes", tags=["Change Requests"])
api_router.include_router(impact.router, prefix="/changes", tags=["Impact Analysis"])
api_router.include_router(risks.router, prefix="/changes", tags=["Risk Management & FMEA"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["Verification Evidence & Quality Gates"])
api_router.include_router(governance.router, prefix="/governance", tags=["Workflow & Governance"])
api_router.include_router(reports.router, prefix="/reports", tags=["Automated Reports"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(baselines.router, prefix="/baselines", tags=["Configuration Baselines"])
