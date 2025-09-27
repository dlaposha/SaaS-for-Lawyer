from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select, func
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime, timedelta
import json

from . import models, schemas
from src.core.exceptions import NotFoundException, DatabaseException

logger = logging.getLogger(__name__)

class HearingService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, hearing_id: UUID) -> Optional[models.Hearing]:
        try:
            result = await self.db.execute(
                select(models.Hearing).where(models.Hearing.id == hearing_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching hearing: {e}")
            raise DatabaseException("Failed to fetch hearing")
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        case_id: Optional[UUID] = None,
        status: Optional[str] = None,
        hearing_type: Optional[str] = None,
        upcoming: Optional[bool] = None
    ) -> List[models.Hearing]:
        try:
            query = select(models.Hearing)
            
            if case_id:
                query = query.where(models.Hearing.case_id == case_id)
            if status:
                query = query.where(models.Hearing.status == status)
            if hearing_type:
                query = query.where(models.Hearing.type == hearing_type)
            if upcoming:
                query = query.where(models.Hearing.hearing_date >= datetime.utcnow())
                
            result = await self.db.execute(
                query.order_by(models.Hearing.hearing_date.asc())
                .offset(skip).limit(limit)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching hearings: {e}")
            raise DatabaseException("Failed to fetch hearings")
    
    async def create(self, hearing_data: schemas.HearingCreate, user_id: UUID) -> models.Hearing:
        try:
            # Convert lists to JSON strings for database storage
            participants_json = json.dumps(hearing_data.participants or []) if hearing_data.participants else None
            required_attendees_json = json.dumps(hearing_data.required_attendees or []) if hearing_data.required_attendees else None
            documents_required_json = json.dumps(hearing_data.documents_required or []) if hearing_data.documents_required else None
            
            db_hearing = models.Hearing(
                **hearing_data.dict(exclude={'participants', 'required_attendees', 'documents_required'}),
                created_by_id=user_id,
                participants=participants_json,
                required_attendees=required_attendees_json,
                documents_required=documents_required_json
            )
            
            self.db.add(db_hearing)
            await self.db.commit()
            await self.db.refresh(db_hearing)
            return db_hearing
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error creating hearing: {e}")
            raise DatabaseException("Failed to create hearing")
    
    async def update(
        self, 
        hearing_id: UUID, 
        hearing_data: schemas.HearingUpdate
    ) -> Optional[models.Hearing]:
        try:
            db_hearing = await self.get_by_id(hearing_id)
            if not db_hearing:
                return None
            
            update_data = hearing_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_hearing, field, value)
            
            await self.db.commit()
            await self.db.refresh(db_hearing)
            return db_hearing
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error updating hearing: {e}")
            raise DatabaseException("Failed to update hearing")
    
    async def delete(self, hearing_id: UUID) -> bool:
        try:
            db_hearing = await self.get_by_id(hearing_id)
            if not db_hearing:
                return False
            
            await self.db.delete(db_hearing)
            await self.db.commit()
            return True
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error deleting hearing: {e}")
            raise DatabaseException("Failed to delete hearing")
    
    async def get_upcoming_hearings(self, days: int = 7) -> List[models.Hearing]:
        try:
            start_date = datetime.utcnow()
            end_date = start_date + timedelta(days=days)
            
            result = await self.db.execute(
                select(models.Hearing)
                .where(models.Hearing.hearing_date.between(start_date, end_date))
                .where(models.Hearing.status.in_(["scheduled", "confirmed"]))
                .order_by(models.Hearing.hearing_date.asc())
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching upcoming hearings: {e}")
            raise DatabaseException("Failed to fetch upcoming hearings")
    
    async def get_stats(self) -> Dict[str, Any]:
        try:
            result = await self.db.execute(select(models.Hearing))
            hearings = result.scalars().all()
            
            # Count by type
            type_counts = {}
            for hearing_type in models.HearingType:
                type_counts[hearing_type.value] = len([
                    h for h in hearings if h.type == hearing_type.value
                ])
            
            # Count by status
            status_counts = {}
            for status in models.HearingStatus:
                status_counts[status.value] = len([
                    h for h in hearings if h.status == status.value
                ])
            
            upcoming_hearings = len([
                h for h in hearings 
                if h.hearing_date >= datetime.utcnow() and h.status in ["scheduled", "confirmed"]
            ])
            
            return {
                "total_hearings": len(hearings),
                "upcoming_hearings": upcoming_hearings,
                "completed_hearings": len([h for h in hearings if h.status == "completed"]),
                "by_type": type_counts,
                "by_status": status_counts
            }
        except SQLAlchemyError as e:
            logger.error(f"Error getting hearing stats: {e}")
            raise DatabaseException("Failed to get hearing statistics")