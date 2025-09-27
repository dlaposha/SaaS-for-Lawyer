class IntegrationType(enum.Enum):
    EMAIL = "email"
    CALENDAR = "calendar"
    STORAGE = "storage"
    PAYMENT = "payment"
    COURT = "court"

class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    type = Column(Enum(IntegrationType), nullable=False)
    provider = Column(String(100), nullable=False)  # Google, Microsoft, Dropbox, etc.
    is_active = Column(Boolean, default=False)
    credentials = Column(JSON)  # Encrypted credentials
    settings = Column(JSON)
    last_sync = Column(DateTime)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)