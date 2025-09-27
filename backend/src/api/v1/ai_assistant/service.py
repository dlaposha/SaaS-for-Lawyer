from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import logging
from openai import AsyncOpenAI
import json

from src.core.config import settings
from src.core.exceptions import DatabaseException

logger = logging.getLogger(__name__)

class AIAssistantService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def analyze_document(self, document_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Аналіз юридичного документа за допомогою AI"""
        try:
            prompt = f"""
            Аналізуй цей юридичний документ як досвідчений адвокат:
            
            Контекст: {json.dumps(context, ensure_ascii=False)}
            
            Документ: {document_text}
            
            Проаналізуй та надай:
            1. Ключові правові питання
            2. Потенційні ризики
            3. Рекомендації
            4. Подібні прецеденти
            5. Терміни та дедлайни
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000
            )
            
            return {
                "analysis": response.choices[0].message.content,
                "recommendations": await self._extract_recommendations(response.choices[0].message.content)
            }
            
        except Exception as e:
            logger.error(f"AI analysis error: {e}")
            raise DatabaseException("Failed to analyze document with AI")
    
    async def generate_legal_text(self, template_type: str, parameters: Dict[str, Any]) -> str:
        """Генерація юридичного тексту"""
        try:
            prompt = f"""
            Згенеруй юридичний документ типу {template_type} з наступними параметрами:
            
            {json.dumps(parameters, ensure_ascii=False)}
            
            Використовуй українську юридичну термінологію та формальний стиль.
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"AI text generation error: {e}")
            raise DatabaseException("Failed to generate legal text")
    
    async def predict_case_outcome(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Прогнозування результату справи"""
        # Implementation using machine learning or AI
        pass