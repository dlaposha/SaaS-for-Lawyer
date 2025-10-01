from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from .models import KnowledgeArticle
from . import schemas

class KnowledgeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_article(self, data: schemas.KnowledgeArticleCreate, user_id: UUID) -> KnowledgeArticle:
        article = KnowledgeArticle(**data.dict(), created_by_id=user_id)
        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def get_articles(self, category: Optional[str] = None, is_published: Optional[bool] = None) -> List[KnowledgeArticle]:
        query = select(KnowledgeArticle)
        if category:
            query = query.where(KnowledgeArticle.category == category)
        if is_published is not None:
            query = query.where(KnowledgeArticle.is_published == is_published)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_article_by_id(self, article_id: UUID) -> Optional[KnowledgeArticle]:
        result = await self.db.execute(select(KnowledgeArticle).where(KnowledgeArticle.id == article_id))
        return result.scalar_one_or_none()