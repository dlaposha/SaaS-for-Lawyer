from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: schemas.TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_service = service.TaskService(db)
    return await task_service.create(task, current_user.id)

@router.get("/", response_model=List[schemas.TaskResponse])
async def list_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[UUID] = None,
    case_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_service = service.TaskService(db)
    return await task_service.get_all(skip, limit, status, priority, assigned_to, case_id)

@router.get("/{task_id}", response_model=schemas.TaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_service = service.TaskService(db)
    db_task = await task_service.get_by_id(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=schemas.TaskResponse)
async def update_task(
    task_id: UUID,
    task: schemas.TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_service = service.TaskService(db)
    db_task = await task_service.update(task_id, task)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_service = service.TaskService(db)
    success = await task_service.delete(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")

@router.get("/stats/dashboard", response_model=schemas.TaskStats)
async def get_task_stats(
    assigned_to: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_service = service.TaskService(db)
    return await task_service.get_stats(assigned_to)