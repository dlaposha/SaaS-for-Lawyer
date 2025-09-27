from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ...core.database import Base
import enum

class CaseStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    CLOSED = "closed"

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    status = Column(Enum(CaseStatus), default=CaseStatus.NEW, index=True)
    priority = Column(String(50), default="medium")
    
    # Зовнішні ключі
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    lawyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Метадані
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Відносини
    client = relationship("Client", back_populates="cases")
    lawyer = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case")
    tasks = relationship("Task", back_populates="case")