from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

class ReportBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    report_type: str = Field(..., max_length=50)
    frequency: Optional[str] = Field(None, max_length=20)
    parameters: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    is_automated: bool = False

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    frequency: Optional[str] = Field(None, max_length=20)
    parameters: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None

class ReportResponse(ReportBase):
    id: UUID
    created_by_id: UUID
    data: Optional[Dict[str, Any]]
    summary: Optional[Dict[str, Any]]
    status: str
    last_generated: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

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