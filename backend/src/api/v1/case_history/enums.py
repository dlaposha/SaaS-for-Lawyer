import enum

class HistoryAction(str, enum.Enum):
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"
    VIEWED = "viewed"
    COMMENTED = "commented"
    ATTACHED = "attached"
    DETACHED = "detached"