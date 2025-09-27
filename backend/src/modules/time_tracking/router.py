from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/time-entries", tags=["time-tracking"])

@router.post("/", response_model=schemas.TimeEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_time_entry(
    time_entry: schemas.TimeEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_service = service.TimeEntryService(db)
    return await time_service.create(time_entry, current_user.id)

@router.get("/", response_model=List[schemas.TimeEntryResponse])
async def list_time_entries(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[UUID] = None,
    billable: Optional[bool] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_service = service.TimeEntryService(db)
    return await time_service.get_all(
        skip, limit, current_user.id, case_id, billable, start_date, end_date
    )

@router.get("/{time_entry_id}", response_model=schemas.TimeEntryResponse)
async def get_time_entry(
    time_entry_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_service = service.TimeEntryService(db)
    db_time_entry = await time_service.get_by_id(time_entry_id)
    if not db_time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    return db_time_entry

@router.put("/{time_entry_id}", response_model=schemas.TimeEntryResponse)
async def update_time_entry(
    time_entry_id: UUID,
    time_entry: schemas.TimeEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_service = service.TimeEntryService(db)
    db_time_entry = await time_service.update(time_entry_id, time_entry)
    if not db_time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    return db_time_entry

@router.delete("/{time_entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(
    time_entry_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_service = service.TimeEntryService(db)
    success = await time_service.delete(time_entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Time entry not found")

@router.get("/summary/dashboard", response_model=schemas.TimeSummary)
async def get_time_summary(
    case_id: Optional[UUID] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Default to last 30 days if no dates provided
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    time_service = service.TimeEntryService(db)
    return await time_service.get_summary(
        current_user.id, case_id, start_date, end_date
    )