# backend/src/modules/documents/service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from minio import Minio
from minio.error import S3Error
import uuid
import os

from ...core.config import settings
from ...core.database import BaseRepository
from .models import Document
from .schemas import DocumentCreate, DocumentUpdate

class DocumentService:
    """Сервіс для роботи з документами"""
    
    def __init__(self, repository: BaseRepository):
        self.repository = repository
        self.minio_client = Minio(
            settings.MINIO_ENDPOINT.replace('http://', '').replace('https://', ''),
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
    
    def upload_document(self, db: Session, file, case_id: int, user_id: int):
        """Завантаження документа"""
        try:
            # Генерація унікального імені файлу
            file_extension = os.path.splitext(file.filename)[1]
            file_name = f"{uuid.uuid4()}{file_extension}"
            
            # Завантаження в MinIO
            file_size = len(file.file.read())
            file.file.seek(0)  # Reset file pointer
            
            self.minio_client.put_object(
                settings.MINIO_BUCKET,
                file_name,
                file.file,
                file_size,
                file.content_type
            )
            
            # Створення запису в БД
            document_data = DocumentCreate(
                case_id=case_id,
                uploaded_by=user_id,
                file_name=file_name,
                original_name=file.filename,
                file_size=file_size,
                mime_type=file.content_type
            )
            
            return self.repository.create(db, document_data)
            
        except S3Error as e:
            raise Exception(f"Error uploading document: {e}")
    
    def get_document_url(self, document: Document, expires: int = 3600) -> str:
        """Отримання URL для доступу до документа"""
        try:
            return self.minio_client.presigned_get_object(
                settings.MINIO_BUCKET,
                document.file_name,
                expires=timedelta(seconds=expires)
            )
        except S3Error as e:
            raise Exception(f"Error generating document URL: {e}")