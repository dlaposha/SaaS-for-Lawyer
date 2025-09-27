from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import logging
from typing import Callable

logger = logging.getLogger(__name__)

class TimingMiddleware(BaseHTTPMiddleware):
    """Middleware для вимірювання часу виконання запитів"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        logger.info(f"{request.method} {request.url.path} - {process_time:.3f}s")
        
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware для логування запитів"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Логування вхідного запиту
        logger.info(f"Incoming request: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        # Логування відповіді
        logger.info(f"Response: {response.status_code} for {request.method} {request.url.path}")
        
        return response

class CORSMiddleware(BaseHTTPMiddleware):
    """Custom CORS Middleware"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Додавання CORS заголовків
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        
        return response