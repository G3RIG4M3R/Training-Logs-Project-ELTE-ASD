from datetime import date

from pydantic import Field, field_validator

from app.schemas.base import APIModel
from app.schemas.common import ClothingSizeValue, Sex


class SizeFields(APIModel):
    shirt_size: ClothingSizeValue = Field(default=ClothingSizeValue.M)
    short_size: ClothingSizeValue = Field(default=ClothingSizeValue.M)
    shoe_size: int = Field(ge=30, le=55)


class AthleteBase(APIModel):
    name: str = Field(min_length=1, max_length=120)
    date_of_birth: date
    sex: Sex
    height: int = Field(ge=100, le=250)
    weight: int = Field(ge=30, le=200)
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Name is required")
        return stripped

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value

    @field_validator("notes")
    @classmethod
    def normalize_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class AthleteCreate(AthleteBase, SizeFields):
    pass


class AthleteUpdate(AthleteBase, SizeFields):
    pass


class AthleteSizesUpdate(SizeFields):
    pass


class AthleteRead(AthleteBase, SizeFields):
    id: int
    is_active: bool = True


class AthleteAttendanceSummary(APIModel):
    total_sessions: int
    present: int
    absent: int
    excused: int


class AthleteResultSummary(APIModel):
    id: int
    session_id: int
    session_date: date | None = None
    event_name: str
    value: float
    unit: str
    result_date: date
    notes: str | None = None


class AthleteProfile(AthleteRead):
    attendance_summary: AthleteAttendanceSummary
    recent_results: list[AthleteResultSummary]
