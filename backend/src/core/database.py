from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
from typing import Generator
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Оптимізований engine для production
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    connect_args={
        "connect_timeout": 10,
        "application_name": "lawyer_crm_backend"
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

Base = declarative_base()

@contextmanager
def get_db() -> Generator[Session, None, None]:
    """Контекстний менеджер для роботи з БД"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        db.close()

class BaseRepository:
    """Базовий репозиторій з розширеною обробкою помилок"""

    def __init__(self, model):
        self.model = model

    def get(self, db: Session, id: int):
        """Отримання запису за ID"""
        try:
            return db.query(self.model).filter(self.model.id == id).one_or_none()
        except Exception as e:
            logger.error(f"Error retrieving {self.model.__name__}: {e}")
            return None

    def create(self, db: Session, obj_in):
        """Створення нового запису"""
        try:
            db_obj = self.model(**obj_in.dict())
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            logger.error(f"Error creating {self.model.__name__}: {e}")
            return None

    def update(self, db: Session, db_obj, obj_in):
        """Оновлення запису"""
        try:
            obj_data = obj_in.dict(exclude_unset=True)
            for field in obj_data:
                setattr(db_obj, field, obj_data[field])
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            logger.error(f"Error updating {self.model.__name__}: {e}")
            return None

    def delete(self, db: Session, id: int):
        """Видалення запису (м'яке видалення)"""
        try:
            db_obj = self.get(db, id)
            if db_obj:
                db_obj.is_active = False
                db.add(db_obj)
                db.commit()
                return db_obj
            return None
        except Exception as e:
            logger.error(f"Error deleting {self.model.__name__}: {e}")
            return None

    def exists(self, db: Session, id: int) -> bool:
        """Перевірка наявності запису за ID"""
        try:
            return db.query(self.model).filter(self.model.id == id).scalar() is not None
        except Exception as e:
            logger.error(f"Error checking existence of {self.model.__name__}: {e}")
            return False