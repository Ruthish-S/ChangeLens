import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "data"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/changelens.db")

class Settings(BaseModel):
    PROJECT_NAME: str = "ChangeLens"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = DATABASE_URL
    ALGORITHM_VERSION: str = "v1.2.0-deterministic-bfs"
    FMEA_RUBRIC_VERSION: str = "v2.0-aiag-vda-adapted"
    STORAGE_DIR: Path = BASE_DIR / "storage"
    REPORT_OUTPUT_DIR: Path = BASE_DIR / "storage" / "reports"

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
