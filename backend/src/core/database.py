from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)

# Створюємо базовий клас моделі без імпорту settings
Base = declarative_base()

class DatabaseManager:
    def __init__(self):
        self._async_engine = None
        self._async_session_local = None
    
    def init_db(self, database_url: str):
        """Ініціалізація підключення до БД"""
        # Асинхронний engine для основного додатку
        self._async_engine = create_async_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=20,
            max_overflow=30,
            pool_timeout=30,
            pool_recycle=1800,
            pool_pre_ping=True,
            echo=False,
        )
        
        # Session factory для асинхронних операцій
        self._async_session_local = sessionmaker(
            bind=self._async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    
    @property
    def async_engine(self):
        if self._async_engine is None:
            raise RuntimeError("Database not initialized. Call init_db first.")
        return self._async_engine
    
    @property
    def async_session_local(self):
        if self._async_session_local is None:
            raise RuntimeError("Database not initialized. Call init_db first.")
        return self._async_session_local
    
    @asynccontextmanager
    async def get_async_db(self) -> AsyncGenerator[AsyncSession, None]:
        """Асинхронний контекстний менеджер для отримання сесії БД"""
        if self._async_session_local is None:
            raise RuntimeError("Database not initialized. Call init_db first.")
        
        async with self._async_session_local() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

# Глобальний екземпляр менеджера БД
db_manager = DatabaseManager()