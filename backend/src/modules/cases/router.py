from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .models import Case, CaseStatus
from .schemas import CaseCreate, CaseUpdate, CaseResponse
from .service import CaseService
from ...core.database import get_db, BaseRepository
from ...core.security import get_current_user

router = APIRouter()

def get_case_service(db: Session = Depends(get_db)):
    repository = BaseRepository(Case)
    return CaseService(repository)

@router.post("/", response_model=CaseResponse)
def create_case(
    case_in: CaseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    service: CaseService = Depends(get_case_service)
):
    """Створення нової справи"""
    case = service.create_case(db, case_in, current_user.id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create case"
        )
    return case

@router.get("/", response_model=List[CaseResponse])
def read_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[CaseStatus] = None,
    db: Session = Depends(get_db),
    service: CaseService = Depends(get_case_service)
):
    """Отримання списку справ"""
    cases = service.get_cases(db, skip=skip, limit=limit, status=status)
    return cases

@router.get("/{case_id}", response_model=CaseResponse)
def read_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    service: CaseService = Depends(get_case_service)
):
    """Отримання конкретної справи"""
    case = service.get_case(db, case_id, current_user.id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    return case

@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: int,
    case_in: CaseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    service: CaseService = Depends(get_case_service)
):
    """Оновлення справи"""
    case = service.update_case(db, case_id, case_in, current_user.id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found or not authorized"
        )
    return case

@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    service: CaseService = Depends(get_case_service)
):
    """Видалення справи"""
    case = service.delete_case(db, case_id, current_user.id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found or not authorized"
        )
    return {"message": "Case deleted successfully"}