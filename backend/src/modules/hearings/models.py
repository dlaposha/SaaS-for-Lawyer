from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from src.core.database import Base
import enum

# Визначення Enum типів
class HearingType(str, enum.Enum):
    PRELIMINARY = "preliminary"
    MOTION = "motion"
    TRIAL = "trial"
    SETTLEMENT = "settlement"
    APPEAL = "appeal"
    OTHER = "other"

class HearingStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ADJOURNED = "adjourned"

class Hearing(Base):
    __tablename__ = "hearings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Зовнішні ключі
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Основна інформація
    title = Column(String(200), nullable=False)
    type = Column(Enum(HearingType), default=HearingType.OTHER)
    status = Column(Enum(HearingStatus), default=HearingStatus.SCHEDULED)
    description = Column(Text)
    
    # Деталі засідання
    hearing_date = Column(DateTime, nullable=False)
    duration = Column(String(20))  # 1h, 2h, etc.
    location = Column(String(200))
    courtroom = Column(String(100))
    judge = Column(String(100))
    case_number = Column(String(100))
    
    # Учасники
    participants = Column(Text)  # JSON список учасників
    required_attendees = Column(Text)  # JSON список обов'язкових учасників
    
    # Підготовка
    preparation_status = Column(String(20), default="not_started")  # not_started, in_progress, completed
    documents_required = Column(Text)  # JSON список документів
    notes = Column(Text)
    
    # Результати
    outcome = Column(Text)
    next_steps = Column(Text)
    next_hearing_date = Column(DateTime)
    
    # Сповіщення
    reminders_sent = Column(Boolean, default=False)
    last_reminder_sent = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Зв'язки
    case = relationship("Case", back_populates="hearings")
    created_by = relationship("User", back_populates="created_hearings")