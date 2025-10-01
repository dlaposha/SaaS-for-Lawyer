from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime  # ← обов'язково
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from src.core.security import verify_password, get_password_hash
from src.core.exceptions import ValidationException, DatabaseException
from . import models, schemas
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> Optional[models.User]:
        try:
            result = await self.db.execute(select(models.User).where(models.User.id == user_id))
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching user by ID: {e}")
            raise DatabaseException("Failed to fetch user")

    async def get_by_email(self, email: str) -> Optional[models.User]:
        try:
            result = await self.db.execute(select(models.User).where(models.User.email == email))
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching user by email: {e}")
            raise DatabaseException("Failed to fetch user")

    async def create(self, user_data: schemas.UserCreate) -> models.User:
        existing_user = await self.get_by_email(user_data.email)
        if existing_user:
            raise ValidationException("User with this email already exists")

        try:
            hashed_password = get_password_hash(user_data.password)
            db_user = models.User(
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

    async def authenticate(self, email: str, password: str) -> models.User:
        user = await self.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise ValidationException("Invalid email or password")
        if not user.is_active:
            raise ValidationException("User account is deactivated")
        return user

    async def update_last_login(self, user: models.User) -> None:
        try:
            user.last_login_at = datetime.utcnow()
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating last login: {e}")
            raise DatabaseException("Failed to update last login")