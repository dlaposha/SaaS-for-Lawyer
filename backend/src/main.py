import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

from .core.config import settings
from .core.database import db_manager, Base, get_db
from .core.security import security_service
from .api.v1.router import api_router

# -----------------------------
# 🔥 Вимкнути валідацію host у dev-режимі
# -----------------------------
if settings.ENVIRONMENT == "development":
    from uvicorn.config import Config
    Config.validate_host = lambda *args, **kwargs: True

# -----------------------------
# 🔥 Логування
# -----------------------------
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# -----------------------------
# 🔥 Lifespan (startup / shutdown)
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("✅ Starting application...")

    # Ініціалізація БД
    db_manager.init_db(str(settings.DATABASE_URL))

    # Підключення Redis
    redis = await aioredis.from_url(
        str(settings.REDIS_URL),
        encoding="utf8",
        decode_responses=True
    )
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

    # ❌ ВИДАЛЕНО: create_all() у dev — щоб не конфліктувати з Alembic
    # Тепер тільки Alembic керує схемою БД

    yield

    logger.info("🛑 Shutting down application...")
    await FastAPICache.close()

# -----------------------------
# 🔥 FastAPI ініціалізація
# -----------------------------
app = FastAPI(
    title="Lawyer CRM API",
    version="1.0.0",
    lifespan=lifespan
)

# -----------------------------
# 🔥 Middleware (без TrustedHostMiddleware у dev)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ❌ TrustedHostMiddleware ВИДАЛЕНО у dev

app.add_middleware(
    GZipMiddleware,
    minimum_size=1000
)

# -----------------------------
# 🔥 Роути
# -----------------------------
app.include_router(api_router, prefix=settings.API_PREFIX + settings.API_V1_STR)

# -----------------------------
# 🔥 Статичні файли
# -----------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# -----------------------------
# 🔥 Health check
# -----------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

# -----------------------------
# 🔥 Глобальна обробка помилок
# -----------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.error(f"Unhandled error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"}
    )