from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from enum import Enum

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CARD = "card"
    ONLINE = "online"

class InvoiceItemBase(BaseModel):
    description: str
    quantity: float = Field(1.0, ge=0)
    unit_price: float = Field(0.0, ge=0)
    time_entry_id: Optional[UUID] = None

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: UUID
    invoice_id: UUID
    total: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    client_id: UUID
    case_id: Optional[UUID] = None
    issue_date: date = Field(default_factory=date.today)
    due_date: date
    tax_rate: float = Field(0.0, ge=0, le=100)
    discount_rate: float = Field(0.0, ge=0, le=100)
    notes: Optional[str] = None
    terms: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] = Field(..., min_items=1)

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None

class InvoiceResponse(InvoiceBase):
    id: UUID
    invoice_number: str
    status: InvoiceStatus
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    amount_paid: float
    balance_due: float
    sent_date: Optional[datetime]
    paid_date: Optional[datetime]
    payment_method: Optional[PaymentMethod]
    payment_reference: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[InvoiceItemResponse]
    
    class Config:
        from_attributes = True

class InvoiceStats(BaseModel):
    total_invoices: int
    total_revenue: float
    pending_revenue: float
    overdue_amount: float
    by_status: dict