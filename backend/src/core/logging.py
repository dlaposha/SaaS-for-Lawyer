import logging
import logging.config
import sys
from pathlib import Path
import json
from typing import Dict, Any

from .config import settings

def setup_logging() -> None:
    """Налаштування системи логування"""
    
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "fmt": "%(asctime)s %(levelname)s %(name)s %(message)s"
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s [%(filename)s:%(lineno)d]: %(message)s"
            }
        },
        "handlers": {
            "default": {
                "level": "INFO",
                "formatter": "standard",
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
            },
            "file": {
                "level": "INFO",
                "formatter": "detailed",
                "class": "logging.handlers.RotatingFileHandler",
                "filename": f"/app/logs/{settings.ENVIRONMENT}.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
            "error_file": {
                "level": "ERROR",
                "formatter": "detailed",
                "class": "logging.handlers.RotatingFileHandler",
                "filename": f"/app/logs/{settings.ENVIRONMENT}_error.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
            "json_file": {
                "level": "INFO",
                "formatter": "json",
                "class": "logging.handlers.RotatingFileHandler",
                "filename": f"/app/logs/{settings.ENVIRONMENT}_json.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            }
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["default", "file", "error_file"],
                "level": "INFO",
                "propagate": False
            },
            "src": {
                "handlers": ["default", "file", "json_file"],
                "level": "DEBUG" if settings.DEBUG else "INFO",
                "propagate": False
            },
            "uvicorn": {
                "handlers": ["default", "file"],
                "level": "INFO",
                "propagate": False
            },
            "sqlalchemy.engine": {
                "handlers": ["default"],
                "level": "WARNING",
                "propagate": False
            },
            "celery": {
                "handlers": ["default", "file"],
                "level": "INFO",
                "propagate": False
            }
        }
    }
    
    # Створення директорії для логів
    log_dir = Path("/app/logs")
    log_dir.mkdir(exist_ok=True)
    
    # Застосування конфігурації
    logging.config.dictConfig(log_config)

def get_logger(name: str) -> logging.Logger:
    """Отримання логера з вказаним ім'ям"""
    return logging.getLogger(name)

# Створення основного логера
logger = get_logger("lawyer-crm")

class RequestLogger:
    """Логер для HTTP запитів"""
    
    def __init__(self):
        self.logger = get_logger("request")
    
    def log_request(self, method: str, path: str, status_code: int, duration: float):
        """Логування HTTP запиту"""
        self.logger.info(
            "Request completed",
            extra={
                "method": method,
                "path": path,
                "status_code": status_code,
                "duration": duration,
                "type": "http_request"
            }
        )
    
    def log_error(self, method: str, path: str, error: Exception):
        """Логування помилки запиту"""
        self.logger.error(
            "Request failed",
            extra={
                "method": method,
                "path": path,
                "error": str(error),
                "type": "http_error"
            }
        )

# Глобальний екземпляр логера запитів
request_logger = RequestLogger()