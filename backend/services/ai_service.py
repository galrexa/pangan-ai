import openai
import json
from typing import Dict, List, Optional
import logging
from datetime import datetime
from config.settings import settings

logger = logging.getLogger(__name__)

class AIService:
    """
    Service class untuk AI integration dalam PANGAN-AI
    Handles ChatGPT/Claude API untuk insights dan chat functionality
    """
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self._setup_ai_clients()
        
        # Prompt templates
        self.insights_template = """
        Sebagai ahli ekonomi pangan Indonesia, analisis data prediksi harga berikut dan berikan insight profesional:
        
        KOMODITAS: {commodity}
        WILAYAH: {region}
        HARGA SAAT INI: Rp {current_price:,.0f}
        PREDIKSI 7 HARI: {predictions}
        PERUBAHAN: {trend_direction} {total_change_pct}%
        RISIKO: {risk_level}
        
        Berikan analisis dalam format:
        1. ANALISIS TREND: [2-3 kalimat tentang arah pergerakan harga]
        2. FAKTOR PENYEBAB: [2-3 faktor utama yang mempengaruhi]
        3. REKOMENDASI KEBIJAKAN: [2-3 rekomendasi konkret untuk pemerintah]
        4. TIMING INTERVENSI: [kapan waktu tepat untuk bertindak]
        
        Jawaban maksimal 150 kata, fokus pada insight yang actionable untuk pengambil kebijakan.
        """
        
        self.chat_template = """
        Anda adalah asisten AI untuk PANGAN-AI, sistem prediksi harga pangan Kantor Staf Presiden.
        
        KONTEKS: {context}
        
        Jawab pertanyaan user dengan:
        - Informasi akurat tentang harga pangan
        - Rekomendasi berbasis data
        - Bahasa profesional namun mudah dipahami
        - Fokus pada implikasi kebijakan
        
        Maksimal 100 kata per response.
        """
    
    def _setup_ai_clients(self):
        """Setup AI clients untuk OpenAI dan Anthropic"""
        
        try:
            # Setup OpenAI
            if settings.openai_api_key:
                openai.api_key = settings.openai_api_key
                self.openai_client = openai
                logger.info("✅ OpenAI client configured")
            else:
                logger.warning("⚠️ OpenAI API key not found")
            
            # Setup Anthropic (future implementation)
            if settings.anthropic_api_key:
                # self.anthropic_client = anthropic.Client(api_key=settings.anthropic_api_key)
                logger.info("✅ Anthropic client configured")
            else:
                logger.warning("⚠️ Anthropic API key not found")
                
        except Exception as e:
            logger.error(f"❌ Error setting up AI clients: {str(e)}")
    
    def generate_prediction_insights(self, prediction_data: Dict) -> Dict:
        """
        Generate AI insights dari prediction results
        
        Args:
            prediction_data: Dictionary dengan prediction results
            
        Returns:
            Dictionary dengan AI-generated insights
        """
        
        try:
            # Extract key information
            commodity = prediction_data.get('commodity', 'Unknown')
            region = prediction_data.get('region', 'Unknown')
            current_price = prediction_data.get('current_price', 0)
            predictions = prediction_data.get('predictions', [])
            trend_analysis = prediction_data.get('trend_analysis', {})
            risk_assessment = prediction_data.get('risk_assessment', {})
            
            # Format predictions untuk template
            pred_text = ', '.join([f"Hari {i+1}: Rp {p:,.0f}" for i, p in enumerate(predictions[:3])])
            if len(predictions) > 3:
                pred_text += f", ..., Hari {len(predictions)}: Rp {predictions[-1]:,.0f}"
            
            # Generate insights
            if self.openai_client and settings.openai_api_key:
                insights = self._generate_openai_insights(
                    commodity, region, current_price, pred_text,
                    trend_analysis.get('direction', 'STABLE'),
                    trend_analysis.get('total_change_pct', 0),
                    risk_assessment.get('risk_level', 'MEDIUM')
                )
            else:
                # Fallback to rule-based insights
                insights = self._generate_rule_based_insights(prediction_data)
            
            return {
                'success': True,
                'insights': insights,
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'ai_provider': 'openai' if self.openai_client else 'rule_based'
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating insights: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'insights': self._generate_fallback_insights(prediction_data)
            }
    
    def _generate_openai_insights(self, commodity: str, region: str, 
                                current_price: float, predictions: str,
                                trend_direction: str, total_change_pct: float,
                                risk_level: str) -> str:
        """Generate insights menggunakan OpenAI GPT"""
        
        try:
            prompt = self.insights_template.format(
                commodity=commodity,
                region=region,
                current_price=current_price,
                predictions=predictions,
                trend_direction=trend_direction,
                total_change_pct=total_change_pct,
                risk_level=risk_level
            )
            
            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Anda adalah ahli ekonomi pangan Indonesia yang memberikan analisis untuk Kantor Staf Presiden."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.ai_max_tokens,
                temperature=settings.ai_temperature
            )
            
            insights = response.choices[0].message.content.strip()
            logger.info("✅ OpenAI insights generated successfully")
            return insights
            
        except Exception as e:
            logger.error(f"❌ Error calling OpenAI API: {str(e)}")
            raise
    
    def _generate_rule_based_insights(self, prediction_data: Dict) -> str:
        """Generate insights menggunakan rule-based logic sebagai fallback"""
        
        try:
            commodity = prediction_data.get('commodity', 'komoditas')
            trend_analysis = prediction_data.get('trend_analysis', {})
            risk_assessment = prediction_data.get('risk_assessment', {})
            
            direction = trend_analysis.get('direction', 'STABLE')
            change_pct = trend_analysis.get('total_change_pct', 0)
            risk_level = risk_assessment.get('risk_level', 'MEDIUM')
            
            # Rule-based insights generation
            insights = []
            
            # 1. ANALISIS TREND
            if direction == 'INCREASING' and change_pct > 10:
                insights.append("ANALISIS TREND: Harga mengalami kenaikan signifikan yang memerlukan perhatian khusus. Tren kenaikan ini dapat berdampak pada inflasi dan daya beli masyarakat.")
            elif direction == 'INCREASING':
                insights.append("ANALISIS TREND: Harga menunjukkan tren kenaikan moderat yang masih dalam batas wajar namun perlu dipantau secara intensif.")
            elif direction == 'DECREASING':
                insights.append("ANALISIS TREND: Harga menunjukkan tren penurunan yang dapat menguntungkan konsumen namun perlu dipastikan tidak merugikan petani.")
            else:
                insights.append("ANALISIS TREND: Harga relatif stabil dengan fluktuasi minimal, menunjukkan kondisi pasar yang seimbang.")
            
            # 2. FAKTOR PENYEBAB
            if 'cabai' in commodity.lower():
                insights.append("FAKTOR PENYEBAB: Perubahan harga cabai umumnya dipengaruhi oleh faktor cuaca, masa panen, dan permintaan seasonal terutama menjelang hari besar keagamaan.")
            elif 'bawang' in commodity.lower():
                insights.append("FAKTOR PENYEBAB: Fluktuasi harga bawang merah dipengaruhi oleh siklus panen, kondisi cuaca, dan dinamika impor-ekspor regional.")
            else:
                insights.append("FAKTOR PENYEBAB: Perubahan harga dipengaruhi oleh faktor supply-demand, kondisi cuaca, dan seasonal patterns.")
            
            # 3. REKOMENDASI KEBIJAKAN
            if direction == 'INCREASING' and change_pct > 10:
                insights.append("REKOMENDASI KEBIJAKAN: Siapkan operasi pasar dan release stok cadangan. Koordinasi dengan daerah penghasil untuk memastikan distribusi lancar. Pantau kemungkinan spekulasi pasar.")
            elif direction == 'INCREASING':
                insights.append("REKOMENDASI KEBIJAKAN: Tingkatkan monitoring supply chain dan siapkan antisipasi jika tren berlanjut. Koordinasi dengan TPID daerah untuk stabilisasi.")
            else:
                insights.append("REKOMENDASI KEBIJAKAN: Pertahankan monitoring rutin dan pastikan kualitas distribusi tetap terjaga. Siapkan contingency plan untuk perubahan mendadak.")
            
            # 4. TIMING INTERVENSI
            if risk_level == 'HIGH':
                insights.append("TIMING INTERVENSI: Intervensi diperlukan dalam 1-2 hari ke depan untuk mencegah eskalasi yang lebih besar.")
            elif risk_level == 'MEDIUM':
                insights.append("TIMING INTERVENSI: Siapkan intervensi dalam 3-5 hari jika tren negatif berlanjut.")
            else:
                insights.append("TIMING INTERVENSI: Monitoring intensif tanpa intervensi immediate, dengan kesiapan respons dalam 7 hari.")
            
            return '\n\n'.join(insights)
            
        except Exception as e:
            logger.error(f"Error generating rule-based insights: {str(e)}")
            return "Insights tidak tersedia saat ini. Silakan coba lagi atau hubungi administrator sistem."
    
    def _generate_fallback_insights(self, prediction_data: Dict) -> str:
        """Generate basic fallback insights jika AI services gagal"""
        
        commodity = prediction_data.get('commodity', 'komoditas')
        trend_analysis = prediction_data.get('trend_analysis', {})
        change_pct = trend_analysis.get('total_change_pct', 0)
        
        if change_pct > 5:
            return f"Prediksi menunjukkan kenaikan harga {commodity} sebesar {change_pct:.1f}%. Rekomendasi: Monitor perkembangan dan siapkan langkah stabilisasi jika diperlukan."
        elif change_pct < -5:
            return f"Prediksi menunjukkan penurunan harga {commodity} sebesar {abs(change_pct):.1f}%. Rekomendasi: Pastikan kualitas produk dan dampak terhadap petani."
        else:
            return f"Harga {commodity} diprediksi relatif stabil. Rekomendasi: Pertahankan monitoring rutin dan kesiapan respons cepat."
    
    def chat_with_ai(self, user_message: str, context: Optional[Dict] = None) -> Dict:
        """
        Handle natural language chat dengan AI
        
        Args:
            user_message: User's message
            context: Optional context information
            
        Returns:
            Dictionary dengan AI response
        """
        
        try:
            # Prepare context
            context_str = self._prepare_chat_context(context)
            
            if self.openai_client and settings.openai_api_key:
                response = self._chat_with_openai(user_message, context_str)
            else:
                response = self._chat_rule_based(user_message, context)
            
            return {
                'success': True,
                'response': response,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'ai_provider': 'openai' if self.openai_client else 'rule_based'
            }
            
        except Exception as e:
            logger.error(f"❌ Error in AI chat: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'response': "Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi."
            }
    
    def _prepare_chat_context(self, context: Optional[Dict]) -> str:
        """Prepare context string untuk chat"""
        
        if not context:
            return "User bertanya tentang sistem prediksi harga pangan PANGAN-AI."
        
        context_parts = []
        
        if 'current_predictions' in context:
            context_parts.append(f"Prediksi terkini: {context['current_predictions']}")
        
        if 'commodity' in context:
            context_parts.append(f"Komoditas: {context['commodity']}")
        
        if 'region' in context:
            context_parts.append(f"Wilayah: {context['region']}")
        
        if 'alerts' in context:
            context_parts.append(f"Alert aktif: {len(context['alerts'])} alert")
        
        return " | ".join(context_parts) if context_parts else "Konteks umum sistem PANGAN-AI."
    
    def _chat_with_openai(self, user_message: str, context_str: str) -> str:
        """Chat menggunakan OpenAI"""
        
        try:
            prompt = self.chat_template.format(context=context_str)
            
            response = self.openai_client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=150,  # Shorter for chat
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error in OpenAI chat: {str(e)}")
            raise
    
    def _chat_rule_based(self, user_message: str, context: Optional[Dict]) -> str:
        """Rule-based chat responses sebagai fallback"""
        
        message_lower = user_message.lower()
        
        # Simple keyword-based responses
        if any(word in message_lower for word in ['harga', 'price']):
            return "Saya dapat membantu Anda menganalisis prediksi harga pangan. Silakan spesifikasi komoditas dan wilayah yang ingin Anda ketahui."
        
        elif any(word in message_lower for word in ['prediksi', 'forecast', 'ramalan']):
            return "Sistem PANGAN-AI menggunakan model LSTM untuk prediksi harga 7 hari ke depan. Akurasi model saat ini mencapai R² 0.8437."
        
        elif any(word in message_lower for word in ['cabai', 'chili']):
            return "Cabai merupakan komoditas dengan volatilitas tinggi. Sistem dapat memprediksi harga cabai rawit merah dan cabai merah keriting untuk berbagai wilayah di Jawa Barat."
        
        elif any(word in message_lower for word in ['bawang', 'onion']):
            return "Bawang merah memiliki pola seasonal yang cukup predictable. Sistem dapat memberikan prediksi dan analisis trend untuk membantu pengambilan keputusan."
        
        elif any(word in message_lower for word in ['inflasi', 'inflation']):
            return "Fluktuasi harga pangan dapat berkontribusi pada inflasi. Sistem PANGAN-AI membantu antisipasi dini untuk menjaga stabilitas harga."
        
        elif any(word in message_lower for word in ['rekomendasi', 'saran', 'advice']):
            return "Berdasarkan prediksi, saya dapat memberikan rekomendasi kebijakan dan timing intervensi yang tepat untuk menjaga stabilitas harga pangan."
        
        else:
            return "Saya adalah asisten AI untuk sistem prediksi harga pangan. Saya dapat membantu analisis harga, prediksi, dan rekomendasi kebijakan. Ada yang bisa saya bantu?"
    
    def get_ai_service_status(self) -> Dict:
        """Get status AI services"""
        
        status = {
            'openai_configured': bool(self.openai_client and settings.openai_api_key),
            'anthropic_configured': bool(settings.anthropic_api_key),
            'default_provider': settings.default_ai_provider,
            'max_tokens': settings.ai_max_tokens,
            'temperature': settings.ai_temperature
        }
        
        # Test API connectivity jika memungkinkan
        if status['openai_configured']:
            try:
                # Simple test call
                test_response = self.openai_client.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "test"}],
                    max_tokens=1
                )
                status['openai_status'] = 'connected'
            except Exception as e:
                status['openai_status'] = f'error: {str(e)}'
        else:
            status['openai_status'] = 'not_configured'
        
        return status