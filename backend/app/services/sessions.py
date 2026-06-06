from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.models.training_session import TrainingSession
from app.schemas.session import TrainingSessionCreate


def list_sessions(db: Session) -> list[TrainingSession]:
    statement = select(TrainingSession).order_by(TrainingSession.date.desc(), TrainingSession.id.desc())
    return list(db.scalars(statement).all())


def get_session(db: Session, session_id: int) -> TrainingSession:
    session = db.get(TrainingSession, session_id)
    if session is None:
        raise ApiError(404, "session_not_found", "Training session not found")
    return session


def create_session(db: Session, payload: TrainingSessionCreate) -> TrainingSession:
    session = TrainingSession(date=payload.date, title=payload.title, notes=payload.notes)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def update_session(db: Session, session_id: int, payload: TrainingSessionCreate) -> TrainingSession:
    session = get_session(db, session_id)
    session.date = payload.date
    session.title = payload.title
    session.notes = payload.notes
    db.commit()
    db.refresh(session)
    return session


def delete_session(db: Session, session_id: int) -> None:
    session = get_session(db, session_id)
    if session.attendance_records or session.results:
        raise ApiError(
            409,
            "session_has_records",
            "Cannot delete a session that has attendance or results",
        )
    db.delete(session)
    db.commit()
