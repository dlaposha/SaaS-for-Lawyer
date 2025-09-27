from fastapi import HTTPException, status

class LawyerCRMException(HTTPException):
    """Базовий клас винятків для Lawyer CRM"""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class NotFoundException(LawyerCRMException):
    """Виняток для ресурсів, які не знайдено"""
    
    def __init__(self, resource: str = "Resource"):
        super().__init__(detail=f"{resource} not found", status_code=status.HTTP_404_NOT_FOUND)

class UnauthorizedException(LawyerCRMException):
    """Виняток для неавторизованого доступу"""
    
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class ForbiddenException(LawyerCRMException):
    """Виняток для забороненого доступу"""
    
    def __init__(self, detail: str = "Access forbidden"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)

class ValidationException(LawyerCRMException):
    """Виняток для помилок валідації"""
    
    def __init__(self, detail: str = "Validation error"):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class DatabaseException(LawyerCRMException):
    """Виняток для помилок бази даних"""
    
    def __init__(self, detail: str = "Database error"):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExternalServiceException(LawyerCRMException):
    """Виняток для помилок зовнішніх сервісів"""
    
    def __init__(self, detail: str = "External service error"):
        super().__init__(detail=detail, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)