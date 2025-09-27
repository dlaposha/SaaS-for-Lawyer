from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from .models import Case, CaseStatus
from .schemas import CaseCreate, CaseUpdate
from ...core.database import BaseRepository

class CaseService:
    def __init__(self, repository: BaseRepository):
        self.repository = repository
    
    def create_case(self, db: Session, case_in: CaseCreate, current_user_id: int):
        """Створення нової справи"""
        case_data = case_in.dict()
        case_data['lawyer_id'] = current_user_id
        return self.repository.create(db, case_in)
    
    def get_cases(self, db: Session, skip: int = 0, limit: int = 100, 
                  status: Optional[CaseStatus] = None, 
                  lawyer_id: Optional[int] = None,
                  client_id: Optional[int] = None):
        """Отримання списку справ з фільтрацією"""
        query = db.query(Case).filter(Case.is_active == True)
        
        if status:
            query = query.filter(Case.status == status)
        if lawyer_id:
            query = query.filter(Case.lawyer_id == lawyer_id)
        if client_id:
            query = query.filter(Case.client_id == client_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_case(self, db: Session, case_id: int, current_user_id: int):
        """Отримання конкретної справи"""
        case = self.repository.get(db, case_id)
        if case and (case.lawyer_id == current_user_id or case.client_id == current_user_id):
            return case
        return None
    
    def update_case(self, db: Session, case_id: int, case_in: CaseUpdate, current_user_id: int):
        """Оновлення справи"""
        case = self.repository.get(db, case_id)
        if not case or case.lawyer_id != current_user_id:
            return None
        
        return self.repository.update(db, case, case_in)
    
    def delete_case(self, db: Session, case_id: int, current_user_id: int):
        """Видалення справи (м'яке видалення)"""
        case = self.repository.get(db, case_id)
        if not case or case.lawyer_id != current_user_id:
            return None
        
        case.is_active = False
        db.commit()
        return case