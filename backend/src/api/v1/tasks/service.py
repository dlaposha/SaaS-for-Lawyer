from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select, func
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

from . import models, schemas
from src.core.exceptions import NotFoundException, DatabaseException

logger = logging.getLogger(__name__)

class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, task_id: UUID) -> Optional[models.Task]:
        try:
            result = await self.db.execute(
                select(models.Task).where(models.Task.id == task_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching task: {e}")
            raise DatabaseException("Failed to fetch task")
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assigned_to: Optional[UUID] = None,
        case_id: Optional[UUID] = None
    ) -> List[models.Task]:
        try:
            query = select(models.Task)
            
            if status:
                query = query.where(models.Task.status == status)
            if priority:
                query = query.where(models.Task.priority == priority)
            if assigned_to:
                query = query.where(models.Task.assigned_to_id == assigned_to)
            if case_id:
                query = query.where(models.Task.case_id == case_id)
                
            result = await self.db.execute(
                query.offset(skip).limit(limit)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching tasks: {e}")
            raise DatabaseException("Failed to fetch tasks")
    
    async def create(self, task_data: schemas.TaskCreate, user_id: UUID) -> models.Task:
        try:
            db_task = models.Task(
                **task_data.dict(),
                created_by_id=user_id,
                progress="0%"
            )
            
            self.db.add(db_task)
            await self.db.commit()
            await self.db.refresh(db_task)
            return db_task
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error creating task: {e}")
            raise DatabaseException("Failed to create task")
    
    async def update(
        self, 
        task_id: UUID, 
        task_data: schemas.TaskUpdate
    ) -> Optional[models.Task]:
        try:
            db_task = await self.get_by_id(task_id)
            if not db_task:
                return None
            
            update_data = task_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_task, field, value)
            
            # Якщо статус змінено на DONE, встановити дату завершення
            if task_data.status == "done" and db_task.status != "done":
                db_task.completed_date = datetime.utcnow()
                db_task.progress = "100%"
            
            await self.db.commit()
            await self.db.refresh(db_task)
            return db_task
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error updating task: {e}")
            raise DatabaseException("Failed to update task")
    
    async def delete(self, task_id: UUID) -> bool:
        try:
            db_task = await self.get_by_id(task_id)
            if not db_task:
                return False
            
            await self.db.delete(db_task)
            await self.db.commit()
            return True
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error deleting task: {e}")
            raise DatabaseException("Failed to delete task")
    
    async def get_stats(self, user_id: Optional[UUID] = None) -> Dict[str, Any]:
        try:
            query = select(models.Task)
            if user_id:
                query = query.where(models.Task.assigned_to_id == user_id)
            
            result = await self.db.execute(query)
            tasks = result.scalars().all()
            
            # Статистика по статусах
            status_counts = {}
            for status in models.TaskStatus:
                status_counts[status.value] = len([
                    t for t in tasks if t.status == status.value
                ])
            
            return {
                "total_tasks": len(tasks),
                "completed_tasks": len([t for t in tasks if t.status == "done"]),
                "overdue_tasks": len([
                    t for t in tasks 
                    if t.due_date and t.due_date < datetime.utcnow() and t.status != "done"
                ]),
                "high_priority_tasks": len([
                    t for t in tasks if t.priority in ["high", "urgent"]
                ]),
                "tasks_by_status": status_counts
            }
        except SQLAlchemyError as e:
            logger.error(f"Error getting task stats: {e}")
            raise DatabaseException("Failed to get task statistics")