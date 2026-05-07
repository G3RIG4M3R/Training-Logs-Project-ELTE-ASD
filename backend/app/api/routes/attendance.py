from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate
from app.services import attendance as attendance_service


router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post(
    "",
    response_model=AttendanceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Record attendance",
)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db_session)):
    """Create one attendance record for an athlete and session."""
    return attendance_service.create_attendance(db, payload)


@router.put("/{attendance_id}", response_model=AttendanceRead, summary="Update attendance")
def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db_session),
):
    """Update attendance status and notes."""
    return attendance_service.update_attendance(db, attendance_id, payload)
