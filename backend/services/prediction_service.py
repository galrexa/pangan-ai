# backend/services/prediction_service.py - ENHANCED WITH AI GENERATION
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging
import numpy as np
from data.models.lstm_model import LSTMPredictor
from data.models.data_processor import DataProcessor
from services.data_service import DataService
from services.ai_service import AIService  # Import AI service
from config.settings import settings

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Enhanced Service class untuk handling prediction operations dalam PANGAN-AI
    Orchestrates LSTM model predictions dan AI-generated analysis
    """
    
    def __init__(self):
        self.lstm_predictor = LSTMPredictor(settings.model_path, settings.scaler_path)
        self.data_service = DataService()
        self.data_processor = self.data_service.data_processor
        self.ai_service = AIService()  # Initialize AI service untuk dynamic content
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
    
    def _convert_numpy_types(self, obj):
        """Convert numpy types to Python native types - COMPREHENSIVE VERSION"""
        if isinstance(obj, dict):
            return {k: self._convert_numpy_types(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_numpy_types(v) for v in obj]
        elif isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, (np.integer, np.signedinteger, np.unsignedinteger)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float16, np.float32, np.float64)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.generic):
            return obj.item()
        elif hasattr(obj, 'dtype'):
            # Additional catch for any numpy types
            try:
                return obj.item()
            except:
                return str(obj)
        else:
            return obj
    
    def generate_prediction(self, commodity: str, region: str, days_ahead: int = 7) -> Dict:
        """
        Enhanced prediction generation dengan AI-powered analysis
        
        Args:
            commodity: Commodity name (e.g., "Cabai Rawit Merah")
            region: Region name (e.g., "Kota Bandung")
            days_ahead: Number of days to predict (1-30)
            
        Returns:
            Dictionary dengan predictions dan AI-generated analysis
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
            
            # Enhanced prediction analysis dengan AI integration
            enhanced_result = self._enhance_prediction_with_ai(
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
            
            logger.info(f"✅ AI-enhanced prediction generated for {commodity} - {region}")
            
            # CRITICAL: Convert all numpy types before returning
            return self._convert_numpy_types(enhanced_result)
            
        except Exception as e:
            logger.error(f"❌ Error generating prediction: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'predictions': []
            }
    
    def _enhance_prediction_with_ai(self, prediction_result: Dict, 
                                   commodity: str, region: str, 
                                   current_price: float) -> Dict:
        """Enhanced prediction dengan AI-generated content instead of templates"""
        
        predictions = prediction_result['predictions']
        
        # Calculate basic metrics
        price_changes = []
        price_changes_pct = []
        
        prev_price = current_price
        for pred_price in predictions:
            change_abs = pred_price - prev_price
            change_pct = (change_abs / prev_price * 100) if prev_price > 0 else 0
            
            price_changes.append(round(change_abs, 0))
            price_changes_pct.append(round(change_pct, 2))
            prev_price = pred_price
        
        # Calculate enhanced metrics
        trend_analysis = self._analyze_price_trend(predictions, current_price)
        risk_assessment = self._assess_price_risk(predictions, current_price)
        historical_comparison = self._compare_with_historical(commodity, region, predictions)
        
        # Prepare data untuk AI analysis
        ai_prediction_data = {
            'commodity': commodity,
            'region': region,
            'current_price': current_price,
            'predictions': predictions,
            'trend_analysis': trend_analysis,
            'risk_assessment': risk_assessment,
            'historical_comparison': historical_comparison,
            'confidence_level': self._calculate_confidence_level(predictions)
        }
        
        # Generate AI-powered summary dan recommendations
        ai_summary = self.ai_service.generate_ai_summary(ai_prediction_data)
        ai_recommendations = self.ai_service.generate_ai_recommendations(ai_prediction_data)
        
        # Enhanced result dengan AI-generated content
        enhanced_result = prediction_result.copy()
        enhanced_result.update({
            'current_price': current_price,
            'price_changes': price_changes,
            'price_changes_pct': price_changes_pct,
            'trend_analysis': trend_analysis,
            'risk_assessment': risk_assessment,
            'historical_comparison': historical_comparison,
            'summary': {
                'summary_text': ai_summary,
                'confidence_level': ai_prediction_data['confidence_level'],
                'ai_generated': True
            },
            'recommendations': ai_recommendations,
            'ai_insights': self._generate_ai_insights_integration(ai_prediction_data)
        })
        
        return enhanced_result
    
    def _generate_ai_insights_integration(self, prediction_data: Dict) -> Dict:
        """Integrate dengan AI service untuk comprehensive insights"""
        try:
            # Generate comprehensive AI insights
            ai_insights_result = self.ai_service.generate_prediction_insights(prediction_data)
            
            if ai_insights_result.get('success', False):
                return {
                    'insights_text': ai_insights_result.get('insights', ''),
                    'policy_recommendations': ai_insights_result.get('policy_recommendations', []),
                    'generated_by': 'ai',
                    'provider': ai_insights_result.get('metadata', {}).get('provider', 'unknown'),
                    'generation_time': ai_insights_result.get('metadata', {}).get('generated_at', '')
                }
            else:
                # Fallback ke enhanced rule-based
                return self._generate_enhanced_fallback_insights(prediction_data)
                
        except Exception as e:
            logger.error(f"AI insights integration error: {str(e)}")
            return self._generate_enhanced_fallback_insights(prediction_data)
    
    def _generate_enhanced_fallback_insights(self, prediction_data: Dict) -> Dict:
        """Enhanced fallback insights dengan dynamic content generation"""
        
        commodity = prediction_data.get('commodity', '').replace('_', ' ').title()
        trend_analysis = prediction_data.get('trend_analysis', {})
        risk_assessment = prediction_data.get('risk_assessment', {})
        
        direction = trend_analysis.get('direction', 'STABLE')
        change_pct = trend_analysis.get('total_change_pct', 0)
        risk_level = risk_assessment.get('risk_level', 'MEDIUM')
        
        # Dynamic insights generation berdasarkan context
        insights_components = []
        
        # 1. DYNAMIC TREND ANALYSIS
        trend_insight = self._generate_dynamic_trend_insight(commodity, direction, change_pct)
        insights_components.append(f"ANALISIS TREN: {trend_insight}")
        
        # 2. CONTEXTUAL FACTOR ANALYSIS
        factor_insight = self._generate_contextual_factors(commodity, direction, change_pct, risk_level)
        insights_components.append(f"FAKTOR KUNCI: {factor_insight}")
        
        # 3. STRATEGIC RECOMMENDATIONS
        strategic_recommendations = self._generate_strategic_recommendations(commodity, direction, change_pct, risk_level)
        insights_components.append(f"REKOMENDASI STRATEGIS: {strategic_recommendations}")
        
        # 4. TIMING AND IMPLEMENTATION
        timing_insight = self._generate_timing_insight(direction, change_pct, risk_level)
        insights_components.append(f"TIMING PELAKSANAAN: {timing_insight}")
        
        insights_text = '\n\n'.join(insights_components)
        
        return {
            'insights_text': insights_text,
            'policy_recommendations': strategic_recommendations.split('. ')[:3],
            'generated_by': 'enhanced_fallback',
            'provider': 'dynamic_generation',
            'generation_time': datetime.now().isoformat()
        }
    
    def _generate_dynamic_trend_insight(self, commodity: str, direction: str, change_pct: float) -> str:
        """Generate dynamic trend insight berdasarkan commodity dan context"""
        
        # Commodity-specific context
        commodity_context = {
            'cabai': 'komoditas dengan volatilitas tinggi yang sensitif terhadap cuaca dan seasonal demand',
            'bawang': 'komoditas strategis dengan pola cyclical yang dipengaruhi harvest timing',
            'tomat': 'produk hortikultura dengan supply chain complexity tinggi',
            'default': 'komoditas pangan dengan dinamika pasar yang kompleks'
        }
        
        # Get commodity context
        context = commodity_context.get('default', commodity_context['default'])
        for key in commodity_context:
            if key in commodity.lower():
                context = commodity_context[key]
                break
        
        # Dynamic trend description
        if direction == 'INCREASING':
            if change_pct > 15:
                return f"Harga {commodity} mengalami kenaikan signifikan {change_pct:.1f}% yang berpotensi memicu tekanan inflasi. Sebagai {context}, lonjakan ini memerlukan respons kebijakan segera untuk mencegah spiral harga dan dampak terhadap daya beli masyarakat."
            elif change_pct > 8:
                return f"Tren kenaikan moderat {change_pct:.1f}% pada {commodity} masih dalam batas manageable namun perlu diwaspadai. Karakteristik {context} menunjukkan perlunya monitoring intensif untuk antisipasi escalation."
            else:
                return f"Kenaikan ringan {change_pct:.1f}% pada {commodity} mencerminkan adjustment normal pasar. Kondisi ini typical untuk {context} dan masih dalam corridor stabilitas harga."
        elif direction == 'DECREASING':
            if change_pct < -15:
                return f"Penurunan tajam {abs(change_pct):.1f}% pada harga {commodity} dapat menguntungkan konsumen namun berpotensi merugikan income petani. Sebagai {context}, diperlukan balance policy untuk protect producer welfare."
            else:
                return f"Koreksi turun {abs(change_pct):.1f}% pada {commodity} menunjukkan rebalancing supply-demand yang healthy. Pattern ini normal untuk {context} dan memberikan relief pada consumer prices."
        else:
            return f"Stabilitas harga {commodity} dengan fluktuasi minimal menunjukkan kondisi pasar yang balanced. Karakteristik {context} dalam kondisi optimal untuk predictable planning dan sustainable growth."
    
    def _generate_contextual_factors(self, commodity: str, direction: str, change_pct: float, risk_level: str) -> str:
        """Generate contextual factors berdasarkan situasi spesifik"""
        
        factors = []
        
        # Season-based factors
        current_month = datetime.now().month
        if current_month in [12, 1, 2]:  # Musim hujan
            factors.append("intensitas curah hujan tinggi yang mempengaruhi kualitas dan distribusi")
        elif current_month in [6, 7, 8]:  # Musim kemarau
            factors.append("kondisi kemarau yang berdampak pada produktivitas dan kualitas harvest")
        else:
            factors.append("kondisi cuaca transisional yang memerlukan adaptasi supply chain")
        
        # Commodity-specific factors
        if 'cabai' in commodity.lower():
            factors.append("sensitivitas tinggi terhadap pest disease dan market speculation")
            if direction == 'INCREASING':
                factors.append("kemungkinan demand spike menjelang periode festive atau religious events")
        elif 'bawang' in commodity.lower():
            factors.append("dinamika import policy dan regional production capacity")
            factors.append("seasonal harvest cycle dari major producing regions")
        
        # Risk-based factors
        if risk_level == 'HIGH':
            factors.append("volatilitas ekstrem yang dapat trigger market panic atau hoarding behavior")
        elif risk_level == 'MEDIUM':
            factors.append("moderate uncertainty yang masih dapat dikontrol dengan proper intervention")
        
        # Economic factors
        if abs(change_pct) > 10:
            factors.append("potential spillover effects terhadap related commodities dan inflation expectations")
        
        return ". ".join(factors[:3]) + "."
    
    def _generate_strategic_recommendations(self, commodity: str, direction: str, change_pct: float, risk_level: str) -> str:
        """Generate strategic recommendations berdasarkan context analysis"""
        
        recommendations = []
        
        # Immediate actions berdasarkan severity
        if abs(change_pct) > 15:
            recommendations.append("Aktivasi crisis response team dengan coordinate lintas-kementerian untuk stabilisasi immediate")
            if direction == 'INCREASING':
                recommendations.append("Deploy strategic reserves dan implementasi market operation untuk supply injection")
            else:
                recommendations.append("Launch price support mechanism untuk protect petani income dan prevent market collapse")
        elif abs(change_pct) > 8:
            recommendations.append("Enhance monitoring frequency dengan deploy field officers untuk real-time market intelligence")
            recommendations.append("Prepare contingency measures dengan coordinate regional TPID untuk rapid response readiness")
        else:
            recommendations.append("Maintain standard monitoring protocol dengan focus pada quality improvement dan distribution efficiency")
        
        # Commodity-specific recommendations
        if 'cabai' in commodity.lower():
            if direction == 'INCREASING':
                recommendations.append("Coordinate dengan cabai production centers di Jawa Barat dan Jawa Tengah untuk harvest acceleration")
            recommendations.append("Implement pest control assistance dan provide weather protection untuk petani")
        elif 'bawang' in commodity.lower():
            recommendations.append("Review import quota policy dan coordinate dengan major suppliers India/Thailand")
            recommendations.append("Optimize cold storage utilization untuk extend shelf life dan smooth price volatility")
        
        # Long-term strategic actions
        recommendations.append(f"Develop {commodity.lower()} supply chain resilience melalui diversifikasi sources dan technology adoption")
        
        return ". ".join(recommendations[:3]) + "."
    
    def _generate_timing_insight(self, direction: str, change_pct: float, risk_level: str) -> str:
        """Generate timing insight untuk implementation"""
        
        if risk_level == 'HIGH' or abs(change_pct) > 15:
            return "Intervensi critical required dalam 24-48 jam untuk prevent escalation. Immediate coordination meeting dengan stakeholders utama dan deployment emergency response protocol."
        elif abs(change_pct) > 8:
            return "Tindakan preventif dalam 3-5 hari dengan preparation phase selama 48 jam. Schedule coordination meeting dan prepare resource allocation untuk potential intervention."
        elif direction == 'INCREASING' and change_pct > 5:
            return "Window intervensi optimal dalam 5-7 hari. Sufficient time untuk detailed analysis dan coordinated response dengan proper stakeholder consultation."
        elif direction == 'DECREASING' and change_pct < -8:
            return "Support measures untuk petani diperlukan dalam 1-2 minggu. Time untuk assess impact dan design appropriate assistance programs."
        else:
            return "Monitoring berkelanjutan dengan review point setiap 2 minggu. Maintain readiness untuk quick response jika trend berubah unexpectedly."
    
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
    
    def _analyze_price_trend(self, predictions: List[float], current_price: float) -> Dict:
        """Analyze price trend dari predictions - ENHANCED VERSION"""
        
        all_prices = [current_price] + predictions
        
        # Calculate overall trend
        price_change_total = predictions[-1] - current_price
        price_change_pct_total = (price_change_total / current_price * 100) if current_price > 0 else 0
        
        # Determine trend direction dengan enhanced logic
        if price_change_pct_total > 5:
            trend_direction = "INCREASING"
        elif price_change_pct_total < -5:
            trend_direction = "DECREASING"
        else:
            trend_direction = "STABLE"
        
        # Calculate enhanced volatility metrics
        price_volatility = float(np.std(predictions) / np.mean(predictions) * 100) if len(predictions) > 1 else 0.0
        
        # Calculate momentum dan acceleration
        if len(predictions) >= 3:
            early_change = (predictions[2] - current_price) / current_price * 100
            late_change = (predictions[-1] - predictions[-3]) / predictions[-3] * 100
            momentum = "ACCELERATING" if abs(late_change) > abs(early_change) else "DECELERATING"
        else:
            momentum = "STABLE"
        
        return {
            'direction': trend_direction,
            'momentum': momentum,
            'total_change': float(round(price_change_total, 0)),
            'total_change_pct': float(round(price_change_pct_total, 2)),
            'volatility_pct': float(round(price_volatility, 2)),
            'highest_price': float(round(max(predictions), 0)),
            'lowest_price': float(round(min(predictions), 0)),
            'average_price': float(round(np.mean(predictions), 0)),
            'price_range_pct': float(round((max(predictions) - min(predictions)) / current_price * 100, 2))
        }
    
    def _assess_price_risk(self, predictions: List[float], current_price: float) -> Dict:
        """Enhanced price risk assessment"""
        
        max_price = max(predictions)
        min_price = min(predictions)
        
        # Calculate price range dan volatility
        price_range_pct = ((max_price - min_price) / current_price * 100) if current_price > 0 else 0
        
        # Enhanced risk level determination
        volatility_score = np.std(predictions) / np.mean(predictions) if len(predictions) > 1 else 0
        trend_score = abs((predictions[-1] - current_price) / current_price)
        
        combined_risk_score = (price_range_pct * 0.4) + (volatility_score * 100 * 0.3) + (trend_score * 100 * 0.3)
        
        if combined_risk_score > 25:
            risk_level = "HIGH"
            risk_message = "High price volatility dengan potential market disruption"
        elif combined_risk_score > 12:
            risk_level = "MEDIUM"
            risk_message = "Moderate volatility yang dapat dikelola dengan proper intervention"
        else:
            risk_level = "LOW"
            risk_message = "Stable price movement dengan predictable pattern"
        
        # Enhanced risk indicators
        max_increase = max([float((p - current_price) / current_price * 100) for p in predictions])
        max_decrease = min([float((p - current_price) / current_price * 100) for p in predictions])
        
        return {
            'risk_level': risk_level,
            'risk_message': risk_message,
            'combined_risk_score': float(round(combined_risk_score, 2)),
            'price_range_pct': float(round(price_range_pct, 2)),
            'max_increase_pct': float(round(max_increase, 2)),
            'max_decrease_pct': float(round(abs(max_decrease), 2)),
            'upside_risk': bool(max_increase > 15),
            'downside_risk': bool(max_decrease < -15),
            'volatility_score': float(round(volatility_score * 100, 2))
        }
    
    def _compare_with_historical(self, commodity: str, region: str, 
                               predictions: List[float]) -> Dict:
        """Enhanced historical comparison with seasonal analysis"""
        
        try:
            # Get historical data
            data = self.data_processor.get_commodity_data(commodity, region)
            
            if len(data) < 30:
                return {
                    'comparison_available': False,
                    'message': 'Insufficient historical data for comparison'
                }
            
            # Calculate historical statistics
            historical_prices = data['harga'].astype(float).tolist()
            historical_mean = float(np.mean(historical_prices))
            historical_std = float(np.std(historical_prices))
            historical_max = float(np.max(historical_prices))
            historical_min = float(np.min(historical_prices))
            
            # Seasonal comparison jika data sufficient
            current_month = datetime.now().month
            if len(data) >= 365:  # At least 1 year data
                seasonal_data = data[data['tanggal'].dt.month == current_month]
                seasonal_mean = float(np.mean(seasonal_data['harga'])) if len(seasonal_data) > 0 else historical_mean
            else:
                seasonal_mean = historical_mean
            
            # Compare dengan predictions
            predicted_mean = float(np.mean(predictions))
            predicted_max = float(max(predictions))
            predicted_min = float(min(predictions))
            
            # Enhanced comparison metrics
            return {
                'comparison_available': True,
                'historical_stats': {
                    'mean': float(round(historical_mean, 0)),
                    'std': float(round(historical_std, 0)),
                    'max': float(round(historical_max, 0)),
                    'min': float(round(historical_min, 0))
                },
                'seasonal_mean': float(round(seasonal_mean, 0)),
                'predicted_mean': float(round(predicted_mean, 0)),
                'mean_difference_pct': float(round((predicted_mean - historical_mean) / historical_mean * 100, 2)),
                'seasonal_difference_pct': float(round((predicted_mean - seasonal_mean) / seasonal_mean * 100, 2)),
                'above_historical_range': bool(predicted_max > historical_mean + 2 * historical_std),
                'below_historical_range': bool(predicted_min < historical_mean - 2 * historical_std),
                'above_historical_max': bool(predicted_max > historical_max),
                'below_historical_min': bool(predicted_min < historical_min)
            }
            
        except Exception as e:
            logger.error(f"Error in historical comparison: {str(e)}")
            return {
                'comparison_available': False,
                'error': str(e)
            }
    
    def _calculate_confidence_level(self, predictions: List[float]) -> str:
        """Enhanced confidence level calculation"""
        
        if len(predictions) < 2:
            return 'medium'
        
        # Multiple confidence indicators
        cv = float(np.std(predictions) / np.mean(predictions))  # Coefficient of variation
        trend_consistency = self._calculate_trend_consistency(predictions)
        prediction_spread = (max(predictions) - min(predictions)) / np.mean(predictions)
        
        # Weighted confidence score
        confidence_score = (
            (1 - min(cv, 0.3)) * 0.4 +  # Lower CV = higher confidence
            trend_consistency * 0.4 +      # Consistent trend = higher confidence
            (1 - min(prediction_spread, 0.5)) * 0.2  # Lower spread = higher confidence
        )
        
        if confidence_score > 0.75:
            return 'high'
        elif confidence_score > 0.5:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_trend_consistency(self, predictions: List[float]) -> float:
        """Calculate trend consistency across predictions"""
        if len(predictions) < 3:
            return 0.5
        
        # Calculate day-to-day changes
        changes = []
        for i in range(1, len(predictions)):
            change = predictions[i] - predictions[i-1]
            changes.append(1 if change >= 0 else -1)
        
        # Calculate consistency (how many changes go in same direction)
        if len(changes) == 0:
            return 0.5
        
        positive_changes = sum(1 for c in changes if c > 0)
        negative_changes = sum(1 for c in changes if c < 0)
        
        # Higher consistency if most changes go in same direction
        consistency = max(positive_changes, negative_changes) / len(changes)
        return consistency
    
    def batch_predict_all_commodities(self, days_ahead: int = 7) -> Dict:
        """Enhanced batch prediction dengan AI insights untuk all commodities"""
        
        try:
            results = {}
            commodities = self.data_service.get_available_commodities()
            regions = self.data_service.get_available_regions()
            
            total_predictions = len(commodities) * len(regions)
            successful_predictions = 0
            
            for commodity in commodities:
                results[commodity] = {}
                for region in regions:
                    try:
                        prediction = self.generate_prediction(commodity, region, days_ahead)
                        results[commodity][region] = prediction
                        if prediction.get('success', False):
                            successful_predictions += 1
                    except Exception as e:
                        logger.error(f"Error predicting {commodity} - {region}: {str(e)}")
                        results[commodity][region] = {
                            'success': False,
                            'error': str(e)
                        }
            
            # Generate batch summary dengan AI
            batch_summary = self._generate_batch_summary(results, successful_predictions, total_predictions)
            
            return self._convert_numpy_types({
                'success': True,
                'batch_results': results,
                'batch_summary': batch_summary,
                'statistics': {
                    'total_predictions': total_predictions,
                    'successful_predictions': successful_predictions,
                    'success_rate': round(successful_predictions / total_predictions * 100, 2) if total_predictions > 0 else 0
                },
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_batch_summary(self, results: Dict, successful: int, total: int) -> Dict:
        """Generate AI-powered batch summary"""
        try:
            # Aggregate insights dari successful predictions
            high_risk_items = []
            significant_changes = []
            stable_items = []
            
            for commodity, regions in results.items():
                for region, result in regions.items():
                    if result.get('success', False):
                        risk_level = result.get('risk_assessment', {}).get('risk_level', 'MEDIUM')
                        change_pct = result.get('trend_analysis', {}).get('total_change_pct', 0)
                        
                        if risk_level == 'HIGH':
                            high_risk_items.append(f"{commodity} di {region}")
                        elif abs(change_pct) > 10:
                            significant_changes.append(f"{commodity} di {region} ({change_pct:+.1f}%)")
                        elif abs(change_pct) < 3:
                            stable_items.append(f"{commodity} di {region}")
            
            # Generate dynamic summary berdasarkan results
            if len(high_risk_items) > 0:
                priority_message = f"Perhatian: {len(high_risk_items)} komoditas berisiko tinggi memerlukan monitoring intensif."
                top_concerns = high_risk_items[:3]
            elif len(significant_changes) > 0:
                priority_message = f"Moderate: {len(significant_changes)} komoditas mengalami perubahan signifikan."
                top_concerns = significant_changes[:3]
            else:
                priority_message = "Kondisi pasar relatif stabil dengan fluktuasi minimal."
                top_concerns = []
            
            return {
                'priority_message': priority_message,
                'top_concerns': top_concerns,
                'risk_distribution': {
                    'high_risk': len(high_risk_items),
                    'significant_change': len(significant_changes),
                    'stable': len(stable_items)
                },
                'overall_assessment': self._assess_overall_market_condition(high_risk_items, significant_changes, stable_items),
                'recommended_actions': self._generate_batch_recommendations(high_risk_items, significant_changes)
            }
            
        except Exception as e:
            logger.error(f"Batch summary generation error: {str(e)}")
            return {
                'priority_message': f"Batch prediction completed: {successful}/{total} successful predictions.",
                'top_concerns': [],
                'recommended_actions': ["Review individual predictions untuk detail analysis"]
            }
    
    def _assess_overall_market_condition(self, high_risk: List, significant_changes: List, stable: List) -> str:
        """Assess overall market condition"""
        total_items = len(high_risk) + len(significant_changes) + len(stable)
        
        if len(high_risk) > total_items * 0.2:  # >20% high risk
            return "ALERT: Market conditions showing high volatility requiring immediate attention"
        elif len(significant_changes) > total_items * 0.3:  # >30% significant changes
            return "CAUTION: Moderate market volatility requiring enhanced monitoring"
        elif len(stable) > total_items * 0.7:  # >70% stable
            return "STABLE: Market conditions favorable with minimal disruptions"
        else:
            return "MIXED: Varied market conditions requiring selective interventions"
    
    def _generate_batch_recommendations(self, high_risk: List, significant_changes: List) -> List[str]:
        """Generate batch-level recommendations"""
        recommendations = []
        
        if len(high_risk) > 0:
            recommendations.append(f"Immediate action: Aktivasi crisis response untuk {len(high_risk)} komoditas high-risk")
            recommendations.append("Coordinate emergency meeting dengan TPID dan stakeholders terkait")
        
        if len(significant_changes) > 0:
            recommendations.append(f"Enhanced monitoring untuk {len(significant_changes)} komoditas dengan perubahan signifikan")
        
        if len(high_risk) + len(significant_changes) > 5:
            recommendations.append("Consider market-wide intervention dan policy coordination")
        
        recommendations.append("Maintain regular monitoring schedule dengan daily briefing untuk decision makers")
        
        return recommendations[:4]  # Max 4 recommendations
    
    def get_prediction_health_check(self) -> Dict:
        """Enhanced health check untuk prediction service"""
        
        try:
            model_info = self.lstm_predictor.get_model_info()
            data_status = self.data_service.data_loaded
            ai_status = self.ai_service.get_ai_service_status()
            
            # Determine service status
            if model_info.get('exists', False) and data_status and ai_status.get('service_health') == 'healthy':
                service_status = 'optimal'
            elif model_info.get('exists', False) and data_status:
                service_status = 'good'  # AI fallback available
            elif not model_info.get('exists', False) and data_status:
                service_status = 'degraded'  # Mock predictions only
            else:
                service_status = 'error'
            
            return self._convert_numpy_types({
                'service_status': service_status,
                'model_loaded': bool(model_info.get('exists', False)),
                'data_loaded': bool(data_status),
                'ai_service_status': ai_status.get('service_health', 'unknown'),
                'capabilities': {
                    'ml_predictions': model_info.get('exists', False),
                    'ai_insights': ai_status.get('openai_configured', False) or ai_status.get('anthropic_configured', False),
                    'dynamic_summaries': True,
                    'contextual_recommendations': True,
                    'batch_processing': True
                },
                'model_info': model_info,
                'available_commodities': len(self.data_service.get_available_commodities()),
                'available_regions': len(self.data_service.get_available_regions()),
                'ai_providers': {
                    'openai': ai_status.get('openai_status', 'not_configured'),
                    'anthropic': ai_status.get('anthropic_status', 'not_configured')
                },
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            
        except Exception as e:
            logger.error(f"Error in health check: {str(e)}")
            return {
                'service_status': 'error',
                'error': str(e),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }