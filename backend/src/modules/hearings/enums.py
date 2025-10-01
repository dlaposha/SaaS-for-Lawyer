import enum

class HearingType(str, enum.Enum):
    PRELIMINARY = "preliminary"
    MOTION = "motion"
    TRIAL = "trial"
    SETTLEMENT = "settlement"
    APPEAL = "appeal"
    OTHER = "other"

class HearingStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ADJOURNED = "adjourned"