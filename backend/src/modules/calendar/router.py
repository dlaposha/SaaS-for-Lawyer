from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from . import service, schemas
from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.auth.models import User

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.post("/events", response_model=schemas.CalendarEventResponse)
async def create_event(
    event_data: schemas.CalendarEventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    calendar_service = service.CalendarService(db)
    return await calendar_service.create(event_data, current_user.id)

@router.get("/events", response_model=List[schemas.CalendarEventResponse])
async def get_events(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    user_id: Optional[UUID] = Query(None),
    event_type: Optional[str] = Query(None),
    case_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    calendar_service = service.CalendarService(db)
    return await calendar_service.get_all(
        start_date=start_date,
        end_date=end_date,
        user_id=user_id or current_user.id,
        event_type=event_type,
        case_id=case_id
    )

@router.get("/events/{event_id}", response_model=schemas.CalendarEventResponse)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    calendar_service = service.CalendarService(db)
    event = await calendar_service.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/available-slots", response_model=List[schemas.CalendarView])
async def get_available_slots(
    date: datetime = Query(...),
    duration_minutes: int = Query(60, ge=15, le=480),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    calendar_service = service.CalendarService(db)
    slots = await calendar_service.get_available_slots(date, current_user.id, duration_minutes)
    return [{"events": [], "busy_slots": [], "available_slots": slots}]

@router.get("/conflicts", response_model=List[schemas.CalendarEventResponse])
async def check_conflicts(
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    calendar_service = service.CalendarService(db)
    return await calendar_service.check_conflicts(start_time, end_time, current_user.id)