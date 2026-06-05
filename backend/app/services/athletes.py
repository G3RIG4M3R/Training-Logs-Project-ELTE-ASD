from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import ApiError
from app.models.athlete import Athlete
from app.models.attendance import Attendance
from app.models.clothing_size import ClothingSize
from app.models.result import Result
from app.models.training_session import TrainingSession
from app.schemas.athlete import AthleteCreate, AthleteSizesUpdate, AthleteUpdate


def list_athletes(db: Session) -> list[Athlete]:
    statement = (
        select(Athlete)
        .options(selectinload(Athlete.clothing_size))
        .where(Athlete.is_active.is_(True))
        .order_by(Athlete.name.asc())
    )
    return list(db.scalars(statement).all())


def get_active_athlete(db: Session, athlete_id: int) -> Athlete:
    statement = (
        select(Athlete)
        .options(selectinload(Athlete.clothing_size))
        .where(Athlete.id == athlete_id, Athlete.is_active.is_(True))
    )
    athlete = db.scalar(statement)
    if athlete is None:
        raise ApiError(404, "athlete_not_found", "Athlete not found")
    return athlete


def create_athlete(db: Session, payload: AthleteCreate) -> Athlete:
    athlete = Athlete(
        name=payload.name,
        date_of_birth=payload.date_of_birth,
        sex=payload.sex.value,
        height=payload.height,
        weight=payload.weight,
        notes=payload.notes,
    )
    athlete.clothing_size = ClothingSize(
        shirt_size=payload.shirt_size.value,
        short_size=payload.short_size.value,
        shoe_size=payload.shoe_size,
    )
    db.add(athlete)
    db.commit()
    db.refresh(athlete)
    return get_active_athlete(db, athlete.id)


def update_athlete(db: Session, athlete_id: int, payload: AthleteUpdate) -> Athlete:
    athlete = get_active_athlete(db, athlete_id)
    athlete.name = payload.name
    athlete.date_of_birth = payload.date_of_birth
    athlete.sex = payload.sex.value
    athlete.height = payload.height
    athlete.weight = payload.weight
    athlete.notes = payload.notes
    _set_sizes(athlete, payload.shirt_size.value, payload.short_size.value, payload.shoe_size)
    db.commit()
    db.refresh(athlete)
    return get_active_athlete(db, athlete.id)


def update_sizes(db: Session, athlete_id: int, payload: AthleteSizesUpdate) -> Athlete:
    athlete = get_active_athlete(db, athlete_id)
    _set_sizes(athlete, payload.shirt_size.value, payload.short_size.value, payload.shoe_size)
    db.commit()
    db.refresh(athlete)
    return get_active_athlete(db, athlete.id)


def soft_delete_athlete(db: Session, athlete_id: int) -> None:
    athlete = get_active_athlete(db, athlete_id)
    athlete.is_active = False
    db.commit()


def get_profile(db: Session, athlete_id: int) -> dict:
    athlete = get_active_athlete(db, athlete_id)
    attendance_statuses = db.scalars(
        select(Attendance.status).where(Attendance.athlete_id == athlete.id)
    ).all()
    counts = Counter(attendance_statuses)
    recent_results = db.scalars(
        select(Result)
        .join(TrainingSession)
        .where(Result.athlete_id == athlete.id)
        .order_by(Result.result_date.desc(), Result.id.desc())
        .limit(10)
    ).all()

    return {
        "id": athlete.id,
        "name": athlete.name,
        "date_of_birth": athlete.date_of_birth,
        "sex": athlete.sex,
        "height": athlete.height,
        "weight": athlete.weight,
        "notes": athlete.notes,
        "is_active": athlete.is_active,
        "shirt_size": athlete.shirt_size,
        "short_size": athlete.short_size,
        "shoe_size": athlete.shoe_size,
        "attendance_summary": {
            "total_sessions": len(attendance_statuses),
            "present": counts.get("present", 0),
            "absent": counts.get("absent", 0),
            "excused": counts.get("excused", 0),
        },
        "recent_results": [
            {
                "id": result.id,
                "session_id": result.session_id,
                "session_date": result.session.date if result.session else None,
                "event_name": result.event_name,
                "value": result.value,
                "unit": result.unit,
                "result_date": result.result_date,
                "notes": result.notes,
            }
            for result in recent_results
        ],
    }


def _set_sizes(athlete: Athlete, shirt_size: str, short_size: str, shoe_size: int) -> None:
    if athlete.clothing_size is None:
        athlete.clothing_size = ClothingSize(
            shirt_size=shirt_size,
            short_size=short_size,
            shoe_size=shoe_size,
        )
        return

    athlete.clothing_size.shirt_size = shirt_size
    athlete.clothing_size.short_size = short_size
    athlete.clothing_size.shoe_size = shoe_size
