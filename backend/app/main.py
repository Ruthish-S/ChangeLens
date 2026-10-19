from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api.v1.api import api_router
from backend.app.core.seed_data import seed_database

# Create tables and seed initial data if needed
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="ChangeLens API",
    description="Explainable Change-Impact & Quality Gate Intelligence for Manufacturing",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount reports directory for direct downloads if needed
app.mount("/static/reports", StaticFiles(directory=str(settings.REPORT_OUTPUT_DIR)), name="reports")

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ChangeLens API",
        "version": settings.VERSION,
        "algorithm_version": settings.ALGORITHM_VERSION
    }
