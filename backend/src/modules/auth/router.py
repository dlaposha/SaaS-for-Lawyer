from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt  # ← обов'язково для `refresh_token`

from . import service, schemas, models
from src.core.database import get_db
from src.core.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    verify_token  # ← якщо хочеш перевіряти refresh token
)
from src.core.config import settings  # ← для `settings.SECRET_KEY`

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = HTTPBearer()  # ← для `Depends(oauth2_scheme)` у `refresh_token`

@router.post("/register", response_model=schemas.UserResponse)
async def register(
    user_data: schemas.UserCreate,
    db: AsyncSession = Depends(get_db)
):
    user_service = service.UserService(db)
    return await user_service.create(user_data)

@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user_service = service.UserService(db)
    user = await user_service.authenticate(form_data.username, form_data.password)

    await user_service.update_last_login(user)

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(
    current_user: models.User = Depends(get_current_user)
):
    return current_user

@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    credentials: HTTPBearer = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = verify_token(token, token_type="refresh")
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_service = service.UserService(db)
    user = await user_service.get_by_email(email)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }