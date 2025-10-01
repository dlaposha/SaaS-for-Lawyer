from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.post("/", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    return notification_service.create_notification(
        db=db,
        user_id=current_user.id,
        title=notification.title,
        message=notification.message,
        notification_type=notification.type,
        priority=notification.priority,
        related_entity_type=notification.related_entity_type,
        related_entity_id=notification.related_entity_id,
        scheduled_for=notification.scheduled_for
    )

@router.get("/", response_model=List[schemas.NotificationResponse])
async def list_notifications(
    skip: int = 0,
    limit: int = 100,
    unread_only: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    return notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only or False,
        limit=limit,
        offset=skip
    )

@router.get("/{notification_id}", response_model=schemas.NotificationResponse)
async def get_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    db_notification = notification_service.get_notification_by_id(db, str(notification_id))
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification

@router.put("/{notification_id}", response_model=schemas.NotificationResponse)
async def update_notification(
    notification_id: UUID,
    notification: schemas.NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    db_notification = notification_service.update_notification(db, str(notification_id), notification)
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    success = notification_service.delete_notification(db, str(notification_id))
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")

@router.post("/{notification_id}/mark-as-read", response_model=schemas.NotificationResponse)
async def mark_notification_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    db_notification = notification_service.mark_notification_as_read(db, str(notification_id))
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification

@router.post("/mark-all-as-read", response_model=dict)
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    count = notification_service.mark_all_notifications_as_read(db, str(current_user.id))
    return {"message": f"Marked {count} notifications as read"}

@router.get("/unread/count", response_model=schemas.UnreadNotificationCount)
async def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service = service.NotificationService()
    count = notification_service.get_unread_notification_count(db, str(current_user.id))
    return schemas.UnreadNotificationCount(count=count)