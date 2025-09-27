import enum

class TimeEntryType(str, enum.Enum):
    BILLABLE = "billable"
    NON_BILLABLE = "non_billable"
    ADMINISTRATIVE = "administrative"
    TRAVEL = "travel"
    MEETING = "meeting"
    RESEARCH = "research"
    DRAFTING = "drafting"
    REVIEW = "review"