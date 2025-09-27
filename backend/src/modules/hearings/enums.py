import enum

class HearingType(str, enum.Enum):
    COURT = "court"
    ARBITRATION = "arbitration"
    MEDIATION = "mediation"
    NEGOTIATION = "negotiation"
    TRIAL = "trial"
    APPEAL = "appeal"

class HearingStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"