from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class TaskPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskStatus(enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"
    CANCELLED = "cancelled"

class TaskType(enum.Enum):
    GENERAL = "general"
    MEETING = "meeting"
    DOCUMENT = "document"
    RESEARCH = "research"
    COURT = "court"
    BILLING = "billing"
    FOLLOW_UP = "follow_up"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Відносини
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Деталі завдання
    type = Column(Enum(TaskType), default=TaskType.GENERAL)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    
    # Дати
    due_date = Column(DateTime)
    start_date = Column(DateTime)
    completed_date = Column(DateTime)
    reminder_date = Column(DateTime)
    
    # Прогрес
    progress = Column(String(20), default="0%")  # 0%, 25%, 50%, 75%, 100%
    estimated_hours = Column(String(10))  # 1h, 2h, 4h, etc.
    actual_hours = Column(String(10))
    
    # Додаткові поля
    tags = Column(String(200))  # comma-separated tags
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50))  # daily, weekly, monthly
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    case = relationship("Case", back_populates="tasks")
    assigned_to = relationship("User", back_populates="tasks", foreign_keys=[assigned_to_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    time_entries = relationship("TimeEntry", back_populates="task")