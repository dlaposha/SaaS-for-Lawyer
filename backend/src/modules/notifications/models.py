from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from src.core.database import Base
import enum

from .enums import NotificationType, NotificationPriority, NotificationStatus

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.IN_APP)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.NORMAL)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    related_entity_type = Column(String(50))  # case, task, hearing, etc.
    related_entity_id = Column(UUID(as_uuid=True))
    scheduled_for = Column(DateTime)
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    read_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Зв'язки
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, title='{self.title}', type='{self.type}')>"

    def mark_as_read(self):
        """Позначити повідомлення як прочитане"""
        self.is_read = True
        self.read_at = datetime.utcnow()
        self.status = NotificationStatus.READ

    def mark_as_sent(self):
        """Позначити повідомлення як надіслане"""
        self.sent_at = datetime.utcnow()
        self.status = NotificationStatus.SENT

    def mark_as_delivered(self):
        """Позначити повідомлення як доставлене"""
        self.delivered_at = datetime.utcnow()
        self.status = NotificationStatus.DELIVERED

    def mark_as_failed(self):
        """Позначити повідомлення як невдале"""
        self.status = NotificationStatus.FAILED