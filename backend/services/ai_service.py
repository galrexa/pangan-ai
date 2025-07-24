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
        self.insights_template = """Analisis prediksi harga {commodity} di {region}:
        Harga: Rp{current_price} → Rp{predictions} ({trend_direction} {total_change_pct}%)

        Berikan:
        1. TREND: [30 kata]
        2. FAKTOR: [30 kata] 
        3. REKOMENDASI: [40 kata]
        4. TIMING: [20 kata]

        Total maks 120 kata."""

        self.chat_template = """PANGAN-AI Assistant untuk KSP.
        KONTEKS: {context}

        Jawab dalam 80 kata:
        - Data-driven insight
        - Rekomendasi kebijakan
        - Bahasa profesional

        PERTANYAAN: {user_message}"""

        self.quick_template = """{commodity}: Rp{current_price} → Rp{predicted_price} ({days_ahead} hari)
        Perubahan: {change_pct}%

        Insight singkat (50 kata): trend, faktor, rekomendasi."""
    
    def _setup_ai_clients(self):
        """Setup AI clients dengan proper version handling"""
        try:
            # Setup OpenAI client (v1.0+ compatible)
            if settings.openai_api_key:
                import openai
                self.openai_client = openai.OpenAI(
                    api_key=settings.openai_api_key,
                    timeout=30.0
                )
                logger.info("✅ OpenAI client initialized (v1.0+)")
            else:
                logger.warning("⚠️ OpenAI API key not found")
                
        except ImportError:
            logger.error("❌ OpenAI library not installed")
        except Exception as e:
            logger.error(f"❌ OpenAI setup error: {str(e)}")
            
        # Setup Anthropic client (fallback)
        try:
            if hasattr(settings, 'anthropic_api_key') and settings.anthropic_api_key:
                import anthropic
                self.anthropic_client = anthropic.Anthropic(
                    api_key=settings.anthropic_api_key
                )
                logger.info("✅ Anthropic client initialized")
        except ImportError:
            logger.warning("⚠️ Anthropic library not available")
        except Exception as e:
            logger.error(f"❌ Anthropic setup error: {str(e)}")
    
    def generate_prediction_insights(self, prediction_data: Dict) -> Dict:
        """Generate AI insights dengan proper error handling"""
        try:
            # Create cache key
            cache_key = f"insights_{prediction_data['commodity']}_{prediction_data['region']}_{prediction_data['current_price']}"
            
            # Check cache first
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                logger.info("Using cached insights response")
                return cached_response
            
            # Optimize prompt
            optimized_prompt = self._optimize_prompt(self.insights_template, prediction_data, max_tokens=90)
            
            ai_insights = None
            
            # Try OpenAI first
            if self.openai_client:
                try:
                    response = self.openai_client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "Anda adalah ekonom ahli pangan Indonesia. Jawab singkat dan tepat."},
                            {"role": "user", "content": optimized_prompt}
                        ],
                        max_tokens=200,
                        temperature=0.7
                    )
                    
                    ai_insights = response.choices[0].message.content.strip()
                    logger.info("✅ OpenAI response received")
                    
                except Exception as openai_error:
                    logger.error(f"OpenAI error: {str(openai_error)}")
                    ai_insights = None
            
            # Fallback to Anthropic if OpenAI fails
            if not ai_insights and self.anthropic_client:
                try:
                    response = self.anthropic_client.messages.create(
                        model="claude-3-haiku-20240307",
                        max_tokens=200,
                        messages=[
                            {"role": "user", "content": optimized_prompt}
                        ]
                    )
                    ai_insights = response.content[0].text.strip()
                    logger.info("✅ Anthropic response received")
                    
                except Exception as anthropic_error:
                    logger.error(f"Anthropic error: {str(anthropic_error)}")
            
            # Final fallback
            if not ai_insights:
                ai_insights = self._generate_fallback_insights(prediction_data)
                logger.info("Using fallback insights")
            
            result = {
                "success": True,
                "insights": ai_insights,
                "trend_analysis": prediction_data.get('trend_analysis', {}),
                "risk_assessment": prediction_data.get('risk_assessment', {}),
                "policy_recommendations": self._extract_policy_recommendations(ai_insights),
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "tokens_used": len(optimized_prompt.split()) + len(ai_insights.split()),
                    "cached": False,
                    "provider": "openai" if self.openai_client else "anthropic" if self.anthropic_client else "fallback"
                }
            }
            
            # Cache response
            self._cache_response(cache_key, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_insights": self._generate_fallback_insights(prediction_data),
                "policy_recommendations": ["Monitor pasar berkelanjutan", "Koordinasi supply chain", "Siapkan intervensi"]
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
        """Fallback insights ketika API gagal"""
        commodity = prediction_data.get('commodity', 'komoditas')
        trend = prediction_data.get('trend_analysis', {}).get('direction', 'STABLE')
        change_pct = prediction_data.get('trend_analysis', {}).get('total_change_pct', 0)
        
        if trend == 'INCREASING':
            return f"""TREND: Harga {commodity} diprediksi naik {abs(change_pct):.1f}% dalam 7 hari ke depan.
    FAKTOR: Kemungkinan disebabkan musim, permintaan tinggi, atau gangguan supply chain.
    REKOMENDASI: Monitoring ketat pasar, siapkan buffer stock, koordinasi dengan distributor.
    TIMING: Intervensi sebaiknya dilakukan dalam 2-3 hari ke depan."""
        else:
            return f"""TREND: Harga {commodity} diprediksi turun {abs(change_pct):.1f}% dalam 7 hari ke depan.
    FAKTOR: Kemungkinan supply berlebih, panen raya, atau menurunnya permintaan.
    REKOMENDASI: Dukung petani, buka ekspor, program stabilisasi harga.
    TIMING: Monitor hingga harga stabil dalam 5-7 hari."""

    def generate_quick_insight(self, quick_data: Dict) -> str:
        """Generate quick insight from simple prediction data"""
        try:
            commodity = quick_data.get('commodity', '').replace('_', ' ').title()
            current_price = quick_data.get('current_price', 0)
            predicted_price = quick_data.get('predicted_price', 0)
            days_ahead = quick_data.get('days_ahead', 7)
            change_pct = quick_data.get('change_pct', '0.0')
            
            # Determine trend and recommendations
            if predicted_price > current_price:
                trend = "naik"
                impact = "permintaan tinggi atau supply terbatas"
                action = "siapkan buffer stock, koordinasi distributor"
            else:
                trend = "turun"  
                impact = "supply berlebih atau permintaan menurun"
                action = "dukung petani, buka peluang ekspor"
            
            insight = f"{commodity}: Rp{current_price:,.0f} → Rp{predicted_price:,.0f} ({days_ahead} hari). Trend {trend} {change_pct}% karena {impact}. Rekomendasi: {action}."
            
            return insight
            
        except Exception as e:
            logger.error(f"Quick insight error: {str(e)}")
            return f"Quick insight untuk {quick_data.get('commodity', 'komoditas')}: analisis trend dan rekomendasi tersedia melalui dashboard utama."
    #new
    def _extract_policy_recommendations(self, ai_insights: str) -> List[str]:
        """Extract policy recommendations from AI insights"""
        recommendations = []
        
        try:
            # Simple extraction based on keywords dan patterns
            lines = ai_insights.split('\n')
            for line in lines:
                line = line.strip()
                if any(keyword in line.lower() for keyword in ['rekomendasi', 'saran', 'kebijakan', 'policy']):
                    # Clean up the line
                    clean_line = line.replace('REKOMENDASI:', '').replace('3.', '').replace('-', '').strip()
                    if clean_line and len(clean_line) > 10:
                        recommendations.append(clean_line[:100])  # Limit length
            
            # Extract numbered recommendations
            import re
            numbered_pattern = r'\d+\.\s*(.+?)(?=\d+\.|$)'
            matches = re.findall(numbered_pattern, ai_insights, re.DOTALL)
            for match in matches:
                clean_match = match.strip().replace('\n', ' ')[:100]
                if len(clean_match) > 10 and clean_match not in recommendations:
                    recommendations.append(clean_match)
            
            # Fallback recommendations if none found
            if not recommendations:
                recommendations = [
                    "Monitor pasar secara berkelanjutan untuk deteksi dini fluktuasi",
                    "Koordinasi dengan distributor dan supplier utama", 
                    "Siapkan buffer stock dan mekanisme intervensi"
                ]
            
            return recommendations[:3]  # Max 3 recommendations
            
        except Exception as e:
            logger.error(f"Policy extraction error: {str(e)}")
            return [
                "Monitor pasar berkelanjutan",
                "Koordinasi supply chain", 
                "Siapkan intervensi tepat waktu"
            ]
    #new
    def _optimize_prompt(self, template: str, data: Dict, max_tokens: int = 100) -> str:
        """Optimize prompt to stay within token limits"""
        try:
            # Compress data untuk efficient prompting
            compressed_data = {
                'commodity': data.get('commodity', '').replace('_', ' ').title(),
                'region': data.get('region', '').replace('_', ' ').title(),
                'current_price': f"{data.get('current_price', 0):,.0f}",
                'predictions': [f"{p:,.0f}" for p in data.get('predictions', [])[-3:]],  # Only last 3
                'trend_direction': data.get('trend_analysis', {}).get('direction', 'STABLE'),
                'total_change_pct': f"{data.get('trend_analysis', {}).get('total_change_pct', 0):.1f}",
                'risk_level': data.get('risk_assessment', {}).get('risk_level', 'MEDIUM')
            }
            
            optimized_prompt = template.format(**compressed_data)
            
            # Truncate if still too long
            words = optimized_prompt.split()
            if len(words) > max_tokens:
                words = words[:max_tokens-10]
                optimized_prompt = ' '.join(words) + "..."
            
            return optimized_prompt
            
        except Exception as e:
            logger.error(f"Prompt optimization error: {str(e)}")
            return f"Analisis {data.get('commodity', 'komoditas')} di {data.get('region', 'wilayah')} untuk insight dan rekomendasi kebijakan."
    #new
    def _get_cached_response(self, cache_key: str) -> Optional[Dict]:
        """Simple in-memory caching untuk demo scenarios"""
        if not hasattr(self, '_response_cache'):
            self._response_cache = {}
        
        return self._response_cache.get(cache_key)

    def _prepare_chat_context(self, context: Dict) -> str:
        """Prepare context untuk chat prompts"""
        try:
            context_parts = []
            
            if context.get('current_commodity'):
                context_parts.append(f"Komoditas: {context['current_commodity']}")
            
            if context.get('current_region'):
                context_parts.append(f"Wilayah: {context['current_region']}")
                
            if context.get('last_prediction'):
                pred = context['last_prediction']
                context_parts.append(f"Prediksi terakhir: {pred.get('trend_analysis', {}).get('direction', 'STABLE')}")
            
            return " | ".join(context_parts) if context_parts else "Sistem prediksi harga pangan PANGAN-AI"
            
        except Exception as e:
            logger.error(f"Context preparation error: {str(e)}")
            return "Sistem prediksi harga pangan"

    def _generate_fallback_chat_response(self, user_message: str, context: Dict) -> str:
        """Fallback chat response"""
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ['harga', 'price', 'mahal', 'murah']):
            return "Berdasarkan data PANGAN-AI, fluktuasi harga dipengaruhi faktor musim, supply-demand, dan kondisi cuaca. Silakan cek dashboard prediksi untuk insight detail."
        elif any(word in message_lower for word in ['prediksi', 'forecast', 'ramalan']):
            return "Sistem prediksi PANGAN-AI menggunakan LSTM untuk proyeksi 7 hari ke depan dengan akurasi tinggi. Akses menu Prediction untuk detail lengkap."
        elif any(word in message_lower for word in ['kebijakan', 'rekomendasi', 'saran']):
            return "Rekomendasi kebijakan tersedia di setiap hasil prediksi. Umumnya meliputi monitoring pasar, koordinasi supply chain, dan timing intervensi yang tepat."
        else:
            return "Terima kasih. Silakan spesifikkan pertanyaan tentang prediksi harga, analisis trend, atau rekomendasi kebijakan pangan."
    
    def chat_with_ai(self, user_message: str, context: Optional[Dict] = None) -> Dict:
        """Natural language chat dengan context awareness"""
        try:
            # Validate input length
            if len(user_message) > 500:
                return {
                    "success": False,
                    "error": "Pesan terlalu panjang. Maksimal 500 karakter."
                }
            
            # Prepare context
            context_str = self._prepare_chat_context(context or {})
            
            # Create cache key
            cache_key = f"chat_{hash(user_message + context_str)}"
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                return cached_response
            
            # Optimize prompt
            chat_prompt = self.chat_template.format(
                context=context_str[:200],  # Limit context
                user_message=user_message
            )
            
            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "PANGAN-AI Assistant: jawab singkat, akurat, profesional."},
                        {"role": "user", "content": chat_prompt}
                    ],
                    max_tokens=150,
                    temperature=0.8,
                    timeout=10
                )
                
                ai_response = response.choices[0].message.content.strip()
            else:
                ai_response = self._generate_fallback_chat_response(user_message, context)
            
            result = {
                "success": True,
                "response": ai_response,
                "context_used": bool(context),
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "input_length": len(user_message),
                    "output_length": len(ai_response),
                    "cached": False
                }
            }
            
            self._cache_response(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_response": "Maaf, terjadi kesalahan. Silakan coba lagi."
            }

    def _get_cached_response(self, cache_key: str) -> Optional[Dict]:
        """Simple in-memory caching untuk demo scenarios"""
        if not hasattr(self, '_response_cache'):
            self._response_cache = {}
        
        return self._response_cache.get(cache_key)

    def _cache_response(self, cache_key: str, response: Dict):
        """Cache response untuk efficiency"""
        if not hasattr(self, '_response_cache'):
            self._response_cache = {}
        
        # Keep only last 20 responses
        if len(self._response_cache) > 20:
            oldest_key = list(self._response_cache.keys())[0]
            del self._response_cache[oldest_key]
        
        self._response_cache[cache_key] = response

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
        """Get status AI services dengan proper error handling"""
        
        status = {
            'openai_configured': bool(self.openai_client and settings.openai_api_key),
            'anthropic_configured': bool(hasattr(settings, 'anthropic_api_key') and settings.anthropic_api_key),
            'default_provider': getattr(settings, 'default_ai_provider', 'openai'),
            'max_tokens': getattr(settings, 'ai_max_tokens', 200),
            'temperature': getattr(settings, 'ai_temperature', 0.3),
            'service_health': 'healthy'
        }
        
        # Test OpenAI connectivity if configured
        if status['openai_configured']:
            try:
                # Test dengan OpenAI v1.0+ syntax
                test_response = self.openai_client.chat.completions.create(
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