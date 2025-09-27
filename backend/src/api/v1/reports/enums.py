import enum

class ReportType(str, enum.Enum):
    CASE_SUMMARY = "case_summary"
    CLIENT_ACTIVITY = "client_activity"
    FINANCIAL = "financial"
    TIME_TRACKING = "time_tracking"
    PERFORMANCE = "performance"
    COMPLIANCE = "compliance"

class ReportFormat(str, enum.Enum):
    PDF = "pdf"
    CSV = "csv"
    XLSX = "xlsx"
    HTML = "html"