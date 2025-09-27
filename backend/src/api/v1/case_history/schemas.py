from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID
from src.core.common import CaseStage

class CaseStageHistoryBase(BaseModel):
    case_id: UUID
    stage: CaseStage
    note: Optional[str] = None

class CaseStageHistoryCreate(CaseStageHistoryBase):
    pass

class CaseStageHistoryResponse(CaseStageHistoryBase):
    id: UUID
    user_id: UUID
    from_date: datetime
    to_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True