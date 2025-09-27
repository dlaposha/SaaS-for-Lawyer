from sqlalchemy import Column, String, DateTime, Text, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Метадані звіту
    title = Column(String(200), nullable=False)
    description = Column(Text)
    report_type = Column(String(50), nullable=False)  # financial, cases, time, etc.
    frequency = Column(String(20))  # daily, weekly, monthly, quarterly, yearly
    
    # Параметри звіту
    parameters = Column(JSON)  # JSON з параметрами фільтрації
    filters = Column(JSON)  # JSON з додатковими фільтрами
    
    # Дані звіту
    data = Column(JSON)  # JSON з результатами
    summary = Column(JSON)  # JSON з підсумками
    
    # Статус
    status = Column(String(20), default="generated")  # generating, generated, failed
    is_automated = Column(Boolean, default=False)
    last_generated = Column(DateTime, default=datetime.utcnow)
    
    # Відносини
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    created_by = relationship("User")