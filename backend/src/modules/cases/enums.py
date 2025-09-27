import enum

class CaseStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"

class CaseStage(str, enum.Enum):
    CONSULTATION = "consultation"
    PRE_LITIGATION = "pre_litigation"
    LITIGATION = "litigation"
    SETTLEMENT = "settlement"
    APPEAL = "appeal"
    COMPLETED = "completed"