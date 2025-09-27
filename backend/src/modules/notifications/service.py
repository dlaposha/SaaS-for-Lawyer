from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

from ...core.config import settings
from ...core.database import BaseRepository
from .models import Notification
from .schemas import NotificationCreate, NotificationType

class NotificationService:
    """Сервіс для роботи з повідомленнями"""
    
    def __init__(self, repository: BaseRepository):
        self.repository = repository
    
    def create_notification(
        self, 
        db: Session, 
        user_id: int, 
        title: str, 
        message: str, 
        notification_type: NotificationType,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[int] = None
    ) -> Notification:
        """Створення повідомлення"""
        notification_data = NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            is_read=False
        )
        
        return self.repository.create(db, notification_data)
    
    def send_email_notification(self, to_email: str, subject: str, body: str) -> bool:
        """Відправка email повідомлення"""
        try:
            message = MimeMultipart()
            message["From"] = settings.EMAIL_FROM
            message["To"] = to_email
            message["Subject"] = subject
            
            message.attach(MimeText(body, "html"))
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
            
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def get_user_notifications(
        self, 
        db: Session, 
        user_id: int, 
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Отримання повідомлень користувача"""
        filters = {"user_id": user_id}
        if unread_only:
            filters["is_read"] = False
        
        return self.repository.get_multi(
            db, 
            filters=filters, 
            limit=limit
        )