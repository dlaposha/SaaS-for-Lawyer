from typing import Generic, TypeVar, Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from src.core.database import Base
import logging

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """Базовий репозиторій для CRUD операцій"""
    
    def __init__(self, model: type[ModelType]):
        self.model = model
    
    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        """Отримання запису за ID"""
        try:
            result = await db.execute(select(self.model).filter(self.model.id == id))
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting {self.model.__name__} with id {id}: {e}")
            return None
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """Отримання списку записів з фільтрацією"""
        try:
            query = select(self.model)
            
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model, key):
                        query = query.filter(getattr(self.model, key) == value)
            
            query = query.offset(skip).limit(limit)
            result = await db.execute(query)
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error getting multiple {self.model.__name__}: {e}")
            return []
    
    async def create(self, db: AsyncSession, obj_in) -> Optional[ModelType]:
        """Створення нового запису"""
        try:
            db_obj = self.model(**obj_in.dict())
            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating {self.model.__name__}: {e}")
            return None
    
    async def update(self, db: AsyncSession, db_obj: ModelType, obj_in) -> Optional[ModelType]:
        """Оновлення запису"""
        try:
            update_data = obj_in.dict(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating {self.model.__name__}: {e}")
            return None
    
    async def delete(self, db: AsyncSession, id: int) -> bool:
        """Видалення запису"""
        try:
            result = await db.execute(select(self.model).filter(self.model.id == id))
            obj = result.scalar_one_or_none()
            
            if obj:
                await db.delete(obj)
                await db.commit()
                return True
            return False
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting {self.model.__name__} with id {id}: {e}")
            return False
    
    async def exists(self, db: AsyncSession, id: int) -> bool:
        """Перевірка існування запису"""
        try:
            result = await db.execute(select(self.model).filter(self.model.id == id))
            return result.scalar_one_or_none() is not None
        except Exception as e:
            logger.error(f"Error checking existence of {self.model.__name__}: {e}")
            return False
    
    async def count(self, db: AsyncSession, filters: Optional[Dict[str, Any]] = None) -> int:
        """Підрахунок кількості записів"""
        try:
            query = select(self.model)
            
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model, key):
                        query = query.filter(getattr(self.model, key) == value)
            
            result = await db.execute(select([query]))
            return result.scalar()
        except Exception as e:
            logger.error(f"Error counting {self.model.__name__}: {e}")
            return 0