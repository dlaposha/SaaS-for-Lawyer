from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select, func, and_
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime, timedelta
import json

from . import models, schemas
from src.core.exceptions import NotFoundException, DatabaseException

logger = logging.getLogger(__name__)

class CalendarService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, event_id: UUID) -> Optional[models.CalendarEvent]:
        try:
            result = await self.db.execute(
                select(models.CalendarEvent).where(models.CalendarEvent.id == event_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching calendar event: {e}")
            raise DatabaseException("Failed to fetch calendar event")
    
    async def get_all(
        self, 
        start_date: datetime,
        end_date: datetime,
        user_id: Optional[UUID] = None,
        event_type: Optional[str] = None,
        case_id: Optional[UUID] = None
    ) -> List[models.CalendarEvent]:
        try:
            query = select(models.CalendarEvent).where(
                and_(
                    models.CalendarEvent.start_time >= start_date,
                    models.CalendarEvent.end_time <= end_date
                )
            )
            
            if user_id:
                query = query.where(models.CalendarEvent.created_by_id == user_id)
            if event_type:
                query = query.where(models.CalendarEvent.type == event_type)
            if case_id:
                query = query.where(models.CalendarEvent.case_id == case_id)
                
            result = await self.db.execute(
                query.order_by(models.CalendarEvent.start_time.asc())
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching calendar events: {e}")
            raise DatabaseException("Failed to fetch calendar events")
    
    async def create(self, event_data: schemas.CalendarEventCreate, user_id: UUID) -> models.CalendarEvent:
        try:
            # Convert lists to JSON strings
            attendees_json = json.dumps(event_data.attendees or []) if event_data.attendees else None
            reminders_json = json.dumps(event_data.reminders or []) if event_data.reminders else None
            
            db_event = models.CalendarEvent(
                **event_data.dict(exclude={'attendees', 'reminders'}),
                created_by_id=user_id,
                attendees=attendees_json,
                reminders=reminders_json
            )
            
            self.db.add(db_event)
            await self.db.commit()
            await self.db.refresh(db_event)
            return db_event
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error creating calendar event: {e}")
            raise DatabaseException("Failed to create calendar event")
    
    async def check_conflicts(self, start_time: datetime, end_time: datetime, user_id: UUID) -> List[models.CalendarEvent]:
        try:
            result = await self.db.execute(
                select(models.CalendarEvent).where(
                    and_(
                        models.CalendarEvent.created_by_id == user_id,
                        models.CalendarEvent.status == "scheduled",
                        models.CalendarEvent.start_time < end_time,
                        models.CalendarEvent.end_time > start_time
                    )
                )
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error checking calendar conflicts: {e}")
            raise DatabaseException("Failed to check calendar conflicts")
    
    async def get_available_slots(self, date: datetime, user_id: UUID, duration_minutes: int = 60) -> List[Dict[str, datetime]]:
        try:
            # Get working hours (9:00-18:00 by default)
            start_of_day = date.replace(hour=9, minute=0, second=0, microsecond=0)
            end_of_day = date.replace(hour=18, minute=0, second=0, microsecond=0)
            
            # Get busy events for the day
            busy_events = await self.get_all(start_of_day, end_of_day, user_id)
            
            # Generate available slots
            available_slots = []
            current_time = start_of_day
            duration = timedelta(minutes=duration_minutes)
            
            while current_time + duration <= end_of_day:
                slot_end = current_time + duration
                slot_available = True
                
                # Check if slot conflicts with any event
                for event in busy_events:
                    if current_time < event.end_time and slot_end > event.start_time:
                        slot_available = False
                        current_time = event.end_time
                        break
                
                if slot_available:
                    available_slots.append({
                        "start": current_time,
                        "end": slot_end
                    })
                    current_time = slot_end
                else:
                    current_time = slot_end
            
            return available_slots
        except SQLAlchemyError as e:
            logger.error(f"Error getting available slots: {e}")
            raise DatabaseException("Failed to get available slots")