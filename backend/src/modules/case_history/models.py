from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from src.core.database import Base
from src.core.common import CaseStage

class CaseStageHistory(Base):
    __tablename__ = "case_stage_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    stage = Column(Enum(CaseStage), nullable=False)
    from_date = Column(DateTime(timezone=True), default=func.now())
    to_date = Column(DateTime(timezone=True))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    note = Column(Text)

    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)