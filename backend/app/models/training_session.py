from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.attendance import Attendance
    from app.models.result import Result


class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    attendance_records: Mapped[list["Attendance"]] = relationship(back_populates="session")
    results: Mapped[list["Result"]] = relationship(back_populates="session")
