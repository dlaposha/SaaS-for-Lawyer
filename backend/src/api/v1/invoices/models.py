from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class InvoiceStatus(enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentMethod(enum.Enum):
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CARD = "card"
    ONLINE = "online"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # Відносини
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    
    # Деталі рахунку
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    issue_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    sent_date = Column(DateTime)
    paid_date = Column(DateTime)
    
    # Суми
    subtotal = Column(Numeric(12, 2), default=0.0)
    tax_amount = Column(Numeric(12, 2), default=0.0)
    discount_amount = Column(Numeric(12, 2), default=0.0)
    total_amount = Column(Numeric(12, 2), default=0.0)
    amount_paid = Column(Numeric(12, 2), default=0.0)
    balance_due = Column(Numeric(12, 2), default=0.0)
    
    # Податки та знижки
    tax_rate = Column(Numeric(5, 2), default=0.0)  # 20.00 for 20%
    discount_rate = Column(Numeric(5, 2), default=0.0)
    
    # Додаткова інформація
    notes = Column(Text)
    terms = Column(Text)
    payment_method = Column(Enum(PaymentMethod))
    payment_reference = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="invoices")
    case = relationship("Case", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False)
    
    description = Column(Text, nullable=False)
    quantity = Column(Numeric(10, 2), default=1.0)
    unit_price = Column(Numeric(10, 2), default=0.0)
    total = Column(Numeric(12, 2), default=0.0)
    
    # Посилання на time entry або іншу сутність
    time_entry_id = Column(UUID(as_uuid=True), ForeignKey("time_entries.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    invoice = relationship("Invoice", back_populates="items")
    time_entry = relationship("TimeEntry")