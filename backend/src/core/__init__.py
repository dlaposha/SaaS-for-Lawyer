# backend/src/core/__init__.py
# Уникнення циклічного імпорту - імпортуємо тільки необхідне
from .database import db_manager, Base
from .config import settings

__all__ = ['db_manager', 'Base', 'settings']