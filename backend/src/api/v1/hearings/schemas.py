from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

class HearingType(str, Enum):
    PRELIMINARY = "preliminary"
    MOTION = "motion"
    TRIAL = "trial"
    SETTLEMENT = "settlement"
    APPEAL = "appeal"
    OTHER = "other"

class HearingStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ADJOURNED = "adjourned"

class HearingBase(BaseModel):
    case_id: UUID
    title: str = Field(..., max_length=200)
    type: HearingType = HearingType.OTHER
    status: HearingStatus = HearingStatus.SCHEDULED
    hearing_date: datetime
    duration: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    courtroom: Optional[str] = Field(None, max_length=100)
    judge: Optional[str] = Field(None, max_length=100)
    case_number: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    participants: Optional[List[Dict[str, Any]]] = None
    required_attendees: Optional[List[str]] = None
    documents_required: Optional[List[str]] = None
    notes: Optional[str] = None

class HearingCreate(HearingBase):
    pass

class HearingUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    status: Optional[HearingStatus] = None
    hearing_date: Optional[datetime] = None
    duration: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    preparation_status: Optional[str] = Field(None, pattern="^(not_started|in_progress|completed)$")
    outcome: Optional[str] = None
    next_steps: Optional[str] = None
    next_hearing_date: Optional[datetime] = None
    notes: Optional[str] = None

class HearingResponse(HearingBase):
    id: UUID
    created_by_id: UUID
    preparation_status: str
    outcome: Optional[str]
    next_steps: Optional[str]
    next_hearing_date: Optional[datetime]
    reminders_sent: bool
    last_reminder_sent: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class HearingStats(BaseModel):
    total_hearings: int
    upcoming_hearings: int
    completed_hearings: int
    by_type: dict
    by_status: dict