from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from typing import List, Optional

from . import models, schemas
from src.core.exceptions import NotFoundException, DatabaseException

async def get_client(db: AsyncSession, client_id: UUID) -> Optional[models.Client]:
    result = await db.execute(select(models.Client).filter(models.Client.id == client_id))
    return result.scalar_one_or_none()

async def get_clients(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[models.Client]:
    result = await db.execute(select(models.Client).offset(skip).limit(limit))
    return result.scalars().all()

async def create_client(db: AsyncSession, client: schemas.ClientCreate) -> models.Client:
    try:
        db_client = models.Client(**client.dict())
        db.add(db_client)
        await db.commit()
        await db.refresh(db_client)
        return db_client
    except Exception as e:
        await db.rollback()
        raise DatabaseException("Failed to create client")

async def update_client(db: AsyncSession, client_id: UUID, client_update: schemas.ClientUpdate) -> Optional[models.Client]:
    try:
        result = await db.execute(select(models.Client).filter(models.Client.id == client_id))
        db_client = result.scalar_one_or_none()
        
        if db_client:
            update_data = client_update.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_client, key, value)
            
            await db.commit()
            await db.refresh(db_client)
            return db_client
        return None
    except Exception as e:
        await db.rollback()
        raise DatabaseException("Failed to update client")

async def delete_client(db: AsyncSession, client_id: UUID) -> bool:
    try:
        result = await db.execute(select(models.Client).filter(models.Client.id == client_id))
        db_client = result.scalar_one_or_none()
        
        if db_client:
            await db.delete(db_client)
            await db.commit()
            return True
        return False
    except Exception as e:
        await db.rollback()
        raise DatabaseException("Failed to delete client")