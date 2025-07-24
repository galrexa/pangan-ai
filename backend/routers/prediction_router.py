from fastapi import APIRouter, HTTPException, Query
from services.prediction_service import PredictionService
from utils.validators import PredictionRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize prediction service (singleton pattern)
prediction_service = PredictionService()

@router.post("/")
async def generate_prediction(request: PredictionRequest):
    """
    Generate price prediction for specific commodity and region
    
    Request body:
    - commodity: Commodity name (e.g., "Cabai Rawit Merah")
    - region: Region name (e.g., "Kota Bandung") 
    - days_ahead: Number of days to predict (1-30, default: 7)
    """
    try:
        result = prediction_service.generate_prediction(
            commodity=request.commodity,
            region=request.region,
            days_ahead=request.days_ahead
        )
        
        if not result.get('success', False):
            raise HTTPException(status_code=400, detail=result.get('error', 'Prediction failed'))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/batch")
async def batch_predict_all(
    days_ahead: int = Query(7, ge=1, le=30, description="Number of days to predict")
):
    """Generate predictions for all available commodity-region pairs"""
    try:
        result = prediction_service.batch_predict_all_commodities(days_ahead)
        
        if not result.get('success', False):
            raise HTTPException(status_code=500, detail=result.get('error', 'Batch prediction failed'))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def prediction_health_check():
    """Health check for prediction service and model status"""
    try:
        health = prediction_service.get_prediction_health_check()
        
        # Determine HTTP status based on health
        if health.get('service_status') == 'error':
            raise HTTPException(status_code=503, detail=health)
        elif health.get('service_status') == 'degraded':
            # Return 200 but indicate degraded service
            health['warning'] = 'Service running in degraded mode'
        
        return health
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quick/{commodity}/{region}")
async def quick_prediction(
    commodity: str,
    region: str,
    days_ahead: int = Query(7, ge=1, le=30, description="Number of days to predict")
):
    """Quick prediction endpoint for specific commodity-region pair"""
    try:
        # Validate inputs first
        from utils.validators import validate_commodity_region_pair
        
        if not validate_commodity_region_pair(commodity, region):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid commodity-region pair: {commodity} - {region}"
            )
        
        result = prediction_service.generate_prediction(commodity, region, days_ahead)
        
        if not result.get('success', False):
            raise HTTPException(status_code=400, detail=result.get('error', 'Prediction failed'))
        
        # Return simplified response for quick access
        simplified_result = {
            'success': True,
            'commodity': commodity,
            'region': region,
            'current_price': result.get('current_price'),
            'predictions': result.get('predictions'),
            'prediction_dates': result.get('prediction_dates'),
            'trend_direction': result.get('trend_analysis', {}).get('direction'),
            'total_change_pct': result.get('trend_analysis', {}).get('total_change_pct'),
            'risk_level': result.get('risk_assessment', {}).get('risk_level'),
            'confidence': result.get('confidence'),
            'summary': result.get('summary', {}).get('summary_text')
        }
        
        return simplified_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in quick prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-info")
async def get_model_info():
    """Get information about the loaded LSTM model"""
    try:
        model_info = prediction_service.lstm_predictor.get_model_info()
        
        return {
            "success": True,
            "model_info": model_info,
            "service_ready": prediction_service.data_service.data_loaded
        }
        
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))