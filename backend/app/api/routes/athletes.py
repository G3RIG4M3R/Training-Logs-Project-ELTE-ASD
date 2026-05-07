from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.athlete import AthleteCreate, AthleteProfile, AthleteRead, AthleteSizesUpdate, AthleteUpdate
from app.schemas.result import ResultRead
from app.services import athletes as athlete_service
from app.services import results as result_service


router = APIRouter(prefix="/athletes", tags=["Athletes"])


@router.get("", response_model=list[AthleteRead], summary="List all active athletes")
def list_athletes(db: Session = Depends(get_db_session)) -> list:
    """Return active athletes sorted by name."""
    return athlete_service.list_athletes(db)


@router.post(
    "",
    response_model=AthleteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an athlete",
)
def create_athlete(payload: AthleteCreate, db: Session = Depends(get_db_session)):
    """Create a new athlete profile with clothing and shoe sizes."""
    return athlete_service.create_athlete(db, payload)


@router.get("/{athlete_id}", response_model=AthleteRead, summary="Get athlete by ID")
def get_athlete(athlete_id: int, db: Session = Depends(get_db_session)):
    """Return one active athlete by ID."""
    return athlete_service.get_active_athlete(db, athlete_id)


@router.put("/{athlete_id}", response_model=AthleteRead, summary="Update athlete")
def update_athlete(
    athlete_id: int,
    payload: AthleteUpdate,
    db: Session = Depends(get_db_session),
):
    """Update an athlete profile and size fields."""
    return athlete_service.update_athlete(db, athlete_id, payload)


@router.delete("/{athlete_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete athlete")
def delete_athlete(athlete_id: int, db: Session = Depends(get_db_session)) -> Response:
    """Soft-delete an athlete so historical records remain available."""
    athlete_service.soft_delete_athlete(db, athlete_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{athlete_id}/profile", response_model=AthleteProfile, summary="Get athlete profile")
def get_athlete_profile(athlete_id: int, db: Session = Depends(get_db_session)) -> dict:
    """Return full athlete data with attendance summary and recent results."""
    return athlete_service.get_profile(db, athlete_id)


@router.get("/{athlete_id}/results", response_model=list[ResultRead], summary="Get athlete results")
def get_athlete_results(athlete_id: int, db: Session = Depends(get_db_session)) -> list:
    """Return one athlete's results ordered newest first."""
    return result_service.list_athlete_results(db, athlete_id)


@router.put("/{athlete_id}/sizes", response_model=AthleteRead, summary="Update athlete clothing sizes")
def update_athlete_sizes(
    athlete_id: int,
    payload: AthleteSizesUpdate,
    db: Session = Depends(get_db_session),
):
    """Update shirt, shorts, and shoe sizes for an athlete."""
    return athlete_service.update_sizes(db, athlete_id, payload)
