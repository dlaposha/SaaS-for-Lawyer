from pydantic_settings import BaseSettings  # Виправлений імпорт
from pydantic import AnyHttpUrl, validator, PostgresDsn, RedisDsn
from typing import List, Optional, Union
import secrets

class Settings(BaseSettings):
    # Безпека - автоматична генерація секретного ключа
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # База даних
    DATABASE_URL: PostgresDsn
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis для кешування та сесій
    REDIS_URL: RedisDsn = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = "your_redis_password"
    REDIS_CACHE_TTL: int = 300

    # MinIO для зберігання файлів
    MINIO_ENDPOINT: str = "http://minio:9000"  # Додано значення за замовчуванням
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "lawyer-crm"
    MINIO_SECURE: bool = False

    # SMTP для email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    EMAIL_TEMPLATES_DIR: str = "./email-templates"

    # Налаштування додатку
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # CORS з валідацією
    CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Парсить CORS_ORIGINS з рядка або JSON-масиву."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Allowed Hosts з валідацією
    ALLOWED_HOSTS: List[str] = []

    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        """Парсить ALLOWED_HOSTS з рядка або JSON-масиву."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["localhost", "127.0.0.1"]

    # API
    API_V1_STR: str = "/api/v1"
    API_PREFIX: str = "/api"

    # Моніторинг - Prometheus
    PROMETHEUS_MULTIPROC_DIR: str = "/tmp/prometheus"
    METRICS_ENABLED: bool = True

    # Celery - додано значення за замовчуванням
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Додаткові налаштування
    UPLOAD_MAX_FILE_SIZE: int = 104857600  # 100MB
    SESSION_TIMEOUT: int = 3600
    PASSWORD_RESET_TIMEOUT: int = 3600

    # Сервіси
    SENTRY_DSN: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True
        env_file_encoding = 'utf-8'

settings = Settings()