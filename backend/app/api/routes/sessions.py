from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.attendance import AttendanceRead
from app.schemas.result import ResultRead
from app.schemas.session import TrainingSessionCreate, TrainingSessionRead
from app.services import attendance as attendance_service
from app.services import results as result_service
from app.services import sessions as session_service


router = APIRouter(prefix="/sessions", tags=["Training Sessions"])


@router.get("", response_model=list[TrainingSessionRead], summary="List training sessions")
def list_sessions(db: Session = Depends(get_db_session)) -> list:
    """Return all training sessions ordered newest first."""
    return session_service.list_sessions(db)


@router.post(
    "",
    response_model=TrainingSessionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create training session",
)
def create_session(payload: TrainingSessionCreate, db: Session = Depends(get_db_session)):
    """Create a training session with a required date."""
    return session_service.create_session(db, payload)


@router.put("/{session_id}", response_model=TrainingSessionRead, summary="Update training session")
def update_session(
    session_id: int,
    payload: TrainingSessionCreate,
    db: Session = Depends(get_db_session),
):
    """Update date, title, and notes for a training session."""
    return session_service.update_session(db, session_id, payload)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete training session")
def delete_session(session_id: int, db: Session = Depends(get_db_session)) -> Response:
    """Delete a session that has no linked attendance or results."""
    session_service.delete_session(db, session_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{session_id}/attendance",
    response_model=list[AttendanceRead],
    summary="Get session attendance",
)
def get_session_attendance(session_id: int, db: Session = Depends(get_db_session)) -> list:
    """Return all attendance records linked to a training session."""
    return attendance_service.list_session_attendance(db, session_id)


@router.get("/{session_id}/results", response_model=list[ResultRead], summary="Get session results")
def get_session_results(session_id: int, db: Session = Depends(get_db_session)) -> list:
    """Return all performance results linked to a training session."""
    return result_service.list_session_results(db, session_id)
