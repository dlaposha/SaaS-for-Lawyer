from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func  # Виправлений імпорт - func з sqlalchemy, не з sqlalchemy.future
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime, timedelta

from . import models, schemas
from src.core.exceptions import NotFoundException, DatabaseException

logger = logging.getLogger(__name__)

class TimeEntryService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, time_entry_id: UUID) -> Optional[models.TimeEntry]:
        try:
            result = await self.db.execute(
                select(models.TimeEntry).where(models.TimeEntry.id == time_entry_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching time entry: {e}")
            raise DatabaseException("Failed to fetch time entry")
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[UUID] = None,
        case_id: Optional[UUID] = None,
        billable: Optional[bool] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[models.TimeEntry]:
        try:
            query = select(models.TimeEntry)
            
            if user_id:
                query = query.where(models.TimeEntry.user_id == user_id)
            if case_id:
                query = query.where(models.TimeEntry.case_id == case_id)
            if billable is not None:
                query = query.where(models.TimeEntry.billable == billable)
            if start_date:
                query = query.where(models.TimeEntry.start_time >= start_date)
            if end_date:
                query = query.where(models.TimeEntry.start_time <= end_date)
                
            result = await self.db.execute(
                query.order_by(models.TimeEntry.start_time.desc())
                .offset(skip).limit(limit)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching time entries: {e}")
            raise DatabaseException("Failed to fetch time entries")
    
    async def create(self, time_entry_data: schemas.TimeEntryCreate, user_id: UUID) -> models.TimeEntry:
        try:
            # Calculate duration if end_time is provided
            duration = None
            if time_entry_data.end_time and time_entry_data.start_time:
                duration = (time_entry_data.end_time - time_entry_data.start_time).total_seconds() / 3600
            
            db_time_entry = models.TimeEntry(
                **time_entry_data.dict(exclude={'duration'}),
                user_id=user_id,
                duration=duration
            )
            
            self.db.add(db_time_entry)
            await self.db.commit()
            await self.db.refresh(db_time_entry)
            return db_time_entry
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error creating time entry: {e}")
            raise DatabaseException("Failed to create time entry")
    
    async def update(
        self, 
        time_entry_id: UUID, 
        time_entry_data: schemas.TimeEntryUpdate
    ) -> Optional[models.TimeEntry]:
        try:
            db_time_entry = await self.get_by_id(time_entry_id)
            if not db_time_entry:
                return None
            
            update_data = time_entry_data.dict(exclude_unset=True)
            
            # Recalculate duration if end_time is updated
            if 'end_time' in update_data and update_data['end_time']:
                duration = (update_data['end_time'] - db_time_entry.start_time).total_seconds() / 3600
                update_data['duration'] = duration
            
            for field, value in update_data.items():
                setattr(db_time_entry, field, value)
            
            self.db.add(db_time_entry)
            await self.db.commit()
            await self.db.refresh(db_time_entry)
            return db_time_entry
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error updating time entry: {e}")
            raise DatabaseException("Failed to update time entry")
    
    async def delete(self, time_entry_id: UUID) -> bool:
        try:
            db_time_entry = await self.get_by_id(time_entry_id)
            if not db_time_entry:
                return False
            
            await self.db.delete(db_time_entry)
            await self.db.commit()
            return True
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error deleting time entry: {e}")
            raise DatabaseException("Failed to delete time entry")
    
    async def get_summary(
        self,
        user_id: Optional[UUID] = None,
        case_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        try:
            query = select(models.TimeEntry)
            
            if user_id:
                query = query.where(models.TimeEntry.user_id == user_id)
            if case_id:
                query = query.where(models.TimeEntry.case_id == case_id)
            if start_date:
                query = query.where(models.TimeEntry.start_time >= start_date)
            if end_date:
                query = query.where(models.TimeEntry.start_time <= end_date)
            
            result = await self.db.execute(query)
            time_entries = result.scalars().all()
            
            total_hours = sum(entry.duration or 0 for entry in time_entries)
            billable_hours = sum(entry.duration or 0 for entry in time_entries if entry.billable)
            non_billable_hours = total_hours - billable_hours
            
            # Calculate by category
            by_category = {}
            for entry in time_entries:
                category = entry.category or "Uncategorized"
                if category not in by_category:
                    by_category[category] = 0
                by_category[category] += entry.duration or 0
            
            # Calculate by case
            by_case = {}
            for entry in time_entries:
                if entry.case_id not in by_case:
                    by_case[entry.case_id] = 0
                by_case[entry.case_id] += entry.duration or 0
            
            # Calculate total amount
            total_amount = sum(
                (entry.duration or 0) * (entry.rate or 0) 
                for entry in time_entries 
                if entry.billable
            )
            
            return {
                "total_hours": total_hours,
                "billable_hours": billable_hours,
                "non_billable_hours": non_billable_hours,
                "total_amount": total_amount,
                "by_category": by_category,
                "by_case": by_case
            }
        except SQLAlchemyError as e:
            logger.error(f"Error getting time summary: {e}")
            raise DatabaseException("Failed to get time summary")