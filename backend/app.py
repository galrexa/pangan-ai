from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from utils.error_handlers import (
    validation_exception_handler,
    http_exception_handler, 
    general_exception_handler
)
import sys
import os
from pathlib import Path
from typing import Optional
from datetime import datetime

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

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

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

# Tambahkan ini setelah @app.get("/health") di app.py

@app.get("/api/data/historical")
async def get_historical_data_force(
    komoditas: str = "all",
    wilayah: str = "all", 
    level_harga: str = "all",
    start_date: str = None,
    end_date: str = None,
    include_weather: bool = True,
    include_events: bool = True
):
    """Historical data endpoint - force registered with debug"""
    logger.info(f"🔍 Historical data requested: komoditas='{komoditas}', wilayah='{wilayah}'")
    
    try:
        if data_service:
            logger.info(f"📊 DataService status: data_loaded={data_service.data_loaded}")
            
            if data_service.data_loaded:
                # Debug available data
                available_commodities = data_service.get_available_commodities()
                available_regions = data_service.get_available_regions()
                
                logger.info(f"📦 Available commodities: {available_commodities}")
                logger.info(f"🌍 Available regions: {available_regions}")
                
                # Check case sensitivity
                komoditas_normalized = komoditas.title() if komoditas != "all" else "all"
                logger.info(f"🔤 Normalized komoditas: '{komoditas}' -> '{komoditas_normalized}'")
                
                # Convert string dates to date objects if provided
                start_dt = None
                end_dt = None
                
                if start_date:
                    try:
                        start_dt = datetime.fromisoformat(start_date).date()
                        logger.info(f"📅 Start date: {start_dt}")
                    except Exception as e:
                        logger.error(f"❌ Invalid start_date: {e}")
                        
                if end_date:
                    try:
                        end_dt = datetime.fromisoformat(end_date).date()
                        logger.info(f"📅 End date: {end_dt}")
                    except Exception as e:
                        logger.error(f"❌ Invalid end_date: {e}")
                
                # Try with original komoditas first
                result = data_service.get_historical_data(
                    commodity=None if komoditas == "all" else komoditas,
                    region=None if wilayah == "all" else wilayah,
                    start_date=start_dt,
                    end_date=end_dt,
                    limit=1000
                )
                
                logger.info(f"📈 DataService result success: {result.get('success', False)}")
                logger.info(f"📊 Records returned: {len(result.get('data', []))}")
                
                if result.get('success', False) and len(result.get('data', [])) > 0:
                    # Process successful data
                    processed_data = []
                    raw_data = result.get('data', [])
                    
                    for item in raw_data:
                        data_item = {
                            "tanggal": item['tanggal'],
                            "komoditas": item['komoditas'],
                            "wilayah": item['wilayah'],
                            "level_harga": level_harga if level_harga != "all" else "Konsumen", 
                            "harga": item['harga']
                        }
                        
                        if include_weather:
                            data_item["cuaca"] = {
                                "suhu_rata": item.get('tavg', 26.5),
                                "kelembaban": item.get('rh_avg', 75),
                                "curah_hujan": item.get('curah_hujan', 0),
                                "kecepatan_angin": item.get('ff_avg', 3)
                            }
                        
                        if include_events:
                            events = []
                            if item.get('ramadan', False):
                                events.append("ramadan")
                            if item.get('idul_fitri', False):
                                events.append("idul_fitri")
                            if item.get('natal_newyear', False):
                                events.append("natal_tahun_baru")
                            if not events:
                                events.append("normal")
                            data_item["events"] = events
                        
                        processed_data.append(data_item)
                    
                    # Extract summary
                    metadata = result.get('metadata', {})
                    price_stats = metadata.get('price_stats', {})
                    
                    logger.info(f"✅ Returning REAL data: {len(processed_data)} records")
                    
                    return {
                        "success": True,
                        "data": processed_data,
                        "filters_applied": {
                            "komoditas": komoditas,
                            "wilayah": wilayah,
                            "level_harga": level_harga,
                            "start_date": start_date,
                            "end_date": end_date,
                            "include_weather": include_weather,
                            "include_events": include_events
                        },
                        "summary": {
                            "total_records": len(processed_data),
                            "date_range": f"{metadata.get('date_range', {}).get('start', '')} to {metadata.get('date_range', {}).get('end', '')}",
                            "avg_price": price_stats.get('avg', 0),
                            "min_price": price_stats.get('min', 0),
                            "max_price": price_stats.get('max', 0),
                            "current_price": price_stats.get('current', 0)
                        },
                        "data_source": "DataService_Real",
                        "debug_info": {
                            "available_commodities": available_commodities,
                            "available_regions": available_regions,
                            "query_komoditas": komoditas,
                            "normalized_komoditas": komoditas_normalized
                        }
                    }
                else:
                    logger.warning(f"⚠️ DataService returned no data or failed")
                    # Try with normalized komoditas
                    if komoditas != "all" and komoditas_normalized != komoditas:
                        logger.info(f"🔄 Retrying with normalized komoditas: {komoditas_normalized}")
                        result2 = data_service.get_historical_data(
                            commodity=komoditas_normalized,
                            region=None if wilayah == "all" else wilayah,
                            start_date=start_dt,
                            end_date=end_dt,
                            limit=1000
                        )
                        if result2.get('success', False) and len(result2.get('data', [])) > 0:
                            logger.info(f"✅ Success with normalized komoditas!")
                            # Process result2 same as above...
            else:
                logger.error("❌ DataService data not loaded")
        else:
            logger.error("❌ DataService not available")
    
    except Exception as e:
        logger.error(f"🔥 Exception in DataService: {str(e)}")
        import traceback
        logger.error(f"🔥 Traceback: {traceback.format_exc()}")
    
    # Fallback mock data
    logger.info("🔄 Returning MOCK data")
    return {
        "success": True,
        "data": [
            {
                "tanggal": "2025-06-01",
                "komoditas": komoditas if komoditas != "all" else "Cabai Rawit Merah",
                "wilayah": wilayah if wilayah != "all" else "Kota Bandung", 
                "level_harga": level_harga if level_harga != "all" else "Konsumen",
                "harga": 65000,
                "cuaca": {
                    "suhu_rata": 26.5,
                    "kelembaban": 75,
                    "curah_hujan": 0
                } if include_weather else None,
                "events": ["normal"] if include_events else None
            }
        ],
        "filters_applied": {
            "komoditas": komoditas,
            "wilayah": wilayah,
            "level_harga": level_harga,
            "include_weather": include_weather,
            "include_events": include_events
        },
        "summary": {
            "total_records": 1,
            "avg_price": 65000
        },
        "data_source": "Mock_Fallback",
        "debug_info": {
            "reason": "DataService failed or returned no data"
        }
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