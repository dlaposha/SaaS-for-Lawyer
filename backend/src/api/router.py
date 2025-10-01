from fastapi import APIRouter

# Імпорт роутерів з модулів
from .v1.router import api_router as v1_router

# Головний роутер API
api_router = APIRouter()

# Підключення роутерів версій API
api_router.include_router(v1_router, prefix="/api/v1")

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Lawyer CRM API"}