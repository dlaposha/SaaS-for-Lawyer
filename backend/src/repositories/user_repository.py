from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_

from .base import BaseRepository
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate

class UserRepository(BaseRepository[User]):
    """Репозиторій для роботи з користувачами"""
    
    def __init__(self):
        super().__init__(User)
    
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Отримання користувача за email"""
        try:
            result = await db.execute(
                select(User).filter(User.email == email)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            self.logger.error(f"Error getting user by email {email}: {e}")
            return None
    
    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        """Отримання користувача за іменем користувача"""
        try:
            result = await db.execute(
                select(User).filter(User.username == username)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            self.logger.error(f"Error getting user by username {username}: {e}")
            return None
    
    async def search(
        self, 
        db: AsyncSession, 
        query: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[User]:
        """Пошук користувачів за іменем, email або іменем користувача"""
        try:
            search_filter = or_(
                User.email.ilike(f"%{query}%"),
                User.username.ilike(f"%{query}%"),
                User.first_name.ilike(f"%{query}%"),
                User.last_name.ilike(f"%{query}%")
            )
            
            result = await db.execute(
                select(User)
                .filter(search_filter)
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error searching users with query {query}: {e}")
            return []
    
    async def get_active_users(self, db: AsyncSession) -> List[User]:
        """Отримання активних користувачів"""
        try:
            result = await db.execute(
                select(User).filter(User.is_active == True)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error("Error getting active users: {e}")
            return []
    
    async def get_users_by_role(self, db: AsyncSession, role: str) -> List[User]:
        """Отримання користувачів за роллю"""
        try:
            result = await db.execute(
                select(User).filter(User.role == role, User.is_active == True)
            )
            return result.scalars().all()
        except Exception as e:
            self.logger.error(f"Error getting users by role {role}: {e}")
            return []
    
    async def update_last_login(self, db: AsyncSession, user_id: int) -> bool:
        """Оновлення часу останнього входу"""
        try:
            from sqlalchemy import update
            from datetime import datetime
            
            stmt = (
                update(User)
                .where(User.id == user_id)
                .values(last_login=datetime.utcnow())
            )
            await db.execute(stmt)
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error updating last login for user {user_id}: {e}")
            return False
    
    async def deactivate_user(self, db: AsyncSession, user_id: int) -> bool:
        """Деактивація користувача"""
        try:
            user = await self.get(db, user_id)
            if user:
                user.is_active = False
                await db.commit()
                return True
            return False
        except Exception as e:
            await db.rollback()
            self.logger.error(f"Error deactivating user {user_id}: {e}")
            return False
    
    async def get_user_stats(self, db: AsyncSession) -> Dict[str, Any]:
        """Отримання статистики користувачів"""
        try:
            from sqlalchemy import func
            
            # Загальна кількість користувачів
            total_result = await db.execute(select(func.count(User.id)))
            total = total_result.scalar()
            
            # Активні користувачі
            active_result = await db.execute(
                select(func.count(User.id)).filter(User.is_active == True)
            )
            active = active_result.scalar()
            
            # Користувачі за ролями
            roles_result = await db.execute(
                select(User.role, func.count(User.id))
                .group_by(User.role)
            )
            roles_stats = dict(roles_result.all())
            
            return {
                "total": total,
                "active": active,
                "inactive": total - active,
                "by_role": roles_stats
            }
        except Exception as e:
            self.logger.error(f"Error getting user stats: {e}")
            return {}