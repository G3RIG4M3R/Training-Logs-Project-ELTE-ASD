from dataclasses import dataclass
import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = f"sqlite:///{BACKEND_DIR / 'training_logs.sqlite3'}"
DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


@dataclass(frozen=True)
class Settings:
    database_url: str
    cors_origins: tuple[str, ...]
    app_name: str = "Training Logs API"
    api_version: str = "0.1.0"


def _get_cors_origins() -> tuple[str, ...]:
    raw_origins = os.getenv("CORS_ORIGINS")
    if not raw_origins:
        return DEFAULT_CORS_ORIGINS
    return tuple(origin.strip() for origin in raw_origins.split(",") if origin.strip())


def get_settings() -> Settings:
    return Settings(
        database_url=os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL),
        cors_origins=_get_cors_origins(),
    )
