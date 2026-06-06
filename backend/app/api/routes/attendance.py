from fastapi import APIRouter, Depends, Response, status
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


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Clear attendance record")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db_session)) -> Response:
    """Delete an attendance record so the athlete shows as not recorded."""
    attendance_service.delete_attendance(db, attendance_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
