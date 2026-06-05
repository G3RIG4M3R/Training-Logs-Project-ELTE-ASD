from datetime import date

from pydantic import Field, field_validator

from app.schemas.base import APIModel
from app.schemas.common import AttendanceStatus


class AttendanceCreate(APIModel):
    athlete_id: int = Field(gt=0)
    session_id: int = Field(gt=0)
    status: AttendanceStatus = AttendanceStatus.present
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class AttendanceUpdate(APIModel):
    status: AttendanceStatus
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class AttendanceRead(APIModel):
    id: int
    athlete_id: int
    session_id: int
    status: AttendanceStatus
    notes: str | None = None
    athlete_name: str | None = None
    session_date: date | None = None
