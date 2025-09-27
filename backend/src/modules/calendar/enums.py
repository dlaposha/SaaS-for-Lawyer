import enum

class EventType(str, enum.Enum):
    HEARING = "hearing"
    MEETING = "meeting"
    DEADLINE = "deadline"
    REMINDER = "reminder"
    HOLIDAY = "holiday"
    OTHER = "other"

class EventStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    TENTATIVE = "tentative"
    CANCELLED = "cancelled"