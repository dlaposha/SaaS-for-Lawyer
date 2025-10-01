from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool  # ✅ Сумісний з asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator, TypeVar, Generic, Type, Optional, List
from sqlalchemy.future import select
import logging

logger = logging.getLogger(__name__)

# 🔥 Глобальний Base для моделей
Base = declarative_base()

# 🔥 Глобальні змінні для зовнішнього доступу
engine = None
AsyncSessionLocal = None


class DatabaseManager:
    def __init__(self):
        self._async_engine = None
        self._async_session_local = None

    def init_db(self, database_url: str):
        """Ініціалізація асинхронного підключення до БД"""
        global engine, AsyncSessionLocal

        if not database_url.startswith("postgresql+asyncpg"):
            logger.warning("DATABASE_URL не використовує asyncpg. Переконайся, що вказано правильний драйвер.")

        self._async_engine = create_async_engine(
            database_url,
            poolclass=NullPool,  # ✅ Безпечний пул для asyncio
            echo=False,
        )

        self._async_session_local = sessionmaker(
            bind=self._async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

        engine = self._async_engine
        AsyncSessionLocal = self._async_session_local
        logger.info("✅ Асинхронне підключення до БД ініціалізовано.")

    @property
    def async_engine(self):
        if self._async_engine is None:
            raise RuntimeError("База даних не ініціалізована. Спочатку виклич init_db().")
        return self._async_engine

    @property
    def async_session_local(self):
        if self._async_session_local is None:
            raise RuntimeError("База даних не ініціалізована. Спочатку виклич init_db().")
        return self._async_session_local

    @asynccontextmanager
    async def get_async_db(self) -> AsyncGenerator[AsyncSession, None]:
        """Асинхронний контекстний менеджер для отримання сесії БД"""
        if self._async_session_local is None:
            raise RuntimeError("База даних не ініціалізована. Спочатку виклич init_db().")

        async with self._async_session_local() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                logger.exception("❌ Помилка під час роботи з сесією БД")
                raise
            finally:
                await session.close()


# -----------------------------
# 🔥 Базовий репозиторій для CRUD
# -----------------------------
ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """Базовий репозиторій для CRUD-операцій"""
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id) -> Optional[ModelType]:
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_all(self) -> List[ModelType]:
        result = await self.db.execute(select(self.model))
        return result.scalars().all()

    async def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def delete(self, obj: ModelType) -> None:
        await self.db.delete(obj)
        await self.db.commit()


# -----------------------------
# 🔥 Функція для FastAPI Depends
# -----------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with db_manager.get_async_db() as session:
        yield session


# -----------------------------
# Глобальний екземпляр менеджера БД
# -----------------------------
db_manager = DatabaseManager()