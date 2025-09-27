from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class EventType(enum.Enum):
    HEARING = "hearing"
    MEETING = "meeting"
    DEADLINE = "deadline"
    TASK = "task"
    REMINDER = "reminder"
    COURT = "court"
    CLIENT = "client"
    INTERNAL = "internal"

class EventPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Відносини
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"))
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Основна інформація
    title = Column(String(200), nullable=False)
    type = Column(Enum(EventType), default=EventType.MEETING)
    priority = Column(Enum(EventPriority), default=EventPriority.MEDIUM)
    description = Column(Text)
    
    # Час події
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    all_day = Column(Boolean, default=False)
    timezone = Column(String(50), default="Europe/Kyiv")
    
    # Повторення
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50))  # daily, weekly, monthly, yearly
    recurrence_end = Column(DateTime)
    
    # Локація
    location = Column(String(200))
    online_meeting_link = Column(String(500))
    
    # Учасники
    attendees = Column(Text)  # JSON список учасників
    
    # Сповіщення
    reminders = Column(Text)  # JSON список нагадувань
    send_notifications = Column(Boolean, default=True)
    
    # Статус
    status = Column(String(20), default="scheduled")  # scheduled, confirmed, cancelled, completed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    case = relationship("Case")
    client = relationship("Client")
    created_by = relationship("User")