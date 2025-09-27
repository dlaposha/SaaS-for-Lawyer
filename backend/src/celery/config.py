from src.core.config import settings

# Конфігурація Celery
broker_url = settings.CELERY_BROKER_URL
result_backend = settings.CELERY_RESULT_BACKEND

# Налаштування серіалізації
task_serializer = "json"
result_serializer = "json"
accept_content = ["json"]

# Часові зони
timezone = "Europe/Kiev"
enable_utc = False

# Налаштування worker
worker_prefetch_multiplier = 4
worker_max_tasks_per_child = 1000
task_acks_late = True
task_reject_on_worker_lost = True

# Налаштування черг
task_default_queue = "default"
task_default_exchange = "default"
task_default_routing_key = "default"

# Ретрі
task_default_retry_delay = 180  # 3 хвилини
task_max_retries = 3

# Моніторинг
worker_send_task_events = True
task_send_sent_event = True

# Розклад завдань
beat_schedule = {
    'cleanup-old-sessions': {
        'task': 'src.celery.tasks.cleanup_old_sessions',
        'schedule': 86400.0,  # Щодня
    },
    'send-daily-reports': {
        'task': 'src.celery.tasks.send_daily_reports',
        'schedule': 3600.0,  # Кожну годину
    },
    'backup-database': {
        'task': 'src.celery.tasks.backup_database',
        'schedule': 604800.0,  # Щотижня
    },
}