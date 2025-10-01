from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from src.core.database import get_db
from src.core.security import get_current_user
from src.modules.auth.models import User
from .service import AIAssistantService
from . import schemas

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

@router.post("/analyze-document", response_model=schemas.DocumentAnalysisResponse)
async def analyze_document(
    payload: schemas.DocumentAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIAssistantService(db)
    result = await service.analyze_document(payload.document_text, payload.context)
    return result

@router.post("/generate-legal-text", response_model=schemas.LegalTextResponse)
async def generate_legal_text(
    payload: schemas.LegalTextRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AIAssistantService(db)
    text = await service.generate_legal_text(payload.template_type, payload.parameters)
    return {"generated_text": text}