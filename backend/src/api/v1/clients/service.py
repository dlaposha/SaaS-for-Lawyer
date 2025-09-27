from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
import logging

from . import models, schemas
from .crud import get_client, get_clients, create_client, update_client, delete_client
from src.core.exceptions import NotFoundException, DatabaseException

logger = logging.getLogger(__name__)

class ClientService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, client_id: str) -> Optional[models.Client]:
        return await get_client(self.db, client_id)
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        client_type: Optional[str] = None,
        is_vip: Optional[bool] = None
    ) -> List[models.Client]:
        clients = await get_clients(self.db, skip, limit)
        
        # Фільтрація
        if status:
            clients = [c for c in clients if c.status == status]
        if client_type:
            clients = [c for c in clients if c.type == client_type]
        if is_vip is not None:
            clients = [c for c in clients if c.is_vip == is_vip]
            
        return clients
    
    async def create(self, client_data: schemas.ClientCreate) -> models.Client:
        return await create_client(self.db, client_data)
    
    async def update(
        self, 
        client_id: str, 
        client_data: schemas.ClientUpdate
    ) -> Optional[models.Client]:
        return await update_client(self.db, client_id, client_data)
    
    async def delete(self, client_id: str) -> bool:
        return await delete_client(self.db, client_id)