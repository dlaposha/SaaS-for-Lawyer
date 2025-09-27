from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/hearings", tags=["hearings"])

@router.post("/", response_model=schemas.HearingResponse, status_code=status.HTTP_201_CREATED)
async def create_hearing(
    hearing: schemas.HearingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearing_service = service.HearingService(db)
    return await hearing_service.create(hearing, current_user.id)

@router.get("/", response_model=List[schemas.HearingResponse])
async def list_hearings(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[UUID] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    upcoming: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearing_service = service.HearingService(db)
    return await hearing_service.get_all(skip, limit, case_id, status, type, upcoming)

@router.get("/{hearing_id}", response_model=schemas.HearingResponse)
async def get_hearing(
    hearing_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearing_service = service.HearingService(db)
    db_hearing = await hearing_service.get_by_id(hearing_id)
    if not db_hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    return db_hearing

@router.put("/{hearing_id}", response_model=schemas.HearingResponse)
async def update_hearing(
    hearing_id: UUID,
    hearing: schemas.HearingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearing_service = service.HearingService(db)
    db_hearing = await hearing_service.update(hearing_id, hearing)
    if not db_hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    return db_hearing

@router.delete("/{hearing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hearing(
    hearing_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearing_service = service.HearingService(db)
    success = await hearing_service.delete(hearing_id)
    if not success:
        raise HTTPException(status_code=404, detail="Hearing not found")

@router.get("/upcoming/{days}", response_model=List[schemas.HearingResponse])
async def get_upcoming_hearings(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearing_service = service.HearingService(db)
    return await hearing_service.get_upcoming_hearings(days)

@router.get("/stats/dashboard", response_model=schemas.HearingStats)
async def get_hearing_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearing_service = service.HearingService(db)
    return await hearing_service.get_stats()