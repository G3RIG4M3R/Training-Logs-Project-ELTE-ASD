from datetime import date

from pydantic import Field, field_validator

from app.schemas.base import APIModel


class ResultCreate(APIModel):
    athlete_id: int = Field(gt=0)
    session_id: int = Field(gt=0)
    event_name: str = Field(min_length=1, max_length=120)
    value: float = Field(ge=0)
    unit: str = Field(min_length=1, max_length=24)
    result_date: date | None = None
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("event_name", "unit")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Value is required")
        return stripped

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class ResultRead(APIModel):
    id: int
    athlete_id: int
    session_id: int
    event_name: str
    value: float
    unit: str
    result_date: date
    notes: str | None = None
    athlete_name: str | None = None
    session_date: date | None = None
