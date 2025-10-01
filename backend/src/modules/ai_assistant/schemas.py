from pydantic import BaseModel
from typing import Dict, Any

class DocumentAnalysisRequest(BaseModel):
    document_text: str
    context: Dict[str, Any]

class DocumentAnalysisResponse(BaseModel):
    analysis: str
    recommendations: Dict[str, Any]

class LegalTextRequest(BaseModel):
    template_type: str
    parameters: Dict[str, Any]

class LegalTextResponse(BaseModel):
    generated_text: str