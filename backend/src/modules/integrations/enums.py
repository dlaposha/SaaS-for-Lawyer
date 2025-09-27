import enum

class IntegrationType(str, enum.Enum):
    CRM = "crm"
    EMAIL = "email"
    CALENDAR = "calendar"
    DOCUMENT_MANAGEMENT = "document_management"
    PAYMENT_PROCESSOR = "payment_processor"
    COMMUNICATION = "communication"
    ANALYTICS = "analytics"

class IntegrationStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    DISABLED = "disabled"