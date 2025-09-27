from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class PaymentMethod(enum.Enum):
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CARD = "card"
    ONLINE = "online"
    CRYPTO = "crypto"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Відносини
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    processed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Деталі платежу
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="UAH")
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Інформація про транзакцію
    transaction_id = Column(String(100))
    reference_number = Column(String(100))
    bank_reference = Column(String(100))
    
    # Дати
    payment_date = Column(DateTime)
    processed_date = Column(DateTime)
    due_date = Column(DateTime)
    
    # Додаткова інформація
    notes = Column(Text)
    is_recurring = Column(Boolean, default=False)
    receipt_sent = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    client = relationship("Client")
    processed_by = relationship("User")