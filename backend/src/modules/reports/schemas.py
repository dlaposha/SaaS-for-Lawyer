from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
import enum

# Імпорт enum з файлу enums.py
from .enums import ReportType, ReportFormat, ReportFrequency, ReportStatus

class ReportBase(BaseModel):
    title: str = Field(..., max_length=200, description="Назва звіту")
    description: Optional[str] = Field(None, max_length=1000, description="Опис звіту")
    report_type: ReportType = Field(..., description="Тип звіту")
    report_format: ReportFormat = Field(default=ReportFormat.PDF, description="Формат звіту")
    frequency: Optional[ReportFrequency] = Field(None, description="Частота генерації")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Параметри фільтрації")
    filters: Optional[Dict[str, Any]] = Field(None, description="Додаткові фільтри")
    is_automated: bool = Field(default=False, description="Автоматична генерація")
    is_active: bool = Field(default=True, description="Активність звіту")

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200, description="Назва звіту")
    description: Optional[str] = Field(None, max_length=1000, description="Опис звіту")
    frequency: Optional[ReportFrequency] = Field(None, description="Частота генерації")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Параметри фільтрації")
    filters: Optional[Dict[str, Any]] = Field(None, description="Додаткові фільтри")
    is_automated: Optional[bool] = Field(None, description="Автоматична генерація")
    is_active: Optional[bool] = Field(None, description="Активність звіту")
    status: Optional[ReportStatus] = Field(None, description="Статус звіту")

class ReportResponse(ReportBase):
    id: UUID
    created_by_id: UUID
    data: Optional[Dict[str, Any]]
    summary: Optional[Dict[str, Any]]
    status: ReportStatus
    last_generated: Optional[datetime]
    next_run: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int
    page: int
    size: int

class FinancialReport(BaseModel):
    period: str
    total_revenue: float
    total_expenses: float
    net_profit: float
    by_category: Dict[str, float]
    trends: Dict[str, List[float]]

class CaseReport(BaseModel):
    total_cases: int
    active_cases: int
    closed_cases: int
    success_rate: float
    average_duration: float
    by_practice_area: Dict[str, int]

class ClientActivityReport(BaseModel):
    total_clients: int
    active_clients: int
    new_clients: int
    client_retention_rate: float
    by_activity_level: Dict[str, int]

class TimeTrackingReport(BaseModel):
    total_hours: float
    billable_hours: float
    non_billable_hours: float
    by_user: Dict[str, float]
    by_project: Dict[str, float]
    productivity_trends: List[float]

class ReportGenerationRequest(BaseModel):
    report_type: ReportType
    parameters: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    format: ReportFormat = ReportFormat.PDF

class ReportGenerationResponse(BaseModel):
    report_id: UUID
    status: ReportStatus
    message: str
    download_url: Optional[str] = None

# Схеми для специфічних типів звітів
class HearingScheduleReport(BaseModel):
    total_hearings: int
    upcoming_hearings: int
    completed_hearings: int
    cancelled_hearings: int
    by_court: Dict[str, int]
    by_judge: Dict[str, int]

class TaskCompletionReport(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_rate: float
    by_assignee: Dict[str, int]
    by_priority: Dict[str, int]

# Додано відсутню схему ReportStats
class ReportStats(BaseModel):
    total_reports: int
    completed_reports: int
    failed_reports: int
    by_type: Dict[str, int]
    by_status: Dict[str, int]
    by_frequency: Dict[str, int]
    automated_reports: int

# Додаткові схеми
class ReportTypeStats(BaseModel):
    report_type: str
    count: int
    percentage: float

class ReportStatusStats(BaseModel):
    status: str
    count: int
    percentage: float

class ReportFrequencyStats(BaseModel):
    frequency: str
    count: int
    percentage: float