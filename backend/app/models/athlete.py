from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.attendance import Attendance
    from app.models.clothing_size import ClothingSize
    from app.models.result import Result


class Athlete(Base):
    __tablename__ = "athletes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    sex: Mapped[str] = mapped_column(String(12), nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    weight: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    clothing_size: Mapped["ClothingSize"] = relationship(
        back_populates="athlete",
        cascade="all, delete-orphan",
        uselist=False,
    )
    attendance_records: Mapped[list["Attendance"]] = relationship(back_populates="athlete")
    results: Mapped[list["Result"]] = relationship(back_populates="athlete")

    @property
    def shirt_size(self) -> str | None:
        return self.clothing_size.shirt_size if self.clothing_size else None

    @property
    def short_size(self) -> str | None:
        return self.clothing_size.short_size if self.clothing_size else None

    @property
    def shoe_size(self) -> int | None:
        return self.clothing_size.shoe_size if self.clothing_size else None
