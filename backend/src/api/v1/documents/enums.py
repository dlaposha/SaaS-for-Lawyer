import enum

class DocumentType(str, enum.Enum):
    CONTRACT = "contract"
    AGREEMENT = "agreement"
    LETTER = "letter"
    EMAIL = "email"
    REPORT = "report"
    INVOICE = "invoice"
    RECEIPT = "receipt"
    OTHER = "other"

class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    FINAL = "final"
    SIGNED = "signed"
    ARCHIVED = "archived"
    DELETED = "deleted"