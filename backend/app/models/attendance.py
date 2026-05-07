from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from datetime import date

    from app.models.athlete import Athlete
    from app.models.training_session import TrainingSession


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("athlete_id", "session_id", name="uq_attendance_athlete_session"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey("athletes.id"), nullable=False, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("training_sessions.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="present")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    athlete: Mapped["Athlete"] = relationship(back_populates="attendance_records")
    session: Mapped["TrainingSession"] = relationship(back_populates="attendance_records")

    @property
    def athlete_name(self) -> str | None:
        return self.athlete.name if self.athlete else None

    @property
    def session_date(self) -> "date | None":
        return self.session.date if self.session else None
