from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from enum import Enum

class ClientType(str, Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"
    ORGANIZATION = "organization"

class ClientStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PROSPECT = "prospect"
    FORMER = "former"

class ClientBase(BaseModel):
    type: ClientType = ClientType.INDIVIDUAL
    status: ClientStatus = ClientStatus.ACTIVE
    
    # Individual fields
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    
    # Company fields
    company_name: Optional[str] = Field(None, max_length=200)
    company_legal_form: Optional[str] = Field(None, max_length=50)
    
    # Contact info
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")
    alt_phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")
    
    # Address
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    zip_code: Optional[str] = Field(None, max_length=20)
    country: str = Field("Україна", max_length=100)
    
    # Legal details
    tax_id: Optional[str] = Field(None, max_length=50)
    passport_data: Optional[str] = None
    
    # Additional info
    notes: Optional[str] = None
    source: Optional[str] = Field(None, max_length=100)
    referral: Optional[str] = Field(None, max_length=100)
    
    # Dates
    birthday: Optional[date] = None
    
    # Flags
    is_vip: bool = False
    marketing_consent: bool = False

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    status: Optional[ClientStatus] = None
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    company_name: Optional[str] = Field(None, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")
    address: Optional[str] = None
    notes: Optional[str] = None
    is_vip: Optional[bool] = None

class ClientResponse(ClientBase):
    id: UUID
    first_contact_date: datetime
    last_contact_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ClientStats(BaseModel):
    total_clients: int
    active_clients: int
    corporate_clients: int
    individual_clients: int
    vip_clients: int