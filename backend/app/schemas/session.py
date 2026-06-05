from datetime import date

from pydantic import Field, field_validator

from app.schemas.base import APIModel


class TrainingSessionBase(APIModel):
    date: date
    title: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("title", "notes")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class TrainingSessionCreate(TrainingSessionBase):
    pass


class TrainingSessionRead(TrainingSessionBase):
    id: int
