from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.errors import ApiError
from app.models.result import Result
from app.schemas.result import ResultCreate, ResultUpdate
from app.services.athletes import get_active_athlete
from app.services.sessions import get_session


def create_result(db: Session, payload: ResultCreate) -> Result:
    get_active_athlete(db, payload.athlete_id)
    session = get_session(db, payload.session_id)
    result = Result(
        athlete_id=payload.athlete_id,
        session_id=payload.session_id,
        event_name=payload.event_name,
        value=payload.value,
        unit=payload.unit,
        result_date=payload.result_date or session.date,
        notes=payload.notes,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return get_result(db, result.id)


def get_result(db: Session, result_id: int) -> Result:
    statement = (
        select(Result)
        .options(joinedload(Result.athlete), joinedload(Result.session))
        .where(Result.id == result_id)
    )
    result = db.scalar(statement)
    if result is None:
        raise ApiError(404, "result_not_found", "Result not found")
    return result


def list_athlete_results(db: Session, athlete_id: int) -> list[Result]:
    get_active_athlete(db, athlete_id)
    statement = (
        select(Result)
        .options(joinedload(Result.athlete), joinedload(Result.session))
        .where(Result.athlete_id == athlete_id)
        .order_by(Result.result_date.desc(), Result.id.desc())
    )
    return list(db.scalars(statement).all())


def update_result(db: Session, result_id: int, payload: ResultUpdate) -> Result:
    result = get_result(db, result_id)
    result.event_name = payload.event_name
    result.value = payload.value
    result.unit = payload.unit
    result.result_date = payload.result_date or result.result_date
    result.notes = payload.notes
    db.commit()
    return get_result(db, result_id)


def delete_result(db: Session, result_id: int) -> None:
    result = get_result(db, result_id)
    db.delete(result)
    db.commit()


def list_session_results(db: Session, session_id: int) -> list[Result]:
    get_session(db, session_id)
    statement = (
        select(Result)
        .options(joinedload(Result.athlete), joinedload(Result.session))
        .where(Result.session_id == session_id)
        .order_by(Result.event_name.asc(), Result.id.asc())
    )
    return list(db.scalars(statement).all())
