from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.result import ResultCreate, ResultRead, ResultUpdate
from app.services import results as result_service


router = APIRouter(prefix="/results", tags=["Results"])


@router.post(
    "",
    response_model=ResultRead,
    status_code=status.HTTP_201_CREATED,
    summary="Record result",
)
def create_result(payload: ResultCreate, db: Session = Depends(get_db_session)):
    """Store one generic performance result for an athlete and session."""
    return result_service.create_result(db, payload)


@router.put("/{result_id}", response_model=ResultRead, summary="Update result")
def update_result(
    result_id: int,
    payload: ResultUpdate,
    db: Session = Depends(get_db_session),
):
    """Update event name, value, unit, date, and notes for a result."""
    return result_service.update_result(db, result_id, payload)


@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete result")
def delete_result(result_id: int, db: Session = Depends(get_db_session)) -> Response:
    """Permanently delete a result record."""
    result_service.delete_result(db, result_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
