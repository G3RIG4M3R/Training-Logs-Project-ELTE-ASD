from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.athlete import Athlete


class ClothingSize(Base):
    __tablename__ = "clothing_sizes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athletes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    shirt_size: Mapped[str] = mapped_column(String(8), nullable=False)
    short_size: Mapped[str] = mapped_column(String(8), nullable=False)
    shoe_size: Mapped[int] = mapped_column(Integer, nullable=False)

    athlete: Mapped["Athlete"] = relationship(back_populates="clothing_size")
