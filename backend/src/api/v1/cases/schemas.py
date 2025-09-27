from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .models import CaseStatus

class CaseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: CaseStatus = CaseStatus.NEW
    priority: str = "medium"
    client_id: int
    lawyer_id: int

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[str] = None

class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    is_active: bool
    
    class Config:
        orm_mode = True