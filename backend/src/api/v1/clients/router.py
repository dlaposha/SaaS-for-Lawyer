from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("/", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client: schemas.ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client_service = service.ClientService(db)
    return await client_service.create(client)

@router.get("/", response_model=List[schemas.ClientResponse])
async def list_clients(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    type: Optional[str] = None,
    is_vip: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client_service = service.ClientService(db)
    return await client_service.get_all(skip, limit, status, type, is_vip)

@router.get("/{client_id}", response_model=schemas.ClientResponse)
async def get_client(
    client_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client_service = service.ClientService(db)
    db_client = await client_service.get_by_id(client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.put("/{client_id}", response_model=schemas.ClientResponse)
async def update_client(
    client_id: UUID,
    client: schemas.ClientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client_service = service.ClientService(db)
    db_client = await client_service.update(client_id, client)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client_service = service.ClientService(db)
    success = await client_service.delete(client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")

@router.get("/stats/dashboard", response_model=schemas.ClientStats)
async def get_client_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client_service = service.ClientService(db)
    return await client_service.get_stats()