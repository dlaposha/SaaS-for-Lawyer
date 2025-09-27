from enum import Enum

class CaseStage(str, Enum):
    """Стадії справи"""
    CONSULTATION = "consultation"
    PRE_LITIGATION = "pre_litigation"
    LITIGATION = "litigation"
    SETTLEMENT = "settlement"
    APPEAL = "appeal"
    COMPLETED = "completed"

class CaseStatus(str, Enum):
    """Статуси справи"""
    OPEN = "open"
    ON_HOLD = "on_hold"
    CLOSED = "closed"
    ARCHIVED = "archived"

class UserRole(str, Enum):
    """Ролі користувачів"""
    ADMIN = "admin"
    LAWYER = "lawyer"
    ASSISTANT = "assistant"
    PARALEGAL = "paralegal"
    ACCOUNTANT = "accountant"
    VIEWER = "viewer"

class DocumentType(str, Enum):
    """Типи документів"""
    CONTRACT = "contract"
    COURT_DOCUMENT = "court_document"
    EVIDENCE = "evidence"
    CORRESPONDENCE = "correspondence"
    REPORT = "report"
    TEMPLATE = "template"

class NotificationType(str, Enum):
    """Типи сповіщень"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

class Priority(str, Enum):
    """Пріоритети"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Константи для пагінації
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Константи для файлів
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_FILE_TYPES = [
    "pdf", "doc", "docx", "xls", "xlsx", 
    "ppt", "pptx", "txt", "jpg", "jpeg", "png"
]

# Константи для безпеки
PASSWORD_MIN_LENGTH = 8
SESSION_TIMEOUT = 3600  # 1 година

# Константи для API
API_VERSION = "1.0.0"
API_DESCRIPTION = "Lawyer CRM API - Система управління юридичною практикою"