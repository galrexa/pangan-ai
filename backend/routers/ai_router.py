from fastapi import APIRouter, HTTPException
from services.ai_service import AIService
from utils.validators import ChatRequest, AIInsightRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize AI service (singleton pattern)
ai_service = AIService()

@router.post("/insights")
async def generate_insights(request: AIInsightRequest):
    """
    Generate AI insights from prediction data
    
    Request body:
    - predictions: List of predicted prices
    - commodity: Commodity name
    - region: Region name  
    - current_price: Current price
    - historical_stats: Optional historical statistics
    """
    try:
        # Prepare prediction data for AI analysis
        prediction_data = {
            'commodity': request.commodity,
            'region': request.region,
            'current_price': request.current_price,
            'predictions': request.predictions,
            'historical_stats': request.historical_stats or {},
            'trend_analysis': {
                'direction': 'INCREASING' if request.predictions[-1] > request.current_price else 'DECREASING',
                'total_change_pct': ((request.predictions[-1] - request.current_price) / request.current_price * 100),
            },
            'risk_assessment': {
                'risk_level': 'HIGH' if abs((request.predictions[-1] - request.current_price) / request.current_price * 100) > 20 else 'MEDIUM'
            }
        }
        
        result = ai_service.generate_prediction_insights(prediction_data)
        
        if not result.get('success', False):
            raise HTTPException(status_code=500, detail=result.get('error', 'Failed to generate insights'))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Natural language chat interface with AI
    
    Request body:
    - message: User message (1-500 characters)
    - context: Optional context information
    - conversation_id: Optional conversation ID for session management
    """
    try:
        result = ai_service.chat_with_ai(
            user_message=request.message,
            context=request.context
        )
        
        if not result.get('success', False):
            raise HTTPException(status_code=500, detail=result.get('error', 'AI chat failed'))
        
        # Add conversation metadata
        result['conversation_id'] = request.conversation_id
        result['message_length'] = len(request.message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_ai_status():
    """Get comprehensive AI service status"""
    try:
        status = ai_service.get_ai_service_status()
        
        return {
            "success": True,
            "ai_status": status,
            "available_features": {
                "prediction_insights": True,
                "natural_chat": True,
                "policy_recommendations": status.get('openai_configured', False)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting AI status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quick-insight")
async def quick_insight(
    commodity: str,
    current_price: float,
    predicted_price: float,
    days_ahead: int = 7
):
    """Quick insight generation for simple prediction data"""
    try:
        # Create simplified prediction data
        predictions = [current_price + (predicted_price - current_price) * (i + 1) / days_ahead 
                      for i in range(days_ahead)]
        
        prediction_data = {
            'commodity': commodity,
            'region': 'General',
            'current_price': current_price,
            'predictions': predictions,
            'trend_analysis': {
                'direction': 'INCREASING' if predicted_price > current_price else 'DECREASING',
                'total_change_pct': ((predicted_price - current_price) / current_price * 100),
            },
            'risk_assessment': {
                'risk_level': 'HIGH' if abs((predicted_price - current_price) / current_price * 100) > 20 else 'MEDIUM'
            }
        }
        
        result = ai_service.generate_prediction_insights(prediction_data)
        
        if not result.get('success', False):
            raise HTTPException(status_code=500, detail=result.get('error', 'Failed to generate quick insight'))
        
        return {
            'success': True,
            'insight': result.get('insights'),
            'input_data': {
                'commodity': commodity,
                'current_price': current_price,
                'predicted_price': predicted_price,
                'change_pct': ((predicted_price - current_price) / current_price * 100)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating quick insight: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sample-chat")
async def sample_chat_examples():
    """Get sample chat questions for demo purposes"""
    
    sample_questions = [
        {
            "question": "Bagaimana trend harga cabai rawit merah bulan ini?",
            "category": "trend_analysis",
            "description": "Analisis trend harga komoditas tertentu"
        },
        {
            "question": "Kapan waktu terbaik untuk intervensi harga bawang merah?",
            "category": "policy_timing",
            "description": "Rekomendasi timing intervensi kebijakan"
        },
        {
            "question": "Apa faktor utama yang mempengaruhi fluktuasi harga cabai?",
            "category": "factor_analysis", 
            "description": "Analisis faktor penyebab perubahan harga"
        },
        {
            "question": "Bagaimana dampak cuaca terhadap prediksi harga pangan?",
            "category": "weather_impact",
            "description": "Analisis pengaruh variabel cuaca"
        },
        {
            "question": "Berikan rekomendasi kebijakan untuk stabilisasi harga",
            "category": "policy_recommendation",
            "description": "Saran kebijakan berdasarkan prediksi"
        }
    ]
    
    return {
        "success": True,
        "sample_questions": sample_questions,
        "total_samples": len(sample_questions),
        "usage_tip": "Gunakan pertanyaan-pertanyaan ini sebagai contoh untuk testing chat interface"
    }