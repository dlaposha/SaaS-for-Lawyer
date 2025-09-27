from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    document: schemas.DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document_service = service.DocumentService(db)
    return await document_service.create(document, current_user.id)

@router.get("/", response_model=List[schemas.DocumentResponse])
async def list_documents(
    skip: int = 0,
    limit: int = 100,
    case_id: Optional[UUID] = None,
    client_id: Optional[UUID] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document_service = service.DocumentService(db)
    return await document_service.get_all(skip, limit, case_id, client_id, type, status)

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
async def get_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document_service = service.DocumentService(db)
    db_document = await document_service.get_by_id(document_id)
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.put("/{document_id}", response_model=schemas.DocumentResponse)
async def update_document(
    document_id: UUID,
    document: schemas.DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document_service = service.DocumentService(db)
    db_document = await document_service.update(document_id, document)
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document_service = service.DocumentService(db)
    success = await document_service.delete(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")

@router.get("/stats/dashboard", response_model=schemas.DocumentStats)
async def get_document_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document_service = service.DocumentService(db)
    return await document_service.get_stats()