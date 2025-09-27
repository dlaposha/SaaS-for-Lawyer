from celery import Celery
from src.core.config import settings
from src.core.database import AsyncSessionLocal
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Імпорт завдань з celery_app
from .celery_app import celery_app

@celery_app.task(bind=True, max_retries=3)
def send_email(self, to_email: str, subject: str, template_name: str, context: dict):
    """Завдання для відправки email"""
    try:
        # Тут буде логіка відправки email
        logger.info(f"Sending email to {to_email}: {subject}")
        # Імітація відправки
        return f"Email sent to {to_email}"
    except Exception as exc:
        logger.error(f"Failed to send email to {to_email}: {exc}")
        raise self.retry(exc=exc, countdown=60)

@celery_app.task
def cleanup_old_sessions():
    """Завдання для очищення старих сесій"""
    try:
        # Логіка очищення старих сесій
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        logger.info(f"Cleaning up sessions older than {cutoff_date}")
        return "Old sessions cleanup completed"
    except Exception as exc:
        logger.error(f"Failed to cleanup old sessions: {exc}")
        return "Cleanup failed"

@celery_app.task
def generate_report(report_type: str, user_id: int, parameters: dict):
    """Завдання для генерації звітів"""
    try:
        logger.info(f"Generating {report_type} report for user {user_id}")
        # Імітація генерації звіту
        return f"Report {report_type} generated successfully"
    except Exception as exc:
        logger.error(f"Failed to generate report: {exc}")
        return "Report generation failed"

@celery_app.task
def backup_database():
    """Завдання для резервного копіювання бази даних"""
    try:
        logger.info("Starting database backup")
        # Логіка резервного копіювання
        return "Database backup completed successfully"
    except Exception as exc:
        logger.error(f"Database backup failed: {exc}")
        return "Backup failed"

@celery_app.task
def process_document_analysis(document_id: int):
    """Завдання для аналізу документів"""
    try:
        logger.info(f"Processing document analysis for document {document_id}")
        # Логіка аналізу документа
        return f"Document {document_id} analysis completed"
    except Exception as exc:
        logger.error(f"Document analysis failed: {exc}")
        return "Analysis failed"