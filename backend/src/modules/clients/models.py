from sqlalchemy import Column, String, DateTime, Text, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum

class ClientType(enum.Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"
    ORGANIZATION = "organization"

class ClientStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PROSPECT = "prospect"
    FORMER = "former"

class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Основна інформація
    type = Column(Enum(ClientType), default=ClientType.INDIVIDUAL)
    status = Column(Enum(ClientStatus), default=ClientStatus.ACTIVE)
    
    # Для фізичних осіб
    first_name = Column(String(100))
    last_name = Column(String(100))
    middle_name = Column(String(100))
    
    # Для компаній
    company_name = Column(String(200))
    company_legal_form = Column(String(50))  # ТОВ, ПП, АТ и т.д.
    
    # Контактна інформація
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20))
    alt_phone = Column(String(20))
    
    # Адреса
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100), default="Україна")
    
    # Юридичні деталі
    tax_id = Column(String(50))  # ІПН/ЄДРПОУ
    passport_data = Column(Text)
    
    # Додаткова інформація
    notes = Column(Text)
    source = Column(String(100))  # Як дізнались про нас
    referral = Column(String(100))  # Хто порекомендував
    
    # Важливі дати
    birthday = Column(DateTime)
    first_contact_date = Column(DateTime, default=datetime.utcnow)
    last_contact_date = Column(DateTime)
    
    # Статус
    is_vip = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cases = relationship("Case", back_populates="client")
    contacts = relationship("ClientContact", back_populates="client")
    documents = relationship("Document", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")