from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class DocumentType(enum.Enum):
    CONTRACT = "contract"
    PLEADING = "pleading"
    MOTION = "motion"
    BRIEF = "brief"
    AGREEMENT = "agreement"
    CORRESPONDENCE = "correspondence"
    REPORT = "report"
    EVIDENCE = "evidence"
    OTHER = "other"

class DocumentStatus(enum.Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    FILED = "filed"
    SERVED = "served"
    ARCHIVED = "archived"

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Відносини
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Основна інформація
    title = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(Enum(DocumentType), default=DocumentType.OTHER)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.DRAFT)
    
    # Файлова інформація
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(String(20))  # у байтах
    file_type = Column(String(50))  # MIME type
    version = Column(String(20), default="1.0")
    
    # Метадані
    tags = Column(String(200))
    keywords = Column(String(200))
    language = Column(String(10), default="uk")
    
    # Дати
    created_date = Column(DateTime, default=datetime.utcnow)
    modified_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    filed_date = Column(DateTime)
    served_date = Column(DateTime)
    
    # Додаткові поля
    is_template = Column(Boolean, default=False)
    is_confidential = Column(Boolean, default=False)
    shareable_link = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    case = relationship("Case", back_populates="documents")
    client = relationship("Client", back_populates="documents")
    created_by = relationship("User")