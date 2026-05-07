from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.result import ResultCreate, ResultRead
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
