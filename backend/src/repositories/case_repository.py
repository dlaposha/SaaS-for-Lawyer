from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc, asc
from datetime import datetime, date

from .base import BaseRepository
from ..models.case import Case
from ..models.user import User
from ..models.client import Client
from ..schemas.case import CaseCreate, CaseUpdate
from ..utils.constants import CaseStatus, CaseStage, Priority

class CaseRepository(BaseRepository[Case]):
    """Репозиторій для роботи з справами"""
    
    def __init__(self):
        super().__init__(Case)
    
    async def get_with_details(self, db: AsyncSession, case_id: int) -> Optional[Case]:
        """Отримання справи з деталями клієнта та юриста"""
        try:
            result = await db.execute(
                select(Case)
                .options(
                    selectinload(Case.client),
                    selectinload(Case.lawyer)
                )
                .filter(Case.id == case_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            self.logger.error(f"Error getting case {case_id} with details: {e}")
            return None
    
    async def get_cases_by_lawyer(
        self, 
        db: AsyncSession, 
        lawyer_id: int,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Case]:
        """Отримання справ за юристом"""
        try:
            result = await db.execute(
                select(Case)
                .filter(Case.lawyer_id == lawyer_id)
                .order_by(desc(Case.created_at))
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting cases for lawyer {lawyer_id}: {e}")
            return []
    
    async def get_cases_by_client(
        self, 
        db: AsyncSession, 
        client_id: int,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Case]:
        """Отримання справ за клієнтом"""
        try:
            result = await db.execute(
                select(Case)
                .filter(Case.client_id == client_id)
                .order_by(desc(Case.created_at))
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting cases for client {client_id}: {e}")
            return []
    
    async def search_cases(
        self, 
        db: AsyncSession, 
        query: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Case]:
        """Пошук справ за назвою, описом або номером справи"""
        try:
            search_filter = or_(
                Case.title.ilike(f"%{query}%"),
                Case.description.ilike(f"%{query}%"),
                Case.case_number.ilike(f"%{query}%")
            )
            
            result = await db.execute(
                select(Case)
                .filter(search_filter)
                .order_by(desc(Case.created_at))
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error searching cases with query {query}: {e}")
            return []
    
    async def get_cases_by_status(
        self, 
        db: AsyncSession, 
        status: CaseStatus,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Case]:
        """Отримання справ за статусом"""
        try:
            result = await db.execute(
                select(Case)
                .filter(Case.status == status)
                .order_by(desc(Case.created_at))
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting cases with status {status}: {e}")
            return []
    
    async def get_cases_by_stage(
        self, 
        db: AsyncSession, 
        stage: CaseStage,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Case]:
        """Отримання справ за стадією"""
        try:
            result = await db.execute(
                select(Case)
                .filter(Case.stage == stage)
                .order_by(desc(Case.created_at))
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting cases with stage {stage}: {e}")
            return []
    
    async def get_urgent_cases(self, db: AsyncSession) -> List[Case]:
        """Отримання термінових справ"""
        try:
            result = await db.execute(
                select(Case)
                .filter(
                    Case.priority == Priority.URGENT,
                    Case.status == CaseStatus.OPEN
                )
                .order_by(asc(Case.deadline))
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error("Error getting urgent cases: {e}")
            return []
    
    async def get_cases_with_upcoming_deadlines(
        self, 
        db: AsyncSession, 
        days: int = 7
    ) -> List[Case]:
        """Отримання справ з наближеними дедлайнами"""
        try:
            from datetime import timedelta
            cutoff_date = datetime.utcnow() + timedelta(days=days)
            
            result = await db.execute(
                select(Case)
                .filter(
                    Case.deadline <= cutoff_date,
                    Case.status == CaseStatus.OPEN
                )
                .order_by(asc(Case.deadline))
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting cases with deadlines in {days} days: {e}")
            return []
    
    async def get_case_stats(self, db: AsyncSession, lawyer_id: Optional[int] = None) -> Dict[str, Any]:
        """Отримання статистики справ"""
        try:
            from sqlalchemy import func
            
            base_query = select(Case)
            if lawyer_id:
                base_query = base_query.filter(Case.lawyer_id == lawyer_id)
            
            # Загальна кількість справ
            total_result = await db.execute(select(func.count(Case.id)).select_from(base_query))
            total = total_result.scalar()
            
            # Справи за статусами
            status_result = await db.execute(
                select(Case.status, func.count(Case.id))
                .group_by(Case.status)
            )
            status_stats = dict(status_result.all())
            
            # Справи за стадіями
            stage_result = await db.execute(
                select(Case.stage, func.count(Case.id))
                .group_by(Case.stage)
            )
            stage_stats = dict(stage_result.all())
            
            # Справи за пріоритетами
            priority_result = await db.execute(
                select(Case.priority, func.count(Case.id))
                .group_by(Case.priority)
            )
            priority_stats = dict(priority_result.all())
            
            return {
                "total": total,
                "by_status": status_stats,
                "by_stage": stage_stats,
                "by_priority": priority_stats
            }
        except Exception as e:
            self.logger.error(f"Error getting case stats: {e}")
            return {}