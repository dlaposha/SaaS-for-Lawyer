from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class TimeEntryBase(BaseModel):
    case_id: UUID
    task_id: Optional[UUID] = None
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = Field(None, ge=0)  # in hours
    billable: bool = True
    category: Optional[str] = Field(None, max_length=50)
    rate: Optional[float] = Field(None, ge=0)
    tags: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(BaseModel):
    description: Optional[str] = None
    end_time: Optional[datetime] = None
    duration: Optional[float] = Field(None, ge=0)
    billable: Optional[bool] = None
    category: Optional[str] = Field(None, max_length=50)
    rate: Optional[float] = Field(None, ge=0)
    tags: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None

class TimeEntryResponse(TimeEntryBase):
    id: UUID
    user_id: UUID
    billed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TimeSummary(BaseModel):
    total_hours: float
    billable_hours: float
    non_billable_hours: float
    total_amount: float
    by_category: dict
    by_case: dict