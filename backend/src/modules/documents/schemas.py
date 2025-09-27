from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

class DocumentType(str, Enum):
    CONTRACT = "contract"
    PLEADING = "pleading"
    MOTION = "motion"
    BRIEF = "brief"
    AGREEMENT = "agreement"
    CORRESPONDENCE = "correspondence"
    REPORT = "report"
    EVIDENCE = "evidence"
    OTHER = "other"

class DocumentStatus(str, Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    FILED = "filed"
    SERVED = "served"
    ARCHIVED = "archived"

class DocumentBase(BaseModel):
    case_id: UUID
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    type: DocumentType = DocumentType.OTHER
    status: DocumentStatus = DocumentStatus.DRAFT
    tags: Optional[str] = Field(None, max_length=200)
    keywords: Optional[str] = Field(None, max_length=200)
    language: str = Field("uk", max_length=10)
    is_template: bool = False
    is_confidential: bool = False

class DocumentCreate(DocumentBase):
    file_name: str = Field(..., max_length=255)
    file_size: str = Field(..., max_length=20)
    file_type: str = Field(..., max_length=50)

class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[DocumentStatus] = None
    tags: Optional[str] = Field(None, max_length=200)
    keywords: Optional[str] = Field(None, max_length=200)
    is_confidential: Optional[bool] = None

class DocumentResponse(DocumentBase):
    id: UUID
    client_id: UUID
    created_by_id: UUID
    file_name: str
    file_size: str
    file_type: str
    version: str
    created_date: datetime
    modified_date: datetime
    filed_date: Optional[datetime]
    served_date: Optional[datetime]
    shareable_link: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DocumentStats(BaseModel):
    total_documents: int
    by_type: dict
    by_status: dict
    total_size: str