from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/", response_model=schemas.ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report: schemas.ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Створення нового звіту"""
    report_service = service.ReportService(db)
    return await report_service.create(report, current_user.id)

@router.get("/", response_model=List[schemas.ReportResponse])
async def list_reports(
    skip: int = 0,
    limit: int = 100,
    report_type: Optional[schemas.ReportType] = None,
    status: Optional[schemas.ReportStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання списку звітів"""
    report_service = service.ReportService(db)
    return await report_service.get_all(skip, limit, report_type, status)

@router.get("/{report_id}", response_model=schemas.ReportResponse)
async def get_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання звіту за ID"""
    report_service = service.ReportService(db)
    db_report = await report_service.get_by_id(report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    return db_report

@router.put("/{report_id}", response_model=schemas.ReportResponse)
async def update_report(
    report_id: UUID,
    report: schemas.ReportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Оновлення звіту"""
    report_service = service.ReportService(db)
    db_report = await report_service.update(report_id, report)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    return db_report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Видалення звіту"""
    report_service = service.ReportService(db)
    success = await report_service.delete(report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")

@router.post("/{report_id}/generate", response_model=schemas.ReportGenerationResponse)
async def generate_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Генерація звіту"""
    report_service = service.ReportService(db)
    return await report_service.generate_report(report_id, current_user)

@router.get("/stats/dashboard", response_model=schemas.ReportStats)
async def get_report_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання статистики звітів"""
    report_service = service.ReportService(db)
    return await report_service.get_stats()

# Додаткові ендпоінти для специфічних типів звітів
@router.get("/financial/{period}", response_model=schemas.FinancialReport)
async def get_financial_report(
    period: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання фінансового звіту за період"""
    report_service = service.ReportService(db)
    # Тут буде логіка отримання фінансового звіту
    return schemas.FinancialReport(
        period=period,
        total_revenue=0.0,
        total_expenses=0.0,
        net_profit=0.0,
        by_category={},
        trends={}
    )

@router.get("/cases/{case_id}", response_model=schemas.CaseReport)
async def get_case_report(
    case_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання звіту по справі"""
    report_service = service.ReportService(db)
    # Тут буде логіка отримання звіту по справі
    return schemas.CaseReport(
        total_cases=0,
        active_cases=0,
        closed_cases=0,
        success_rate=0.0,
        average_duration=0.0,
        by_practice_area={}
    )

@router.get("/clients/activity", response_model=schemas.ClientActivityReport)
async def get_client_activity_report(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання звіту по активності клієнтів"""
    report_service = service.ReportService(db)
    # Тут буде логіка отримання звіту по активності клієнтів
    return schemas.ClientActivityReport(
        total_clients=0,
        active_clients=0,
        new_clients=0,
        client_retention_rate=0.0,
        by_activity_level={}
    )

@router.get("/time-tracking/{user_id}", response_model=schemas.TimeTrackingReport)
async def get_time_tracking_report(
    user_id: UUID,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання звіту по відстеженню часу"""
    report_service = service.ReportService(db)
    # Тут буде логіка отримання звіту по відстеженню часу
    return schemas.TimeTrackingReport(
        total_hours=0.0,
        billable_hours=0.0,
        non_billable_hours=0.0,
        by_user={},
        by_project={},
        productivity_trends=[]
    )

@router.get("/hearings/schedule", response_model=schemas.HearingScheduleReport)
async def get_hearing_schedule_report(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання звіту по графіку судових засідань"""
    report_service = service.ReportService(db)
    # Тут буде логіка отримання звіту по графіку судових засідань
    return schemas.HearingScheduleReport(
        total_hearings=0,
        upcoming_hearings=0,
        completed_hearings=0,
        cancelled_hearings=0,
        by_court={},
        by_judge={}
    )

@router.get("/tasks/completion", response_model=schemas.TaskCompletionReport)
async def get_task_completion_report(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримання звіту по завершенню завдань"""
    report_service = service.ReportService(db)
    # Тут буде логіка отримання звіту по завершенню завдань
    return schemas.TaskCompletionReport(
        total_tasks=0,
        completed_tasks=0,
        pending_tasks=0,
        overdue_tasks=0,
        completion_rate=0.0,
        by_assignee={},
        by_priority={}
    )