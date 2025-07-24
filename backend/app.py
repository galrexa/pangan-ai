from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import os
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from config.settings import settings
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PANGAN-AI",
    description="Sistem Prediksi Harga Pangan Berbasis Deep Learning & AI Generatif",
    version="1.0.0",
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for services (initialized later)
data_service = None
prediction_service = None
ai_service = None

@app.on_event("startup")
async def startup_event():
    """Initialize application components on startup"""
    global data_service, prediction_service, ai_service
    
    logger.info("🚀 Starting PANGAN-AI Backend...")
    logger.info(f"📊 Debug mode: {settings.debug}")
    logger.info(f"📁 Data directory: {settings.data_dir}")
    
    # Test service initialization
    try:
        from services.data_service import DataService
        from services.prediction_service import PredictionService
        from services.ai_service import AIService
        
        # Initialize services
        data_service = DataService()
        prediction_service = PredictionService()
        ai_service = AIService()
        
        logger.info("✅ All services initialized successfully")
        
    except Exception as e:
        logger.error(f"⚠️ Service initialization warning: {str(e)}")
        logger.info("🔄 Running in fallback mode...")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("🛑 Shutting down PANGAN-AI Backend...")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "PANGAN-AI Backend API",
        "description": "Sistem Prediksi Harga Pangan Berbasis Deep Learning & AI Generatif",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "data": "/api/data/* - Historical data and statistics",
            "predictions": "/api/predict/* - Price predictions using LSTM", 
            "ai": "/api/ai/* - AI insights and chat interface",
            "health": "/health - Comprehensive health check",
            "docs": "/docs - Interactive API documentation"
        },
        "demo_flows": {
            "historical_analysis": "GET /api/data/historical?commodity=Cabai Rawit Merah",
            "price_prediction": "POST /api/predict/ with commodity and region",
            "ai_insights": "POST /api/ai/insights with prediction data",
            "natural_chat": "POST /api/ai/chat with user message"
        }
    }

@app.get("/health")
async def comprehensive_health_check():
    """Comprehensive health check for all system components"""
    try:
        health_status = {
            "status": "healthy",
            "service": "PANGAN-AI",
            "timestamp": "2025-07-24",
            "version": "1.0.0",
            "system_info": {
                "debug_mode": settings.debug,
                "data_path": str(settings.data_dir),
                "model_path": str(settings.model_path),
                "api_host": settings.api_host,
                "api_port": settings.api_port,
                "python_path": sys.path[:3]  # Show first 3 paths
            }
        }
        
        # Check services if available
        if data_service:
            health_status["components"] = {
                "data_service": {
                    "status": "healthy" if data_service.data_loaded else "degraded",
                    "data_loaded": data_service.data_loaded,
                    "commodities_count": len(data_service.get_available_commodities()),
                    "regions_count": len(data_service.get_available_regions())
                }
            }
        else:
            health_status["components"] = {
                "data_service": {"status": "not_loaded", "message": "Service not initialized"}
            }
            health_status["status"] = "degraded"
            health_status["warnings"] = ["Services not fully loaded"]
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2025-07-24",
            "service": "PANGAN-AI"
        }

# Fallback endpoints (always available)
@app.get("/api/data/commodities")
async def get_commodities_fallback():
    """Fallback commodities endpoint"""
    if data_service:
        try:
            commodities = data_service.get_available_commodities()
            return {
                "success": True,
                "commodities": commodities,
                "count": len(commodities)
            }
        except Exception as e:
            return {"error": str(e), "fallback": True}
    else:
        return {
            "success": True,
            "commodities": ["Cabai Rawit Merah", "Cabai Merah Keriting", "Bawang Merah"],
            "count": 3,
            "fallback": True,
            "message": "Using mock data - services not loaded"
        }

@app.get("/api/data/regions")
async def get_regions_fallback():
    """Fallback regions endpoint"""
    if data_service:
        try:
            regions = data_service.get_available_regions()
            return {
                "success": True,
                "regions": regions,
                "count": len(regions)
            }
        except Exception as e:
            return {"error": str(e), "fallback": True}
    else:
        return {
            "success": True,
            "regions": ["Kota Bandung", "Kota Depok", "Kota Bekasi", "Kabupaten Garut", "Kabupaten Bandung", "Kabupaten Bogor", "Kabupaten Cianjur", "Kabupaten Majalengka"],
            "count": 8,
            "fallback": True,
            "message": "Using mock data - services not loaded"
        }

@app.get("/api/predict/health")
async def prediction_health_fallback():
    """Fallback prediction health endpoint"""
    if prediction_service:
        try:
            return prediction_service.get_prediction_health_check()
        except Exception as e:
            return {"error": str(e), "fallback": True}
    else:
        return {
            "service_status": "degraded",
            "model_loaded": False,
            "data_loaded": False,
            "message": "Prediction service not loaded",
            "fallback": True
        }

@app.get("/api/ai/status")
async def ai_status_fallback():
    """Fallback AI status endpoint"""
    if ai_service:
        try:
            status = ai_service.get_ai_service_status()
            return {
                "success": True,
                "ai_status": status
            }
        except Exception as e:
            return {"error": str(e), "fallback": True}
    else:
        return {
            "success": True,
            "ai_status": {
                "openai_configured": bool(settings.openai_api_key),
                "anthropic_configured": bool(settings.anthropic_api_key),
                "status": "not_loaded"
            },
            "fallback": True,
            "message": "AI service not loaded"
        }

# Try to import and include routers (optional)
try:
    from routers import data_router, prediction_router, ai_router
    
    app.include_router(data_router.router, prefix="/api/data", tags=["data"])
    app.include_router(prediction_router.router, prefix="/api/predict", tags=["prediction"])
    app.include_router(ai_router.router, prefix="/api/ai", tags=["ai"])
    
    logger.info("✅ All API routers included successfully")
    
except ImportError as e:
    logger.warning(f"⚠️ Routers not available: {str(e)}")
    logger.info("🔄 Using fallback endpoints instead")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )