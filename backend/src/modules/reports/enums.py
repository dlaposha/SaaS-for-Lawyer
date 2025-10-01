import enum

class ReportType(str, enum.Enum):
    """Типи звітів"""
    CASE_SUMMARY = "case_summary"
    CLIENT_ACTIVITY = "client_activity"
    FINANCIAL = "financial"
    TIME_TRACKING = "time_tracking"
    PERFORMANCE = "performance"
    COMPLIANCE = "compliance"
    HEARING_SCHEDULE = "hearing_schedule"
    TASK_COMPLETION = "task_completion"

class ReportFormat(str, enum.Enum):
    """Формати звітів"""
    PDF = "pdf"
    CSV = "csv"
    XLSX = "xlsx"
    HTML = "html"
    JSON = "json"

class ReportFrequency(str, enum.Enum):
    """Частота генерації звітів"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    ON_DEMAND = "on_demand"

class ReportStatus(str, enum.Enum):
    """Статуси звітів"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"