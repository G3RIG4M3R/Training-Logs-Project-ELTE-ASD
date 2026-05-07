from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.errors import ApiError
from app.models.attendance import Attendance
from app.models.athlete import Athlete
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate
from app.services.athletes import get_active_athlete
from app.services.sessions import get_session


def create_attendance(db: Session, payload: AttendanceCreate) -> Attendance:
    get_active_athlete(db, payload.athlete_id)
    get_session(db, payload.session_id)
    existing = db.scalar(
        select(Attendance).where(
            Attendance.athlete_id == payload.athlete_id,
            Attendance.session_id == payload.session_id,
        )
    )
    if existing is not None:
        raise ApiError(
            409,
            "attendance_duplicate",
            "Attendance already exists for this athlete and session",
        )

    attendance = Attendance(
        athlete_id=payload.athlete_id,
        session_id=payload.session_id,
        status=payload.status.value,
        notes=payload.notes,
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return get_attendance(db, attendance.id)


def get_attendance(db: Session, attendance_id: int) -> Attendance:
    statement = (
        select(Attendance)
        .options(joinedload(Attendance.athlete), joinedload(Attendance.session))
        .where(Attendance.id == attendance_id)
    )
    attendance = db.scalar(statement)
    if attendance is None:
        raise ApiError(404, "attendance_not_found", "Attendance record not found")
    return attendance


def update_attendance(db: Session, attendance_id: int, payload: AttendanceUpdate) -> Attendance:
    attendance = get_attendance(db, attendance_id)
    attendance.status = payload.status.value
    attendance.notes = payload.notes
    db.commit()
    db.refresh(attendance)
    return get_attendance(db, attendance.id)


def list_session_attendance(db: Session, session_id: int) -> list[Attendance]:
    get_session(db, session_id)
    statement = (
        select(Attendance)
        .join(Athlete)
        .options(joinedload(Attendance.athlete), joinedload(Attendance.session))
        .where(Attendance.session_id == session_id)
        .order_by(Athlete.name.asc())
    )
    return list(db.scalars(statement).all())
