from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from datetime import datetime
import smtplib
from email.mime.text import MIMEText  # Виправлено: MIMEText замість MimeText
from email.mime.multipart import MIMEMultipart  # Виправлено: MIMEMultipart замість MimeMultipart
import logging

from ...core.config import settings
from ...core.database import BaseRepository
from .models import Notification
from .schemas import NotificationCreate, NotificationUpdate, NotificationType

logger = logging.getLogger(__name__)

class NotificationService:
    """Сервіс для роботи з повідомленнями"""
    
    def __init__(self, repository: BaseRepository):
        self.repository = repository
    
    def create_notification(
        self, 
        db: Session, 
        user_id: str, 
        title: str, 
        message: str, 
        notification_type: NotificationType,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[str] = None
    ) -> Notification:
        """Створення повідомлення"""
        try:
            notification_data = NotificationCreate(
                user_id=user_id,
                title=title,
                message=message,
                type=notification_type,
                related_entity_type=related_entity_type,
                related_entity_id=related_entity_id,
                is_read=False
            )
            
            db_notification = self.repository.create(db, notification_data)
            logger.info(f"Notification created for user {user_id}: {title}")
            return db_notification
        except Exception as e:
            logger.error(f"Error creating notification for user {user_id}: {e}")
            raise
    
    def send_email_notification(
        self, 
        to_email: str, 
        subject: str, 
        body: str,
        from_email: Optional[str] = None
    ) -> bool:
        """Відправка email повідомлення"""
        try:
            message = MIMEMultipart()  # Виправлено: MIMEMultipart замість MimeMultipart
            message["From"] = from_email or settings.EMAIL_FROM
            message["To"] = to_email
            message["Subject"] = subject
            
            message.attach(MIMEText(body, "html"))  # Виправлено: MIMEText замість MimeText
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
            
            logger.info(f"Email notification sent to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return False
    
    def get_user_notifications(
        self, 
        db: Session, 
        user_id: str, 
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Отримання повідомлень користувача"""
        try:
            filters = {"user_id": user_id}
            if unread_only:
                filters["is_read"] = False
            
            notifications = self.repository.get_multi(
                db, 
                filters=filters, 
                limit=limit
            )
            
            logger.info(f"Retrieved {len(notifications)} notifications for user {user_id}")
            return notifications
        except Exception as e:
            logger.error(f"Error retrieving notifications for user {user_id}: {e}")
            raise
    
    def get_notification_by_id(
        self, 
        db: Session, 
        notification_id: str
    ) -> Optional[Notification]:
        """Отримання повідомлення за ID"""
        try:
            result = db.execute(
                select(Notification).where(Notification.id == notification_id)
            )
            notification = result.scalar_one_or_none()
            
            if notification:
                logger.info(f"Retrieved notification {notification_id}")
            else:
                logger.warning(f"Notification {notification_id} not found")
            
            return notification
        except Exception as e:
            logger.error(f"Error retrieving notification {notification_id}: {e}")
            raise
    
    def update_notification(
        self, 
        db: Session, 
        notification_id: str, 
        notification_update: NotificationUpdate
    ) -> Optional[Notification]:
        """Оновлення повідомлення"""
        try:
            db_notification = self.get_notification_by_id(db, notification_id)
            if not db_notification:
                return None
            
            update_data = notification_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_notification, field, value)
            
            db.add(db_notification)
            db.commit()
            db.refresh(db_notification)
            
            logger.info(f"Notification {notification_id} updated")
            return db_notification
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating notification {notification_id}: {e}")
            raise
    
    def delete_notification(
        self, 
        db: Session, 
        notification_id: str
    ) -> bool:
        """Видалення повідомлення"""
        try:
            db_notification = self.get_notification_by_id(db, notification_id)
            if not db_notification:
                return False
            
            db.delete(db_notification)
            db.commit()
            
            logger.info(f"Notification {notification_id} deleted")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting notification {notification_id}: {e}")
            raise
    
    def mark_notification_as_read(
        self, 
        db: Session, 
        notification_id: str
    ) -> Optional[Notification]:
        """Позначити повідомлення як прочитане"""
        try:
            db_notification = self.get_notification_by_id(db, notification_id)
            if not db_notification:
                return None
            
            db_notification.is_read = True
            db_notification.read_at = datetime.utcnow()
            
            db.add(db_notification)
            db.commit()
            db.refresh(db_notification)
            
            logger.info(f"Notification {notification_id} marked as read")
            return db_notification
        except Exception as e:
            db.rollback()
            logger.error(f"Error marking notification {notification_id} as read: {e}")
            raise
    
    def mark_all_notifications_as_read(
        self, 
        db: Session, 
        user_id: str
    ) -> int:
        """Позначити всі повідомлення користувача як прочитані"""
        try:
            result = db.execute(
                select(Notification)
                .where(
                    and_(
                        Notification.user_id == user_id,
                        Notification.is_read == False
                    )
                )
            )
            notifications = result.scalars().all()
            
            count = 0
            for notification in notifications:
                notification.is_read = True
                notification.read_at = datetime.utcnow()
                db.add(notification)
                count += 1
            
            db.commit()
            
            logger.info(f"Marked {count} notifications as read for user {user_id}")
            return count
        except Exception as e:
            db.rollback()
            logger.error(f"Error marking all notifications as read for user {user_id}: {e}")
            raise
    
    def get_unread_notification_count(
        self, 
        db: Session, 
        user_id: str
    ) -> int:
        """Отримати кількість непрочитаних повідомлень користувача"""
        try:
            result = db.execute(
                select(func.count(Notification.id))
                .where(
                    and_(
                        Notification.user_id == user_id,
                        Notification.is_read == False
                    )
                )
            )
            count = result.scalar() or 0
            
            logger.info(f"User {user_id} has {count} unread notifications")
            return count
        except Exception as e:
            logger.error(f"Error getting unread notification count for user {user_id}: {e}")
            raise