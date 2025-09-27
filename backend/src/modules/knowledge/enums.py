import enum

class KnowledgeCategory(str, enum.Enum):
    LAW = "law"
    PROCEDURE = "procedure"
    TEMPLATE = "template"
    FAQ = "faq"
    BEST_PRACTICE = "best_practice"
    REGULATION = "regulation"

class KnowledgeStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    DELETED = "deleted"