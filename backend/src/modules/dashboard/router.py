from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ....core.database import get_db
from ....core.security import get_current_user
from .service import DashboardService
from .schemas import DashboardStatsResponse, ActivityTimelineResponse

router = APIRouter()

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Отримати статистику для dashboard"""
    service = DashboardService(db)
    stats = await service.get_overview_stats(current_user.id)
    return stats

@router.get("/activity-timeline", response_model=ActivityTimelineResponse)
async def get_activity_timeline(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Отримати таймлайн активності"""
    service = DashboardService(db)
    activities = await service.get_activity_timeline(current_user.id, days)
    return {"activities": activities, "total_count": len(activities)}