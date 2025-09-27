from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta

from .base import BaseRepository
from ..models.invoice import Invoice

class InvoiceRepository(BaseRepository[Invoice]):
    """Репозиторій для роботи з рахунками"""
    
    def __init__(self):
        super().__init__(Invoice)
    
    async def get_total_amount(self, db: AsyncSession, user_id: int) -> float:
        """Отримати загальну суму рахунків"""
        result = await db.execute(
            select(func.sum(Invoice.amount)).filter(Invoice.lawyer_id == user_id)
        )
        return result.scalar() or 0.0
    
    async def get_unpaid_invoices(self, db: AsyncSession, user_id: int) -> List[Invoice]:
        """Отримати неоплачені рахунки"""
        result = await db.execute(
            select(Invoice).filter(
                Invoice.lawyer_id == user_id,
                Invoice.paid == False
            )
        )
        return result.scalars().all()
    
    async def get_invoices_by_period(self, db: AsyncSession, user_id: int, days: int) -> List[Invoice]:
        """Отримати рахунки за період"""
        start_date = datetime.utcnow() - timedelta(days=days)
        result = await db.execute(
            select(Invoice).filter(
                Invoice.lawyer_id == user_id,
                Invoice.created_at >= start_date
            )
        )
        return result.scalars().all()
    
    async def get_recent_invoices(self, db: AsyncSession, user_id: int, limit: int = 5) -> List[Invoice]:
        """Отримати останні рахунки"""
        result = await db.execute(
            select(Invoice)
            .filter(Invoice.lawyer_id == user_id)
            .order_by(Invoice.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()