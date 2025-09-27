from fastapi import Request
import logging
import time

logger = logging.getLogger(__name__)

def add_logging_middleware(app):
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        
        logger.info(f"Request started: {request.method} {request.url}")
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        logger.info(f"Request completed: {request.method} {request.url} - Status: {response.status_code} - Time: {process_time:.2f}ms")
        
        return response