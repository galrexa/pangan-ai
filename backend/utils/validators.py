from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime, date

class PredictionRequest(BaseModel):
    """Validation model for prediction requests"""
    
    commodity: str = Field(..., description="Commodity name")
    region: str = Field(..., description="Region name")
    days_ahead: Optional[int] = Field(default=7, ge=1, le=30, description="Number of days to predict")
    
    @validator('commodity')
    def validate_commodity(cls, v):
        # Sesuai dengan komoditas di dataset existing
        valid_commodities = [
            'Cabai Rawit Merah',
            'Cabai Merah Keriting', 
            'Bawang Merah'
        ]
        if v not in valid_commodities:
            raise ValueError(f'Commodity must be one of: {valid_commodities}')
        return v
    
    @validator('region')
    def validate_region(cls, v):
        # Sesuai dengan wilayah di dataset existing
        valid_regions = [
            'Kota Bandung', 'Kota Depok', 'Kota Bekasi',
            'Kabupaten Garut', 'Kabupaten Bandung', 'Kabupaten Bogor',
            'Kabupaten Cianjur', 'Kabupaten Majalengka', 'Kabupaten Cirebon'
        ]
        if v not in valid_regions:
            raise ValueError(f'Region must be one of: {valid_regions}')
        return v

class HistoricalDataRequest(BaseModel):
    """Validation model for historical data requests"""
    
    commodity: Optional[str] = Field(default="all", description="Commodity name or 'all'")
    region: Optional[str] = Field(default="all", description="Region name or 'all'")
    start_date: Optional[date] = Field(default=None, description="Start date (YYYY-MM-DD)")
    end_date: Optional[date] = Field(default=None, description="End date (YYYY-MM-DD)")
    limit: Optional[int] = Field(default=1000, ge=1, le=10000, description="Maximum number of records")
    
    @validator('start_date', 'end_date')
    def validate_dates(cls, v):
        if v and v > date.today():
            raise ValueError('Date cannot be in the future')
        return v
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v < values['start_date']:
                raise ValueError('End date must be after start date')
        return v

class ChatRequest(BaseModel):
    """Validation model for AI chat requests"""
    
    message: str = Field(..., min_length=1, max_length=500, description="User message")
    context: Optional[dict] = Field(default=None, description="Additional context for AI")
    conversation_id: Optional[str] = Field(default=None, description="Conversation ID")
    
    @validator('message')
    def validate_message(cls, v):
        # Basic content filtering
        forbidden_words = ['hack', 'exploit', 'attack']
        if any(word in v.lower() for word in forbidden_words):
            raise ValueError('Message contains inappropriate content')
        return v.strip()

class AIInsightRequest(BaseModel):
    """Validation model for AI insight generation"""
    
    predictions: List[float] = Field(..., description="Price predictions")
    commodity: str = Field(..., description="Commodity name")
    region: str = Field(..., description="Region name")
    current_price: float = Field(..., gt=0, description="Current price")
    historical_stats: Optional[dict] = Field(default=None, description="Historical statistics")
    
    @validator('predictions')
    def validate_predictions(cls, v):
        if len(v) == 0:
            raise ValueError('Predictions list cannot be empty')
        if len(v) > 30:
            raise ValueError('Too many predictions (max 30)')
        if any(p <= 0 for p in v):
            raise ValueError('All predictions must be positive')
        return v

def validate_commodity_region_pair(commodity: str, region: str) -> bool:
    """Validate if commodity-region pair is supported"""
    
    valid_commodities = [
        'cabai merah keriting',
        'cabai rawit merah', 
        'bawang merah'
    ]
    
    valid_regions = [
        'kota bandung', 'kota depok', 'kota bekasi',
        'kabupaten garut', 'kabupaten bandung', 
        'kabupaten cianjur', 'kabupaten majalengka'
    ]
    
    return (commodity.lower() in [c.lower() for c in valid_commodities] and 
            region.lower() in [r.lower() for r in valid_regions])

def sanitize_input(text: str) -> str:
    """Sanitize text input untuk security"""
    
    # Remove potential harmful characters
    harmful_chars = ['<', '>', '&', '"', "'", '\\', '/', '`']
    for char in harmful_chars:
        text = text.replace(char, '')
    
    # Limit length
    text = text[:500]
    
    return text.strip()