from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"
    CANCELLED = "cancelled"

class TaskType(str, Enum):
    GENERAL = "general"
    MEETING = "meeting"
    DOCUMENT = "document"
    RESEARCH = "research"
    COURT = "court"
    BILLING = "billing"
    FOLLOW_UP = "follow_up"

class TaskBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    case_id: Optional[UUID] = None
    assigned_to_id: UUID
    type: TaskType = TaskType.GENERAL
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.TODO
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    estimated_hours: Optional[str] = Field(None, max_length=10)
    tags: Optional[str] = Field(None, max_length=200)
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = Field(None, max_length=50)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    progress: Optional[str] = Field(None, pattern="^(0%|25%|50%|75%|100%)$")
    actual_hours: Optional[str] = Field(None, max_length=10)
    tags: Optional[str] = Field(None, max_length=200)

class TaskResponse(TaskBase):
    id: UUID
    created_by_id: UUID
    progress: str
    actual_hours: Optional[str]
    completed_date: Optional[datetime]
    reminder_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TaskStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    high_priority_tasks: int
    tasks_by_status: dict