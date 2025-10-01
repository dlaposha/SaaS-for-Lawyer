from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.modules.auth.models import User
from src.modules.auth import schemas
from src.core.database import get_db
from src.core.security import (
    create_access_token,
    create_refresh_token,
    get_current_user
)

from . import service

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    user_service = service.UserService(db)
    user = await user_service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user