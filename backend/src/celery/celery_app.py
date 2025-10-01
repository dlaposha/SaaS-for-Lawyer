from celery import Celery
from src.core.config import settings

# Створення екземпляра Celery
celery_app = Celery(
    "lawyer_crm_worker",
)

# Налаштування
celery_app.conf.update(
    broker_url=settings.CELERY_BROKER_URL,
    result_backend=settings.CELERY_RESULT_BACKEND,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Europe/Kiev',
    enable_utc=False,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_default_queue='default',
    task_default_exchange='default',
    task_default_routing_key='default',
    task_default_retry_delay=180,
    task_max_retries=3,
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Автоматичне виявлення завдань
celery_app.autodiscover_tasks([
    'src.celery.tasks',
])

if __name__ == '__main__':
    celery_app.start()