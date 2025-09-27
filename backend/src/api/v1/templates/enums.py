import enum

class TemplateType(str, enum.Enum):
    CONTRACT = "contract"
    LETTER = "letter"
    EMAIL = "email"
    INVOICE = "invoice"
    REPORT = "report"
    NOTICE = "notice"
    OTHER = "other"

class TemplateCategory(str, enum.Enum):
    LEGAL = "legal"
    BUSINESS = "business"
    PERSONAL = "personal"
    ADMINISTRATIVE = "administrative"