from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.auth.models import User
from . import service, schemas

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.post("/", response_model=schemas.KnowledgeArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article: schemas.KnowledgeArticleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = service.KnowledgeService(db)
    return await svc.create_article(article, current_user.id)

@router.get("/", response_model=List[schemas.KnowledgeArticleResponse])
async def list_articles(
    category: str = None,
    is_published: bool = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = service.KnowledgeService(db)
    return await svc.get_articles(category=category, is_published=is_published)

@router.get("/{article_id}", response_model=schemas.KnowledgeArticleResponse)
async def get_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = service.KnowledgeService(db)
    article = await svc.get_article_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article