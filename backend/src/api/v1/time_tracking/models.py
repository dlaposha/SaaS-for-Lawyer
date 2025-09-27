from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base

class TimeEntry(Base):
    __tablename__ = "time_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Відносини
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"))
    
    # Деталі запису часу
    description = Column(Text, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    duration = Column(Numeric(10, 2))  # у годинах
    
    # Статус та категорії
    billable = Column(Boolean, default=True)
    billed = Column(Boolean, default=False)
    category = Column(String(50))  # research, drafting, meeting, etc.
    rate = Column(Numeric(10, 2))  # погодинна ставка
    
    # Додаткові поля
    tags = Column(String(200))
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="time_entries")
    case = relationship("Case", back_populates="time_entries")
    task = relationship("Task", back_populates="time_entries")