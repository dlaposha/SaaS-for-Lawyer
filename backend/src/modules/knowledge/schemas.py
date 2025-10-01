from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from .enums import KnowledgeCategory, KnowledgeStatus

class KnowledgeArticleBase(BaseModel):
    title: str
    content: str
    category: KnowledgeCategory
    tags: str = None
    is_published: bool = False

class KnowledgeArticleCreate(KnowledgeArticleBase):
    pass

class KnowledgeArticleResponse(KnowledgeArticleBase):
    id: UUID
    views_count: int
    helpful_count: int
    created_by_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True