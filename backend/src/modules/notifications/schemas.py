from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

from .enums import NotificationType, NotificationPriority, NotificationStatus

class NotificationBase(BaseModel):
    user_id: UUID
    title: str = Field(..., max_length=200)
    message: str
    type: NotificationType = NotificationType.IN_APP
    priority: NotificationPriority = NotificationPriority.NORMAL
    status: NotificationStatus = NotificationStatus.PENDING
    related_entity_type: Optional[str] = Field(None, max_length=50)
    related_entity_id: Optional[UUID] = None
    scheduled_for: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    is_read: bool = False

class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = None
    type: Optional[NotificationType] = None
    priority: Optional[NotificationPriority] = None
    status: Optional[NotificationStatus] = None
    related_entity_type: Optional[str] = Field(None, max_length=50)
    related_entity_id: Optional[UUID] = None
    scheduled_for: Optional[datetime] = None
    is_read: Optional[bool] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

class NotificationResponse(NotificationBase):
    id: UUID
    is_read: bool
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UnreadNotificationCount(BaseModel):
    count: int

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    size: int