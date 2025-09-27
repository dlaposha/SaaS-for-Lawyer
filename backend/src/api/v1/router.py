from fastapi import APIRouter

# Імпорт роутерів з модулів
from ..modules.ai_assistant.router import router as ai_assistant_router
from ..modules.auth.router import router as auth_router
from ..modules.users.router import router as users_router
from ..modules.calendar.router import router as calendar_router
from ..modules.cases.router import router as cases_router
from ..modules.clients.router import router as clients_router
from ..modules.documents.router import router as documents_router
from ..modules.tasks.router import router as tasks_router
from ..modules.invoices.router import router as invoices_router
from ..modules.hearings.router import router as hearings_router
from ..modules.time_tracking.router import router as time_tracking_router
from ..modules.notifications.router import router as notifications_router
from ..modules.reports.router import router as reports_router
from ..modules.knowledge.router import router as knowledge_router

# Головний роутер API
api_router = APIRouter()

# Підключення роутерів модулів
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(cases_router, prefix="/cases", tags=["Cases"])
api_router.include_router(clients_router, prefix="/clients", tags=["Clients"])
api_router.include_router(documents_router, prefix="/documents", tags=["Documents"])
api_router.include_router(calendar_router, prefix="/calendar", tags=["Calendar"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(invoices_router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(hearings_router, prefix="/hearings", tags=["Hearings"])
api_router.include_router(time_tracking_router, prefix="/time-tracking", tags=["Time Tracking"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(knowledge_router, prefix="/knowledge", tags=["Knowledge Base"])
api_router.include_router(ai_assistant_router, prefix="/ai-assistant", tags=["AI Assistant"])

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Lawyer CRM API"}