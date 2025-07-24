import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings configuration"""
    
    # API Configuration
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # Application Configuration
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # AI Service Configuration
    default_ai_provider: str = "openai"
    ai_max_tokens: int = 200
    ai_temperature: float = 0.3
    
    # Data Configuration
    dataset_path: str = "./data/dataset_final.csv"
    model_path: str = "./data/models/"
    scaler_path: str = "./data/scalers/"
    
    # Base directories
    base_dir: Path = Path(__file__).parent.parent
    data_dir: Path = base_dir / "data"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure directories exist
        self.data_dir.mkdir(exist_ok=True)
        (self.data_dir / "models").mkdir(exist_ok=True)
        (self.data_dir / "scalers").mkdir(exist_ok=True)

# Global settings instance
settings = Settings()