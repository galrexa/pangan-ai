# backend/utils/validators.py - Enhanced Validation with Phase 5.1 improvements, updated for Pydantic v2
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Union, Dict, Any
from datetime import datetime, date
from enum import Enum
import re
import logging

logger = logging.getLogger(__name__)

# ==================== ENUMS ====================

class PriceLevelEnum(str, Enum):
    KONSUMEN = "Konsumen"
    PEDAGANG_BESAR = "Pedagang Besar"
    PEDAGANG_ECERAN = "Pedagang Eceran"
    PRODUSEN = "Produsen"

class PredictionTypeEnum(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

# ==================== VALIDATION UTILITIES ====================

def normalize_text(text: str) -> str:
    """Normalize text input"""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text.strip()).title()

def validate_commodity_name(name: str) -> str:
    """Validate and normalize commodity name"""
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Nama komoditas harus berupa teks yang tidak kosong")
    normalized = normalize_text(name)
    if len(normalized) < 2:
        raise ValueError("Nama komoditas harus minimal 2 karakter")
    if len(normalized) > 100:
        raise ValueError("Nama komoditas terlalu panjang (maksimal 100 karakter)")
    if not re.match(r'^[A-Za-z\s\-.]+$', normalized):
        raise ValueError("Nama komoditas hanya boleh mengandung huruf, spasi, tanda hubung, dan titik")
    return normalized

def validate_region_name(name: str) -> str:
    """Validate and normalize region name"""
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Nama wilayah harus berupa teks yang tidak kosong")
    normalized = normalize_text(name)
    if len(normalized) < 3:
        raise ValueError("Nama wilayah harus minimal 3 karakter")
    if len(normalized) > 100:
        raise ValueError("Nama wilayah terlalu panjang (maksimal 100 karakter)")
    if not re.match(r'^[A-Za-z0-9\s\-,\.]+$', normalized):
        raise ValueError("Nama wilayah mengandung karakter yang tidak valid")
    return normalized

def validate_price_value(price: Union[int, float]) -> float:
    """Validate price value"""
    try:
        price_float = float(price)
    except (TypeError, ValueError):
        raise ValueError("Harga harus berupa angka")
    if price_float < 0:
        raise ValueError("Harga tidak boleh negatif")
    if price_float > 1_000_000_000:
        raise ValueError("Harga terlalu besar")
    return round(price_float, 2)

def validate_date_range_util(start_date: Optional[date], end_date: Optional[date]) -> tuple[Optional[date], Optional[date]]:
    """Validate date range limits and ordering"""
    if start_date and end_date:
        if start_date > end_date:
            raise ValueError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir")
        diff = (end_date - start_date).days
        if diff > 3650:
            raise ValueError("Rentang tanggal terlalu besar (maksimal 10 tahun)")
        today = date.today()
        if start_date > today:
            raise ValueError("Tanggal mulai tidak boleh di masa depan")
    return start_date, end_date

# ==================== BASE MODELS ====================

class BaseResponse(BaseModel):
    """Base response model"""
    success: bool = True
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    model_config = {
        "json_encoders": {datetime: lambda v: v.isoformat()}
    }

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)
    model_config = {
        "json_encoders": {datetime: lambda v: v.isoformat()}
    }

# ==================== REQUEST MODELS ====================

class HistoricalDataRequest(BaseModel):
    """Validation model for historical data requests"""
    commodity: Optional[str] = Field("all", description="Commodity name or 'all'")
    region: Optional[str] = Field("all", description="Region name or 'all'")
    start_date: Optional[date] = Field(None, description="Start date (YYYY-MM-DD)")
    end_date: Optional[date] = Field(None, description="End date (YYYY-MM-DD)")
    limit: Optional[int] = Field(1000, ge=1, le=10000, description="Maximum number of records")

    @field_validator('start_date', 'end_date')
    @classmethod
    def _validate_dates(cls, v):
        if v and v > date.today():
            raise ValueError("Date cannot be in the future")
        return v

    @model_validator(mode='after')
    def _validate_date_range(self):
        validate_date_range_util(self.start_date, self.end_date)
        return self

class PredictionRequest(BaseModel):
    """Prediction request validation"""
    commodity: str = Field(..., min_length=2, max_length=100, description="Nama komoditas")
    region: str = Field(..., min_length=3, max_length=100, description="Nama wilayah")
    level_harga: PriceLevelEnum = Field(PriceLevelEnum.KONSUMEN, description="Level harga")
    days_ahead: int = Field(7, ge=1, le=30, description="Jumlah hari prediksi")
    prediction_type: PredictionTypeEnum = Field(PredictionTypeEnum.DAILY, description="Tipe prediksi")
    include_confidence: bool = Field(True, description="Sertakan confidence interval")
    include_factors: bool = Field(True, description="Sertakan faktor prediksi")

    @field_validator('commodity')
    @classmethod
    def _validate_commodity(cls, v):
        return validate_commodity_name(v)

    @field_validator('region')
    @classmethod
    def _validate_region(cls, v):
        return validate_region_name(v)

class AIInsightRequest(BaseModel):
    """Validation model for AI insight generation"""
    predictions: List[float] = Field(..., description="Price predictions")
    commodity: str = Field(..., description="Commodity name")
    region: str = Field(..., description="Region name")
    current_price: float = Field(..., gt=0, description="Current price")
    historical_stats: Optional[Dict[str, Any]] = Field(None, description="Historical statistics")

    @field_validator('predictions')
    @classmethod
    def _validate_predictions(cls, v):
        if not v:
            raise ValueError("Predictions list cannot be empty")
        if len(v) > 30:
            raise ValueError("Too many predictions (max 30)")
        if any(p <= 0 for p in v):
            raise ValueError("All predictions must be positive")
        return v

class ChatRequest(BaseModel):
    """Validation model for AI chat requests"""
    message: str = Field(..., min_length=1, max_length=500, description="User message")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context for AI")
    conversation_id: Optional[str] = Field(None, description="Conversation ID")

    @field_validator('message')
    @classmethod
    def _validate_message(cls, v):
        forbidden = ['hack', 'exploit', 'attack']
        if any(word in v.lower() for word in forbidden):
            raise ValueError("Message contains inappropriate content")
        return v.strip()

# ==================== RESPONSE MODELS ====================

class HistoricalDataResponse(BaseResponse):
    data: List[Dict[str, Any]]
    total_records: int
    filters_applied: Dict[str, Any]
    stats: Optional[Dict[str, Any]] = None

class PredictionResponse(BaseResponse):
    commodity: str
    region: str
    current_price: float
    predictions: List[Dict[str, Any]]
    confidence_metrics: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None

class AIInsightResponse(BaseResponse):
    insights: str
    recommendations: List[str]
    risk_assessment: Dict[str, Any]
    confidence_score: float = Field(..., ge=0, le=1)

class ChatResponse(BaseResponse):
    response: str
    conversation_id: str
    context_used: bool = Field(False, description="Whether context was used")
    tokens_used: Optional[int] = None

class BatchPredictionRequest(BaseModel):
    """Batch prediction request"""
    requests: List[PredictionRequest] = Field(..., description="Batch of prediction requests", max_items=50)
    parallel_processing: bool = Field(True, description="Parallel processing flag")

    @field_validator('requests')
    @classmethod
    def _validate_requests(cls, v):
        if len(v) == 0:
            raise ValueError("Minimal harus ada 1 request")
        if len(v) > 50:
            raise ValueError("Maksimal 50 request per batch")
        return v

# ==================== UTILITY FUNCTIONS ====================

def validate_request_data(data: Dict[str, Any], model_class: BaseModel) -> BaseModel:
    """Validate request data against a Pydantic model"""
    try:
        return model_class(**data)
    except Exception as e:
        logger.error(f"Validation error for {model_class.__name__}: {e}")
        raise ValueError(f"Data tidak valid: {e}")

def sanitize_input(data: Union[str, Dict[Any, Any], List[Any]]) -> Union[str, Dict[Any, Any], List[Any]]:
    """Sanitize input data to prevent XSS and remove whitespace"""
    if isinstance(data, str):
        cleaned = re.sub(r'<[^>]*>', '', data)
        return re.sub(r'\s+', ' ', cleaned.strip())
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    if isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data

def create_error_response(message: str, error_code: str = "VALIDATION_ERROR", status_code: int = 400) -> ErrorResponse:
    """Create a standardized error response object"""
    return ErrorResponse(error={"message": message, "code": error_code, "status_code": status_code})

# ==================== CUSTOM EXCEPTIONS ====================

class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message: str, field: Optional[str] = None, code: str = "VALIDATION_ERROR"):
        self.message = message
        self.field = field
        self.code = code
        super().__init__(message)

class BusinessLogicError(Exception):
    """Business logic validation error"""
    def __init__(self, message: str, code: str = "BUSINESS_LOGIC_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)

# ==================== DECORATORS ====================

def validate_input(model_class: BaseModel):
    """Decorator for function input validation"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            if len(args) > 1:
                try:
                    validated = model_class(**args[1])
                    args = (args[0], validated) + args[2:]
                except Exception as e:
                    raise ValidationError(f"Input validation failed: {e}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

__all__ = [
    'PriceLevelEnum', 'PredictionTypeEnum',
    'normalize_text', 'validate_commodity_name', 'validate_region_name',
    'validate_price_value', 'validate_date_range_util',
    'BaseResponse', 'ErrorResponse',
    'HistoricalDataRequest', 'PredictionRequest',
    'AIInsightRequest', 'ChatRequest',
    'HistoricalDataResponse', 'PredictionResponse',
    'AIInsightResponse', 'ChatResponse',
    'BatchPredictionRequest',
    'validate_request_data', 'sanitize_input', 'create_error_response',
    'ValidationError', 'BusinessLogicError', 'validate_input'
]
