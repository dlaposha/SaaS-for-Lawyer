from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from src.core.database import Base
import enum

# Імпорт enum з файлу enums.py
from .enums import ReportType, ReportFormat, ReportFrequency, ReportStatus

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Метадані звіту
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    report_type = Column(String(50), nullable=False, index=True)  # financial, cases, time, etc.
    report_format = Column(String(20), default=ReportFormat.PDF)
    frequency = Column(String(20), default=ReportFrequency.ON_DEMAND)  # daily, weekly, monthly, quarterly, yearly
    
    # Параметри звіту
    parameters = Column(JSON)  # JSON з параметрами фільтрації
    filters = Column(JSON)     # JSON з додатковими фільтрами
    
    # Дані звіту
    data = Column(JSON)        # JSON з результатами
    summary = Column(JSON)     # JSON з підсумками
    
    # Статус
    status = Column(String(20), default=ReportStatus.PENDING)  # generating, generated, failed
    is_automated = Column(Boolean, default=False)
    last_generated = Column(DateTime)
    next_run = Column(DateTime)  # Для автоматичних звітів
    
    # Відносини
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    created_by = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"<Report(id={self.id}, title='{self.title}', type='{self.report_type}')>"
    
    def mark_as_generating(self):
        """Позначити звіт як такий, що генерується"""
        self.status = ReportStatus.GENERATING
        self.updated_at = datetime.utcnow()
    
    def mark_as_completed(self):
        """Позначити звіт як завершений"""
        self.status = ReportStatus.COMPLETED
        self.last_generated = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def mark_as_failed(self, error_message: str = None):
        """Позначити звіт як невдалий"""
        self.status = ReportStatus.FAILED
        self.updated_at = datetime.utcnow()
        if error_message:
            self.description = f"{self.description or ''} Error: {error_message}" if self.description else f"Error: {error_message}"
    
    def calculate_next_run(self):
        """Обчислити наступний час запуску для автоматичних звітів"""
        if not self.is_automated or not self.frequency:
            return None
        
        now = datetime.utcnow()
        if self.frequency == ReportFrequency.DAILY:
            return now + timedelta(days=1)
        elif self.frequency == ReportFrequency.WEEKLY:
            return now + timedelta(weeks=1)
        elif self.frequency == ReportFrequency.MONTHLY:
            return now + timedelta(days=30)
        elif self.frequency == ReportFrequency.QUARTERLY:
            return now + timedelta(days=90)
        elif self.frequency == ReportFrequency.YEARLY:
            return now + timedelta(days=365)
        return None