class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    order = Column(Integer, nullable=False)
    required = Column(Boolean, default=True)
    auto_complete = Column(Boolean, default=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class CaseWorkflow(Base):
    __tablename__ = "case_workflows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    workflow_template_id = Column(UUID(as_uuid=True), ForeignKey("workflow_templates.id"))
    current_step_id = Column(UUID(as_uuid=True), ForeignKey("workflow_steps.id"))
    status = Column(String(20), default="in_progress")
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)