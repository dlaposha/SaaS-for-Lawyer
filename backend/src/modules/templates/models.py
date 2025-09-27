class TemplateType(enum.Enum):
    DOCUMENT = "document"
    EMAIL = "email"
    SMS = "sms"
    CONTRACT = "contract"
    PLEADING = "pleading"

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    type = Column(Enum(TemplateType), nullable=False)
    content = Column(Text, nullable=False)
    variables = Column(JSON)
    category = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)