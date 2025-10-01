from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Імпортуємо User з auth
from src.modules.auth.models import User
from src.modules.auth import schemas
from src.core.security import get_password_hash, verify_password
from src.core.exceptions import ValidationException, DatabaseException
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        try:
            result = await self.db.execute(select(User).where(User.id == user_id))
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching user by ID: {e}")
            raise DatabaseException("Failed to fetch user")

    async def get_by_email(self, email: str) -> Optional[User]:
        try:
            result = await self.db.execute(select(User).where(User.email == email))
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching user by email: {e}")
            raise DatabaseException("Failed to fetch user")

    async def create(self, user_data: schemas.UserCreate) -> User:
        existing_user = await self.get_by_email(user_data.email)
        if existing_user:
            raise ValidationException("User with this email already exists")

        try:
            hashed_password = get_password_hash(user_data.password)
            db_user = User(
                email=user_data.email,
                hashed_password=hashed_password,
                full_name=user_data.full_name,
                phone=user_data.phone,
                role=user_data.role.value,
                timezone=user_data.timezone,
                language=user_data.language
            )

            self.db.add(db_user)
            await self.db.commit()
            await self.db.refresh(db_user)
            return db_user

        except IntegrityError as e:
            await self.db.rollback()
            logger.error(f"User creation integrity error: {e}")
            raise DatabaseException("Failed to create user due to database constraints")
        except Exception as e:
            await self.db.rollback()
            logger.error(f"User creation error: {e}")
            raise DatabaseException("Failed to create user")

    async def authenticate(self, email: str, password: str) -> User:
        user = await self.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise ValidationException("Invalid email or password")
        if not user.is_active:
            raise ValidationException("User account is deactivated")
        return user

    async def update_last_login(self, user: User) -> None:
        try:
            user.last_login_at = datetime.utcnow()
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating last login: {e}")
            raise DatabaseException("Failed to update last login")