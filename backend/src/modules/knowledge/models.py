import enum
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from src.core.database import Base

class ArticleCategory(enum.Enum):
    LAW = "law"
    PROCEDURE = "procedure"
    TEMPLATE = "template"
    FAQ = "faq"
    GUIDELINE = "guideline"

class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(Enum(ArticleCategory), nullable=False)
    tags = Column(String(200))
    is_published = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    helpful_count = Column(Integer, default=0)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)