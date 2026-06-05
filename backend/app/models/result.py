from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.athlete import Athlete
    from app.models.training_session import TrainingSession


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey("athletes.id"), nullable=False, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("training_sessions.id"), nullable=False, index=True)
    event_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(24), nullable=False)
    result_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    athlete: Mapped["Athlete"] = relationship(back_populates="results")
    session: Mapped["TrainingSession"] = relationship(back_populates="results")

    @property
    def athlete_name(self) -> str | None:
        return self.athlete.name if self.athlete else None

    @property
    def session_date(self) -> date | None:
        return self.session.date if self.session else None
