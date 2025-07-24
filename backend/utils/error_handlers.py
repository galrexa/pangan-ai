from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
import traceback
from typing import Union

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom API Error class"""
    def __init__(self, message: str, status_code: int = 500, error_code: str = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(message)

def format_error_response(error: Union[str, Exception], status_code: int = 500, error_code: str = None):
    """Format consistent error response"""
    return {
        "success": False,
        "error": {
            "message": str(error),
            "code": error_code or "INTERNAL_ERROR",
            "status_code": status_code
        },
        "data": None
    }

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content=format_error_response(
            error="Invalid input data",
            status_code=422,
            error_code="VALIDATION_ERROR"
        )
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP error {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            error=exc.detail,
            status_code=exc.status_code,
            error_code="HTTP_ERROR"
        )
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content=format_error_response(
            error="Internal server error",
            status_code=500,
            error_code="INTERNAL_ERROR"
        )
    )