from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging
import numpy as np
from data.models.lstm_model import LSTMPredictor
from data.models.data_processor import DataProcessor
from services.data_service import DataService
from config.settings import settings

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Service class untuk handling prediction operations dalam PANGAN-AI
    Orchestrates LSTM model predictions dan analysis
    """
    
    def __init__(self):
        self.lstm_predictor = LSTMPredictor(settings.model_path, settings.scaler_path)
        self.data_service = DataService()
        self.data_processor = self.data_service.data_processor
        self._validate_model_readiness()
    
    def _validate_model_readiness(self):
        """Validate model dan data readiness"""
        
        model_info = self.lstm_predictor.get_model_info()
        
        if model_info.get('exists', False):
            logger.info("✅ LSTM Model loaded and ready for predictions")
            logger.info(f"Model features: {model_info.get('n_features', 'unknown')}")
            logger.info(f"Model parameters: {model_info.get('parameters', 'unknown')}")
        else:
            logger.warning("⚠️ LSTM Model not loaded, will use mock predictions")
        
        if self.data_service.data_loaded:
            logger.info("✅ Historical data loaded and ready")
        else:
            logger.warning("⚠️ Historical data not loaded")
    
    def generate_prediction(self, commodity: str, region: str, days_ahead: int = 7) -> Dict:
        """
        Generate price predictions untuk commodity dan region tertentu
        
        Args:
            commodity: Commodity name (e.g., "Cabai Rawit Merah")
            region: Region name (e.g., "Kota Bandung")
            days_ahead: Number of days to predict (1-30)
            
        Returns:
            Dictionary dengan predictions dan analysis
        """
        
        try:
            # Validate inputs
            if not self._validate_prediction_inputs(commodity, region, days_ahead):
                return {
                    'success': False,
                    'error': 'Invalid inputs or insufficient data',
                    'predictions': []
                }
            
            # Get latest sequence untuk prediction
            latest_sequence, scaler = self.data_processor.get_latest_sequence(
                commodity, region, sequence_length=30
            )
            
            # Generate predictions
            prediction_result = self.lstm_predictor.predict(
                latest_sequence, commodity, region, days_ahead
            )
            
            if not prediction_result.get('success', False):
                return prediction_result
            
            # Get current price dan historical stats
            current_data = self.data_processor.get_commodity_data(commodity, region)
            current_price = float(current_data['harga'].iloc[-1]) if len(current_data) > 0 else 0
            
            # Enhanced prediction analysis
            enhanced_result = self._enhance_prediction_result(
                prediction_result, commodity, region, current_price
            )
            
            # Generate prediction dates
            base_date = current_data['tanggal'].iloc[-1] if len(current_data) > 0 else datetime.now()
            prediction_dates = [(base_date + timedelta(days=i+1)).strftime('%Y-%m-%d') 
                              for i in range(days_ahead)]
            
            enhanced_result['prediction_dates'] = prediction_dates
            enhanced_result['base_date'] = base_date.strftime('%Y-%m-%d')
            enhanced_result['commodity'] = commodity
            enhanced_result['region'] = region
            
            logger.info(f"✅ Prediction generated for {commodity} - {region}")
            return enhanced_result
            
        except Exception as e:
            logger.error(f"❌ Error generating prediction: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'predictions': []
            }
    
    def _validate_prediction_inputs(self, commodity: str, region: str, days_ahead: int) -> bool:
        """Validate prediction inputs"""
        
        # Check commodity dan region availability
        available_commodities = self.data_service.get_available_commodities()
        available_regions = self.data_service.get_available_regions()
        
        if commodity not in available_commodities:
            logger.error(f"Commodity not available: {commodity}")
            return False
        
        if region not in available_regions:
            logger.error(f"Region not available: {region}")
            return False
        
        # Check days_ahead range
        if days_ahead < 1 or days_ahead > 30:
            logger.error(f"Invalid days_ahead: {days_ahead}")
            return False
        
        # Check data availability
        data = self.data_processor.get_commodity_data(commodity, region)
        if len(data) < 30:
            logger.error(f"Insufficient data: {len(data)} < 30 days")
            return False
        
        return True
    
    def _enhance_prediction_result(self, prediction_result: Dict, 
                                 commodity: str, region: str, 
                                 current_price: float) -> Dict:
        """Enhance prediction result dengan additional analysis"""
        
        predictions = prediction_result['predictions']
        
        # Calculate price movements
        price_changes = []
        price_changes_pct = []
        
        prev_price = current_price
        for pred_price in predictions:
            change_abs = pred_price - prev_price
            change_pct = (change_abs / prev_price * 100) if prev_price > 0 else 0
            
            price_changes.append(round(change_abs, 0))
            price_changes_pct.append(round(change_pct, 2))
            prev_price = pred_price
        
        # Calculate trend analysis
        trend_analysis = self._analyze_price_trend(predictions, current_price)
        
        # Risk assessment
        risk_assessment = self._assess_price_risk(predictions, current_price)
        
        # Historical comparison
        historical_comparison = self._compare_with_historical(commodity, region, predictions)
        
        enhanced_result = prediction_result.copy()
        enhanced_result.update({
            'current_price': current_price,
            'price_changes': price_changes,
            'price_changes_pct': price_changes_pct,
            'trend_analysis': trend_analysis,
            'risk_assessment': risk_assessment,
            'historical_comparison': historical_comparison,
            'summary': self._generate_prediction_summary(predictions, current_price)
        })
        
        return enhanced_result
    
    def _analyze_price_trend(self, predictions: List[float], current_price: float) -> Dict:
        """Analyze price trend dari predictions"""
        
        all_prices = [current_price] + predictions
        
        # Calculate overall trend
        price_change_total = predictions[-1] - current_price
        price_change_pct_total = (price_change_total / current_price * 100) if current_price > 0 else 0
        
        # Determine trend direction
        if price_change_pct_total > 5:
            trend_direction = "INCREASING"
        elif price_change_pct_total < -5:
            trend_direction = "DECREASING"
        else:
            trend_direction = "STABLE"
        
        # Calculate volatility
        price_volatility = np.std(predictions) / np.mean(predictions) * 100 if len(predictions) > 1 else 0
        
        return {
            'direction': trend_direction,
            'total_change': round(price_change_total, 0),
            'total_change_pct': round(price_change_pct_total, 2),
            'volatility_pct': round(price_volatility, 2),
            'highest_price': round(max(predictions), 0),
            'lowest_price': round(min(predictions), 0),
            'average_price': round(np.mean(predictions), 0)
        }
    
    def _assess_price_risk(self, predictions: List[float], current_price: float) -> Dict:
        """Assess price risk level"""
        
        max_price = max(predictions)
        min_price = min(predictions)
        
        # Calculate price range
        price_range_pct = ((max_price - min_price) / current_price * 100) if current_price > 0 else 0
        
        # Risk level determination
        if price_range_pct > 20:
            risk_level = "HIGH"
            risk_message = "High price volatility expected"
        elif price_range_pct > 10:
            risk_level = "MEDIUM"
            risk_message = "Moderate price volatility expected"
        else:
            risk_level = "LOW"
            risk_message = "Stable price movement expected"
        
        # Price spike risk
        max_increase = max([(p - current_price) / current_price * 100 for p in predictions])
        max_decrease = min([(p - current_price) / current_price * 100 for p in predictions])
        
        return {
            'risk_level': risk_level,
            'risk_message': risk_message,
            'price_range_pct': round(price_range_pct, 2),
            'max_increase_pct': round(max_increase, 2),
            'max_decrease_pct': round(abs(max_decrease), 2),
            'upside_risk': max_increase > 15,
            'downside_risk': max_decrease < -15
        }
    
    def _compare_with_historical(self, commodity: str, region: str, 
                               predictions: List[float]) -> Dict:
        """Compare predictions dengan historical patterns"""
        
        try:
            # Get historical data
            data = self.data_processor.get_commodity_data(commodity, region)
            
            if len(data) < 90:  # Need at least 3 months
                return {'available': False}
            
            # Historical statistics
            historical_prices = data['harga'].values
            historical_mean = np.mean(historical_prices)
            historical_std = np.std(historical_prices)
            
            # Seasonal comparison (same month last year)
            current_month = data['tanggal'].iloc[-1].month
            same_month_data = data[data['tanggal'].dt.month == current_month]
            seasonal_avg = np.mean(same_month_data['harga']) if len(same_month_data) > 0 else historical_mean
            
            # Compare predictions dengan historical range
            pred_avg = np.mean(predictions)
            
            return {
                'available': True,
                'historical_avg': round(historical_mean, 0),
                'historical_std': round(historical_std, 0),
                'seasonal_avg': round(seasonal_avg, 0),
                'prediction_vs_historical': round((pred_avg - historical_mean) / historical_mean * 100, 2),
                'prediction_vs_seasonal': round((pred_avg - seasonal_avg) / seasonal_avg * 100, 2),
                'within_normal_range': abs(pred_avg - historical_mean) <= 2 * historical_std
            }
            
        except Exception as e:
            logger.error(f"Error in historical comparison: {str(e)}")
            return {'available': False}
    
    def _generate_prediction_summary(self, predictions: List[float], current_price: float) -> Dict:
        """Generate human-readable prediction summary"""
        
        final_price = predictions[-1]
        total_change = final_price - current_price
        total_change_pct = (total_change / current_price * 100) if current_price > 0 else 0
        
        # Generate summary message
        if total_change_pct > 10:
            summary_text = f"Harga diprediksi naik signifikan sebesar {abs(total_change_pct):.1f}%"
            recommendation = "Siap-siap intervensi untuk stabilisasi harga"
        elif total_change_pct > 5:
            summary_text = f"Harga diprediksi naik moderat sebesar {abs(total_change_pct):.1f}%"
            recommendation = "Monitor perkembangan harga secara intensif"
        elif total_change_pct < -10:
            summary_text = f"Harga diprediksi turun signifikan sebesar {abs(total_change_pct):.1f}%"
            recommendation = "Pastikan kualitas dan pasokan tetap terjaga"
        elif total_change_pct < -5:
            summary_text = f"Harga diprediksi turun moderat sebesar {abs(total_change_pct):.1f}%"
            recommendation = "Monitor dampak terhadap petani dan pedagang"
        else:
            summary_text = "Harga diprediksi relatif stabil"
            recommendation = "Pertahankan kondisi pasokan dan distribusi"
        
        return {
            'summary_text': summary_text,
            'recommendation': recommendation,
            'confidence_level': self._calculate_confidence_level(predictions)
        }
    
    def _calculate_confidence_level(self, predictions: List[float]) -> str:
        """Calculate confidence level berdasarkan prediction stability"""
        
        if len(predictions) < 2:
            return 'medium'
        
        # Calculate coefficient of variation
        cv = np.std(predictions) / np.mean(predictions)
        
        if cv < 0.05:
            return 'high'
        elif cv < 0.15:
            return 'medium'
        else:
            return 'low'
    
    def batch_predict_all_commodities(self, days_ahead: int = 7) -> Dict:
        """Generate predictions untuk semua commodity-region pairs"""
        
        try:
            results = {}
            commodities = self.data_service.get_available_commodities()
            regions = self.data_service.get_available_regions()
            
            for commodity in commodities:
                results[commodity] = {}
                for region in regions:
                    try:
                        prediction = self.generate_prediction(commodity, region, days_ahead)
                        results[commodity][region] = prediction
                    except Exception as e:
                        logger.error(f"Error predicting {commodity} - {region}: {str(e)}")
                        results[commodity][region] = {
                            'success': False,
                            'error': str(e)
                        }
            
            return {
                'success': True,
                'batch_results': results,
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }