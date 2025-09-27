from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc
from datetime import datetime

from .base import BaseRepository
from ..models.client import Client
from ..models.case import Case
from ..schemas.client import ClientCreate, ClientUpdate

class ClientRepository(BaseRepository[Client]):
    """Репозиторій для роботи з клієнтами"""
    
    def __init__(self):
        super().__init__(Client)
    
    async def get_with_cases(self, db: AsyncSession, client_id: int) -> Optional[Client]:
        """Отримання клієнта з його справами"""
        try:
            result = await db.execute(
                select(Client)
                .options(selectinload(Client.cases))
                .filter(Client.id == client_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            self.logger.error(f"Error getting client {client_id} with cases: {e}")
            return None
    
    async def search_clients(
        self, 
        db: AsyncSession, 
        query: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Client]:
        """Пошук клієнтів за іменем, email або телефоном"""
        try:
            search_filter = or_(
                Client.first_name.ilike(f"%{query}%"),
                Client.last_name.ilike(f"%{query}%"),
                Client.email.ilike(f"%{query}%"),
                Client.phone.ilike(f"%{query}%"),
                Client.company_name.ilike(f"%{query}%")
            )
            
            result = await db.execute(
                select(Client)
                .filter(search_filter)
                .order_by(desc(Client.created_at))
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error searching clients with query {query}: {e}")
            return []
    
    async def get_clients_by_type(
        self, 
        db: AsyncSession, 
        client_type: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Client]:
        """Отримання клієнтів за типом (фіз/юр особа)"""
        try:
            result = await db.execute(
                select(Client)
                .filter(Client.client_type == client_type)
                .order_by(desc(Client.created_at))
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting clients by type {client_type}: {e}")
            return []
    
    async def get_active_clients(self, db: AsyncSession) -> List[Client]:
        """Отримання активних клієнтів (з хоча б однією активною справою)"""
        try:
            result = await db.execute(
                select(Client)
                .join(Client.cases)
                .filter(Case.status == 'open')
                .distinct()
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error("Error getting active clients: {e}")
            return []
    
    async def get_clients_with_recent_activity(
        self, 
        db: AsyncSession, 
        days: int = 30
    ) -> List[Client]:
        """Отримання клієнтів з нещодавньою активністю"""
        try:
            from datetime import timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            result = await db.execute(
                select(Client)
                .join(Client.cases)
                .filter(Case.updated_at >= cutoff_date)
                .distinct()
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting clients with recent activity: {e}")
            return []
    
    async def get_client_stats(self, db: AsyncSession) -> Dict[str, Any]:
        """Отримання статистики клієнтів"""
        try:
            from sqlalchemy import func
            
            # Загальна кількість клієнтів
            total_result = await db.execute(select(func.count(Client.id)))
            total = total_result.scalar()
            
            # Клієнти за типом
            type_result = await db.execute(
                select(Client.client_type, func.count(Client.id))
                .group_by(Client.client_type)
            )
            type_stats = dict(type_result.all())
            
            # Активні клієнти
            active_result = await db.execute(
                select(func.count(Client.id.distinct()))
                .select_from(Client)
                .join(Case)
                .filter(Case.status == 'open')
            )
            active = active_result.scalar()
            
            # Клієнти за місяцем реєстрації
            monthly_result = await db.execute(
                select(
                    func.date_trunc('month', Client.created_at).label('month'),
                    func.count(Client.id)
                )
                .group_by('month')
                .order_by('month')
            )
            monthly_stats = {str(row.month): row.count for row in monthly_result}
            
            return {
                "total": total,
                "active": active,
                "inactive": total - active,
                "by_type": type_stats,
                "monthly_registrations": monthly_stats
            }
        except Exception as e:
            self.logger.error(f"Error getting client stats: {e}")
            return {}
    
    async def update_client_status(self, db: AsyncSession, client_id: int, is_active: bool) -> bool:
        """Оновлення статусу клієнта"""
        try:
            client = await self.get(db, client_id)
            if client:
                client.is_active = is_active
                await db.commit()
                return True
            return False
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error updating client {client_id} status: {e}")
            return False
    
    async def get_client_cases_count(self, db: AsyncSession, client_id: int) -> Dict[str, int]:
        """Отримання кількості справ клієнта за статусами"""
        try:
            from sqlalchemy import func
            
            result = await db.execute(
                select(Case.status, func.count(Case.id))
                .filter(Case.client_id == client_id)
                .group_by(Case.status)
            )
            return dict(result.all())
        except Exception as e:
            self.logger.error(f"Error getting cases count for client {client_id}: {e}")
            return {}