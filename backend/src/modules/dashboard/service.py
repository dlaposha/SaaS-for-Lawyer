from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, List
from datetime import datetime, timedelta
import logging

from ....core.database import get_db
from ....repositories.case_repository import CaseRepository
from ....repositories.client_repository import ClientRepository
from ....repositories.invoice_repository import InvoiceRepository
from ....repositories.task_repository import TaskRepository
from ....repositories.time_entry_repository import TimeEntryRepository
from ....repositories.hearing_repository import HearingRepository
from ....utils.constants import CaseStatus, TaskStatus

logger = logging.getLogger(__name__)

class DashboardService:
    """Сервіс для роботи з дашбордом"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.case_repo = CaseRepository()
        self.client_repo = ClientRepository()
        self.invoice_repo = InvoiceRepository()
        self.task_repo = TaskRepository()
        self.time_repo = TimeEntryRepository()
        self.hearing_repo = HearingRepository()
    
    async def get_overview_stats(self, user_id: int) -> Dict[str, Any]:
        """Отримати загальну статистику для dashboard"""
        try:
            # Отримати статистику справ
            case_stats = await self.case_repo.get_case_stats(self.db, lawyer_id=user_id)
            
            # Отримати статистику клієнтів
            client_stats = await self.client_repo.get_client_stats(self.db)
            
            # Отримати статистику рахунків
            invoice_stats = await self._get_invoice_stats(user_id)
            
            # Отримати статистику задач
            task_stats = await self._get_task_stats(user_id)
            
            # Отримати майбутні засідання
            upcoming_hearings = await self.hearing_repo.get_upcoming_hearings(
                self.db, days=7, lawyer_id=user_id
            )
            
            # Отримати незавершені задачі
            pending_tasks = await self.task_repo.get_tasks_by_status(
                self.db, status=TaskStatus.PENDING, assigned_to=user_id, limit=10
            )
            
            # Отримати останні рахунки
            recent_invoices = await self.invoice_repo.get_recent_invoices(
                self.db, user_id=user_id, limit=5
            )
            
            # Отримати тижневий дохід
            weekly_revenue = await self._get_weekly_revenue(user_id)
            
            # Розрахувати успішність справ
            success_rate = await self._get_success_rate(user_id)
            
            return {
                "cases": {
                    "total": case_stats.get("total", 0),
                    "open": case_stats.get("by_status", {}).get(CaseStatus.OPEN, 0),
                    "closed": case_stats.get("by_status", {}).get(CaseStatus.CLOSED, 0),
                    "urgent": len(await self.case_repo.get_urgent_cases(self.db))
                },
                "clients": {
                    "total": client_stats.get("total", 0),
                    "active": client_stats.get("active", 0),
                    "new_this_month": await self._get_new_clients_this_month()
                },
                "financial": invoice_stats,
                "tasks": task_stats,
                "upcoming_hearings": len(upcoming_hearings),
                "pending_tasks": len(pending_tasks),
                "recent_invoices": recent_invoices,
                "weekly_revenue": weekly_revenue,
                "case_success_rate": success_rate,
                "productivity": await self._get_productivity_metrics(user_id)
            }
            
        except Exception as e:
            logger.error(f"Dashboard stats error: {e}")
            raise
    
    async def _get_invoice_stats(self, user_id: int) -> Dict[str, Any]:
        """Отримати статистику рахунків"""
        try:
            # Отримати загальну суму рахунків
            total_invoices = await self.invoice_repo.get_total_amount(self.db, user_id)
            
            # Отримати неоплачені рахунки
            unpaid_invoices = await self.invoice_repo.get_unpaid_invoices(self.db, user_id)
            unpaid_amount = sum(invoice.amount for invoice in unpaid_invoices)
            
            # Отримати рахунки за останній місяць
            monthly_invoices = await self.invoice_repo.get_invoices_by_period(
                self.db, user_id, days=30
            )
            monthly_amount = sum(invoice.amount for invoice in monthly_invoices)
            
            return {
                "total_amount": total_invoices,
                "unpaid_amount": unpaid_amount,
                "monthly_amount": monthly_amount,
                "unpaid_count": len(unpaid_invoices)
            }
        except Exception as e:
            logger.error(f"Invoice stats error: {e}")
            return {}
    
    async def _get_task_stats(self, user_id: int) -> Dict[str, Any]:
        """Отримати статистику задач"""
        try:
            # Отримати задачі за статусами
            pending_tasks = await self.task_repo.get_tasks_by_status(
                self.db, TaskStatus.PENDING, user_id
            )
            in_progress_tasks = await self.task_repo.get_tasks_by_status(
                self.db, TaskStatus.IN_PROGRESS, user_id
            )
            completed_tasks = await self.task_repo.get_tasks_by_status(
                self.db, TaskStatus.COMPLETED, user_id
            )
            
            # Отримати прострочені задачі
            overdue_tasks = await self.task_repo.get_overdue_tasks(self.db, user_id)
            
            return {
                "pending": len(pending_tasks),
                "in_progress": len(in_progress_tasks),
                "completed": len(completed_tasks),
                "overdue": len(overdue_tasks),
                "total": len(pending_tasks) + len(in_progress_tasks) + len(completed_tasks)
            }
        except Exception as e:
            logger.error(f"Task stats error: {e}")
            return {}
    
    async def _get_weekly_revenue(self, user_id: int) -> float:
        """Отримати тижневий дохід"""
        try:
            time_entries = await self.time_repo.get_time_entries_by_period(
                self.db, user_id, days=7
            )
            return sum(entry.amount or 0 for entry in time_entries)
        except Exception as e:
            logger.error(f"Weekly revenue error: {e}")
            return 0.0
    
    async def _get_success_rate(self, user_id: int) -> float:
        """Розрахувати успішність справ"""
        try:
            cases = await self.case_repo.get_cases_by_lawyer(self.db, user_id)
            closed_cases = [c for c in cases if c.status == CaseStatus.CLOSED]
            
            if not closed_cases:
                return 0.0
            
            successful_cases = [c for c in closed_cases if getattr(c, 'outcome', '') == "successful"]
            return (len(successful_cases) / len(closed_cases)) * 100
        except Exception as e:
            logger.error(f"Success rate calculation error: {e}")
            return 0.0
    
    async def _get_new_clients_this_month(self) -> int:
        """Отримати кількість нових клієнтів за поточний місяць"""
        try:
            from datetime import datetime
            start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            clients = await self.client_repo.get_multi(self.db)
            new_clients = [c for c in clients if c.created_at >= start_of_month]
            
            return len(new_clients)
        except Exception as e:
            logger.error(f"New clients count error: {e}")
            return 0
    
    async def _get_productivity_metrics(self, user_id: int) -> Dict[str, Any]:
        """Отримати метрики продуктивності"""
        try:
            # Отримати часові записи за останній тиждень
            time_entries = await self.time_repo.get_time_entries_by_period(
                self.db, user_id, days=7
            )
            
            total_hours = sum(entry.duration_hours or 0 for entry in time_entries)
            billed_hours = sum(entry.duration_hours or 0 for entry in time_entries if entry.billable)
            
            return {
                "total_hours": total_hours,
                "billed_hours": billed_hours,
                "efficiency": (billed_hours / total_hours * 100) if total_hours > 0 else 0,
                "daily_average": total_hours / 7 if time_entries else 0
            }
        except Exception as e:
            logger.error(f"Productivity metrics error: {e}")
            return {}
    
    async def get_activity_timeline(self, user_id: int, days: int = 30) -> List[Dict[str, Any]]:
        """Отримати таймлайн активності"""
        try:
            activities = []
            
            # Додати останні справи
            recent_cases = await self.case_repo.get_multi(self.db, limit=10)
            activities.extend([
                {
                    "type": "case_created",
                    "title": f"Створено справу: {case.title}",
                    "timestamp": case.created_at,
                    "entity_id": case.id
                }
                for case in recent_cases
            ])
            
            # Додати останні задачі
            recent_tasks = await self.task_repo.get_multi(self.db, limit=10)
            activities.extend([
                {
                    "type": "task_created",
                    "title": f"Створено задачу: {task.title}",
                    "timestamp": task.created_at,
                    "entity_id": task.id
                }
                for task in recent_tasks
            ])
            
            # Додати останні засідання
            recent_hearings = await self.hearing_repo.get_recent_hearings(self.db, days=days)
            activities.extend([
                {
                    "type": "hearing_scheduled",
                    "title": f"Заплановано засідання: {hearing.title}",
                    "timestamp": hearing.scheduled_for,
                    "entity_id": hearing.id
                }
                for hearing in recent_hearings
            ])
            
            # Сортувати за датою
            activities.sort(key=lambda x: x["timestamp"], reverse=True)
            
            return activities[:50]  # Обмежити кількість
            
        except Exception as e:
            logger.error(f"Activity timeline error: {e}")
            return []