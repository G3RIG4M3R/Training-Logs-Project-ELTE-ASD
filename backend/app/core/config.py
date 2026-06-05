from dataclasses import dataclass
import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = f"sqlite:///{BACKEND_DIR / 'training_logs.sqlite3'}"


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
    app_name: str = "Training Logs API"
    api_version: str = "0.1.0"


def get_settings() -> Settings:
    return Settings()
