from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import logging
import aiohttp
import xml.etree.ElementTree as ET

from src.core.config import settings
from src.core.exceptions import DatabaseException

logger = logging.getLogger(__name__)

class CourtIntegrationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.session = aiohttp.ClientSession()
    
    async def check_case_status(self, case_number: str) -> Dict[str, Any]:
        """Перевірити статус справи в судовій системі"""
        try:
            # Інтеграція з ЄДРС (Єдиний державний реєстр судових рішень)
            async with self.session.get(
                f"{settings.COURT_API_URL}/cases/{case_number}",
                headers={"Authorization": f"Bearer {settings.COURT_API_KEY}"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_court_response(data)
                else:
                    raise DatabaseException("Failed to fetch case status from court system")
                    
        except Exception as e:
            logger.error(f"Court integration error: {e}")
            raise DatabaseException("Failed to integrate with court system")
    
    async def submit_document(self, document_data: Dict[str, Any]) -> str:
        """Подати документ до суду електронно"""
        try:
            # Підготовка XML для ЕСВ (Електронна система взаємодії)
            xml_data = self._prepare_court_xml(document_data)
            
            async with self.session.post(
                f"{settings.COURT_API_URL}/documents",
                data=xml_data,
                headers={
                    "Content-Type": "application/xml",
                    "Authorization": f"Bearer {settings.COURT_API_KEY}"
                }
            ) as response:
                if response.status == 201:
                    result = await response.text()
                    return self._parse_submission_response(result)
                else:
                    raise DatabaseException("Failed to submit document to court")
                    
        except Exception as e:
            logger.error(f"Court submission error: {e}")
            raise DatabaseException("Failed to submit document to court")