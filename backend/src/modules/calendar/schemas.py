from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

class EventType(str, Enum):
    HEARING = "hearing"
    MEETING = "meeting"
    DEADLINE = "deadline"
    TASK = "task"
    REMINDER = "reminder"
    COURT = "court"
    CLIENT = "client"
    INTERNAL = "internal"

class EventPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class CalendarEventBase(BaseModel):
    title: str = Field(..., max_length=200)
    type: EventType = EventType.MEETING
    priority: EventPriority = EventPriority.MEDIUM
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    all_day: bool = False
    timezone: str = Field("Europe/Kyiv", max_length=50)
    
    # Відносини
    case_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    
    # Локація
    location: Optional[str] = Field(None, max_length=200)
    online_meeting_link: Optional[str] = Field(None, max_length=500)
    
    # Повторення
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = Field(None, max_length=50)
    recurrence_end: Optional[datetime] = None
    
    # Учасники та нагадування
    attendees: Optional[List[Dict[str, Any]]] = None
    reminders: Optional[List[Dict[str, Any]]] = None
    send_notifications: bool = True

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    type: Optional[EventType] = None
    priority: Optional[EventPriority] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(scheduled|confirmed|cancelled|completed)$")
    location: Optional[str] = Field(None, max_length=200)
    online_meeting_link: Optional[str] = Field(None, max_length=500)

class CalendarEventResponse(CalendarEventBase):
    id: UUID
    created_by_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CalendarView(BaseModel):
    events: List[CalendarEventResponse]
    busy_slots: List[Dict[str, datetime]]
    available_slots: List[Dict[str, datetime]]