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
        
        # Enhanced AI prompt templates untuk natural generation
        self.insights_template = """Anda adalah ekonom senior ahli pangan Indonesia yang memberikan analisis untuk Kantor Staf Presiden.

Analisis data berikut:
- Komoditas: {commodity} di {region}
- Harga saat ini: Rp{current_price:,}
- Prediksi 7 hari: {predictions}
- Tren: {trend_direction} sebesar {total_change_pct}%
- Level risiko: {risk_level}

Berikan analisis profesional dengan struktur:

ANALISIS TREN:
[Jelaskan pergerakan harga dan implikasinya dalam 2-3 kalimat]

FAKTOR UTAMA:
[Identifikasi 2-3 faktor kunci yang mempengaruhi harga]

REKOMENDASI KEBIJAKAN:
[Berikan 3 rekomendasi konkret dan actionable]

WAKTU PELAKSANAAN:
[Tentukan timing dan prioritas tindakan]

Gunakan bahasa profesional namun mudah dipahami. Fokus pada insight yang actionable."""

        self.summary_template = """Berdasarkan prediksi harga {commodity} di {region}:

Data:
- Harga saat ini: Rp{current_price:,}
- Harga prediksi akhir: Rp{final_price:,}
- Perubahan: {change_pct}%
- Volatilitas: {volatility}%
- Level risiko: {risk_level}

Buatlah SUMMARY EKSEKUTIF yang mencakup:
1. Kondisi pasar saat ini (1 kalimat)
2. Proyeksi dan implikasi (2 kalimat) 
3. Rekomendasi utama (1 kalimat actionable)

Tulis dalam bahasa yang jelas dan objektif untuk pengambil kebijakan."""

        self.recommendation_template = """Sebagai penasihat kebijakan pangan, berikan rekomendasi untuk situasi berikut:

Komoditas: {commodity}
Wilayah: {region}
Prediksi harga: {trend_direction} {change_pct}%
Risk level: {risk_level}
Confidence: {confidence}

Berikan 3 REKOMENDASI STRATEGIS:

1. TINDAKAN IMMEDIATE (1-3 hari):
[Aksi cepat yang perlu dilakukan]

2. LANGKAH MEDIUM TERM (1-2 minggu):
[Strategi jangka menengah]

3. ANTISIPASI LONG TERM (1 bulan):
[Persiapan jangka panjang]

Setiap rekomendasi harus spesifik, measurable, dan actionable."""

        self.chat_template = """Anda adalah PANGAN-AI Assistant untuk Kantor Staf Presiden.

KONTEKS SAAT INI:
{context}

PERAN: Berikan insight berbasis data dan rekomendasi kebijakan yang praktis

GAYA KOMUNIKASI:
- Profesional namun accessible
- Data-driven dan objective
- Fokus pada actionable insights
- Bahasa Indonesia yang baik

PERTANYAAN USER: {user_message}

Jawab dalam maksimal 100 kata dengan fokus pada value dan insight praktis."""

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
        """Generate AI insights dengan enhanced generation"""
        try:
            # Create cache key
            cache_key = f"insights_{prediction_data['commodity']}_{prediction_data['region']}_{prediction_data['current_price']}"
            
            # Check cache first
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                logger.info("Using cached insights response")
                return cached_response
            
            # Optimize prompt dengan data yang diperlukan
            prompt_data = {
                'commodity': prediction_data.get('commodity', '').replace('_', ' ').title(),
                'region': prediction_data.get('region', '').replace('_', ' ').title(),
                'current_price': prediction_data.get('current_price', 0),
                'predictions': [f"Rp{p:,.0f}" for p in prediction_data.get('predictions', [])[-3:]],
                'trend_direction': prediction_data.get('trend_analysis', {}).get('direction', 'STABLE'),
                'total_change_pct': prediction_data.get('trend_analysis', {}).get('total_change_pct', 0),
                'risk_level': prediction_data.get('risk_assessment', {}).get('risk_level', 'MEDIUM')
            }
            
            optimized_prompt = self.insights_template.format(**prompt_data)
            
            ai_insights = None
            
            # Try OpenAI first
            if self.openai_client:
                try:
                    response = self.openai_client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "Anda adalah ekonom senior ahli pangan Indonesia dengan pengalaman 15+ tahun menganalisis pasar komoditas untuk pemerintah."},
                            {"role": "user", "content": optimized_prompt}
                        ],
                        max_tokens=400,
                        temperature=0.7
                    )
                    
                    ai_insights = response.choices[0].message.content.strip()
                    logger.info("✅ OpenAI insights generated")
                    
                except Exception as openai_error:
                    logger.error(f"OpenAI error: {str(openai_error)}")
                    ai_insights = None
            
            # Fallback to Anthropic if OpenAI fails
            if not ai_insights and self.anthropic_client:
                try:
                    response = self.anthropic_client.messages.create(
                        model="claude-3-haiku-20240307",
                        max_tokens=400,
                        messages=[
                            {"role": "user", "content": optimized_prompt}
                        ]
                    )
                    ai_insights = response.content[0].text.strip()
                    logger.info("✅ Anthropic insights generated")
                    
                except Exception as anthropic_error:
                    logger.error(f"Anthropic error: {str(anthropic_error)}")
            
            # Generate dynamic fallback jika API gagal
            if not ai_insights:
                ai_insights = self._generate_dynamic_fallback_insights(prediction_data)
                logger.info("Using dynamic fallback insights")
            
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
                    "provider": "openai" if self.openai_client else "anthropic" if self.anthropic_client else "dynamic_fallback"
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
                "fallback_insights": self._generate_dynamic_fallback_insights(prediction_data),
                "policy_recommendations": self._generate_dynamic_recommendations(prediction_data)
            }

    def generate_ai_summary(self, prediction_data: Dict) -> str:
        """Generate AI-powered summary instead of template-based"""
        try:
            prompt_data = {
                'commodity': prediction_data.get('commodity', '').replace('_', ' ').title(),
                'region': prediction_data.get('region', '').replace('_', ' ').title(),
                'current_price': prediction_data.get('current_price', 0),
                'final_price': prediction_data.get('predictions', [])[-1] if prediction_data.get('predictions') else prediction_data.get('current_price', 0),
                'change_pct': prediction_data.get('trend_analysis', {}).get('total_change_pct', 0),
                'volatility': prediction_data.get('trend_analysis', {}).get('volatility_pct', 0),
                'risk_level': prediction_data.get('risk_assessment', {}).get('risk_level', 'MEDIUM')
            }

            prompt = self.summary_template.format(**prompt_data)

            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Anda adalah analis ekonomi senior yang membuat summary eksekutif untuk pengambil kebijakan."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=200,
                    temperature=0.6
                )
                return response.choices[0].message.content.strip()
            
            elif self.anthropic_client:
                response = self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=200,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text.strip()
            
            else:
                return self._generate_dynamic_summary_fallback(prediction_data)

        except Exception as e:
            logger.error(f"AI summary generation error: {str(e)}")
            return self._generate_dynamic_summary_fallback(prediction_data)

    def generate_ai_recommendations(self, prediction_data: Dict) -> List[str]:
        """Generate AI-powered recommendations instead of hardcoded ones"""
        try:
            prompt_data = {
                'commodity': prediction_data.get('commodity', '').replace('_', ' ').title(),
                'region': prediction_data.get('region', '').replace('_', ' ').title(),
                'trend_direction': prediction_data.get('trend_analysis', {}).get('direction', 'STABLE'),
                'change_pct': prediction_data.get('trend_analysis', {}).get('total_change_pct', 0),
                'risk_level': prediction_data.get('risk_assessment', {}).get('risk_level', 'MEDIUM'),
                'confidence': prediction_data.get('confidence_level', 'medium')
            }

            prompt = self.recommendation_template.format(**prompt_data)

            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Anda adalah penasihat kebijakan senior untuk stabilitas harga pangan nasional."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                recommendations_text = response.choices[0].message.content.strip()
                
            elif self.anthropic_client:
                response = self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=300,
                    messages=[{"role": "user", "content": prompt}]
                )
                recommendations_text = response.content[0].text.strip()
            
            else:
                return self._generate_dynamic_recommendations(prediction_data)

            # Extract recommendations dari AI response
            return self._parse_ai_recommendations(recommendations_text)

        except Exception as e:
            logger.error(f"AI recommendations generation error: {str(e)}")
            return self._generate_dynamic_recommendations(prediction_data)

    def _generate_dynamic_fallback_insights(self, prediction_data: Dict) -> str:
        """Generate dynamic fallback ketika API gagal - using contextual logic"""
        commodity = prediction_data.get('commodity', '').replace('_', ' ').title()
        trend = prediction_data.get('trend_analysis', {}).get('direction', 'STABLE')
        change_pct = prediction_data.get('trend_analysis', {}).get('total_change_pct', 0)
        risk_level = prediction_data.get('risk_assessment', {}).get('risk_level', 'MEDIUM')
        
        # Dynamic content based on commodity type
        commodity_context = self._get_commodity_context(commodity)
        trend_impact = self._assess_trend_impact(trend, change_pct)
        regional_factors = self._get_regional_factors(prediction_data.get('region', ''))
        
        insights = f"""ANALISIS TREN:
{trend_impact['description']} {commodity_context['seasonal_note']}

FAKTOR UTAMA:
{commodity_context['main_factors']} {regional_factors} Volatilitas pasar saat ini menunjukkan level {risk_level.lower()}.

REKOMENDASI KEBIJAKAN:
{trend_impact['recommendations']} {commodity_context['specific_actions']}

WAKTU PELAKSANAAN:
{trend_impact['timing']} Monitoring intensif diperlukan dalam 48-72 jam ke depan."""

        return insights

    def _generate_dynamic_summary_fallback(self, prediction_data: Dict) -> str:
        """Generate dynamic summary fallback"""
        commodity = prediction_data.get('commodity', '').replace('_', ' ').title()
        change_pct = prediction_data.get('trend_analysis', {}).get('total_change_pct', 0)
        
        trend_desc = self._get_trend_description(change_pct)
        impact_desc = self._get_impact_description(commodity, change_pct)
        action_desc = self._get_action_description(change_pct)
        
        return f"{trend_desc} {impact_desc} {action_desc}"

    def _generate_dynamic_recommendations(self, prediction_data: Dict) -> List[str]:
        """Generate dynamic recommendations based on context"""
        trend = prediction_data.get('trend_analysis', {}).get('direction', 'STABLE')
        change_pct = prediction_data.get('trend_analysis', {}).get('total_change_pct', 0)
        commodity = prediction_data.get('commodity', '')
        
        recommendations = []
        
        # Immediate actions
        if abs(change_pct) > 15:
            recommendations.append(f"Aktivasi task force stabilisasi harga {commodity.replace('_', ' ')} dalam 24 jam")
        elif abs(change_pct) > 8:
            recommendations.append(f"Intensifkan monitoring supply chain {commodity.replace('_', ' ')} di wilayah utama")
        else:
            recommendations.append(f"Pertahankan monitoring rutin dengan early warning system")
        
        # Strategic actions
        if trend == 'INCREASING':
            recommendations.append("Koordinasi dengan BULOG untuk release buffer stock strategis")
            recommendations.append("Evaluasi kebijakan impor dan distribusi regional")
        elif trend == 'DECREASING':
            recommendations.append("Implementasi program dukungan harga untuk melindungi petani")
            recommendations.append("Eksplorasi peluang ekspor dan diversifikasi pasar")
        else:
            recommendations.append("Fokus pada efisiensi supply chain dan kualitas distribusi")
            recommendations.append("Persiapan contingency plan untuk perubahan mendadak")
        
        return recommendations[:3]

    def _get_commodity_context(self, commodity: str) -> Dict:
        """Get commodity-specific context"""
        commodity_lower = commodity.lower()
        
        if 'cabai' in commodity_lower:
            return {
                'seasonal_note': 'Periode ini merupakan masa kritis mengingat sensitivitas cabai terhadap cuaca.',
                'main_factors': 'Faktor utama meliputi kondisi cuaca ekstrem, siklus panen regional, dan permintaan seasonal.',
                'specific_actions': 'Koordinasi dengan petani cabai di Jawa Barat dan Jawa Tengah untuk memastikan kontinuitas panen.'
            }
        elif 'bawang' in commodity_lower:
            return {
                'seasonal_note': 'Pola harga bawang merah umumnya mengikuti siklus panen tri-wulan.',
                'main_factors': 'Dinamika harga dipengaruhi kondisi panen Brebes, stabilitas impor regional, dan permintaan industri.',
                'specific_actions': 'Evaluasi stok nasional dan kesiapan impor dari India atau Thailand jika diperlukan.'
            }
        else:
            return {
                'seasonal_note': 'Fluktuasi harga mengikuti pola musiman yang perlu dipantau.',
                'main_factors': 'Kondisi supply-demand, faktor cuaca, dan dinamika distribusi regional.',
                'specific_actions': 'Koordinasi multi-stakeholder untuk menjaga stabilitas rantai pasok.'
            }

    def _assess_trend_impact(self, trend: str, change_pct: float) -> Dict:
        """Assess trend impact dengan dynamic description"""
        if trend == 'INCREASING':
            if change_pct > 15:
                return {
                    'description': f'Proyeksi kenaikan harga sebesar {abs(change_pct):.1f}% mengindikasikan tekanan inflasi signifikan yang memerlukan intervensi segera.',
                    'recommendations': 'Implementasi operasi pasar terpadu dengan dukungan stok pemerintah.',
                    'timing': 'Intervensi critical dalam 24-48 jam untuk mencegah spiral inflasi.'
                }
            elif change_pct > 8:
                return {
                    'description': f'Kenaikan moderat {abs(change_pct):.1f}% masih dalam batas toleransi namun perlu diwaspadai.',
                    'recommendations': 'Tingkatkan koordinasi supply chain dan siapkan buffer stock.',
                    'timing': 'Tindakan preventif dalam 3-5 hari ke depan.'
                }
            else:
                return {
                    'description': f'Kenaikan minimal {abs(change_pct):.1f}% masih dalam fluktuasi normal pasar.',
                    'recommendations': 'Pertahankan monitoring dan pastikan distribusi lancar.',
                    'timing': 'Monitoring rutin dengan evaluasi mingguan.'
                }
        elif trend == 'DECREASING':
            if change_pct < -15:
                return {
                    'description': f'Penurunan signifikan {abs(change_pct):.1f}% dapat merugikan petani dan destabilisasi income rural.',
                    'recommendations': 'Aktivasi program dukungan harga dan eksplorasi pasar ekspor.',
                    'timing': 'Intervensi dalam 48 jam untuk melindungi petani.'
                }
            else:
                return {
                    'description': f'Penurunan {abs(change_pct):.1f}% menguntungkan konsumen namun perlu dijaga dampaknya terhadap petani.',
                    'recommendations': 'Monitor welfare petani dan pastikan sustainability produksi.',
                    'timing': 'Evaluasi dampak dalam 1-2 minggu.'
                }
        else:
            return {
                'description': 'Kondisi harga relatif stabil menunjukkan keseimbangan supply-demand yang baik.',
                'recommendations': 'Pertahankan kondisi optimal dan tingkatkan efisiensi sistem.',
                'timing': 'Monitoring berkelanjutan dengan review bulanan.'
            }

    def _get_regional_factors(self, region: str) -> str:
        """Get region-specific factors"""
        region_lower = region.lower() if region else ''
        
        if 'jakarta' in region_lower:
            return "Sebagai pusat konsumsi utama, Jakarta memerlukan stabilitas distribusi dari daerah pemasok."
        elif 'bandung' in region_lower:
            return "Posisi Bandung sebagai hub distribusi Jawa Barat mempengaruhi dinamika regional."
        elif 'surabaya' in region_lower:
            return "Pasar Surabaya mencerminkan kondisi konsumsi Jawa Timur dan Indonesia Timur."
        else:
            return "Kondisi regional perlu diselaraskan dengan dinamika pasar nasional."

    def _get_trend_description(self, change_pct: float) -> str:
        """Generate dynamic trend description"""
        if change_pct > 10:
            return f"Harga mengalami kenaikan signifikan {change_pct:.1f}% yang berpotensi mempengaruhi daya beli masyarakat."
        elif change_pct > 5:
            return f"Tren kenaikan moderat {change_pct:.1f}% masih dalam batas yang dapat dikelola."
        elif change_pct < -10:
            return f"Penurunan harga {abs(change_pct):.1f}% menguntungkan konsumen namun perlu dijaga dampaknya."
        elif change_pct < -5:
            return f"Koreksi harga turun {abs(change_pct):.1f}% menunjukkan rebalancing pasar."
        else:
            return "Kondisi harga cenderung stabil dengan fluktuasi minimal."

    def _get_impact_description(self, commodity: str, change_pct: float) -> str:
        """Generate impact description based on commodity and change"""
        commodity_clean = commodity.replace('_', ' ').title()
        
        if abs(change_pct) > 10:
            return f"Volatilitas {commodity_clean} ini dapat berdampak pada inflasi regional dan nasional."
        elif abs(change_pct) > 5:
            return f"Perubahan harga {commodity_clean} perlu dipantau untuk mencegah efek domino."
        else:
            return f"Stabilitas {commodity_clean} mendukung prediktabilitas inflasi pangan."

    def _get_action_description(self, change_pct: float) -> str:
        """Generate action description based on trend"""
        if abs(change_pct) > 15:
            return "Diperlukan koordinasi lintas kementerian untuk stabilisasi segera."
        elif abs(change_pct) > 8:
            return "Rekomendasi aktivasi mekanisme early warning dan preparedness response."
        else:
            return "Pertahankan kualitas monitoring dan tingkatkan efisiensi distribusi."

    def _parse_ai_recommendations(self, recommendations_text: str) -> List[str]:
        """Parse AI recommendations dari text response"""
        recommendations = []
        
        # Split by numbered items or bullet points
        import re
        
        # Look for numbered recommendations
        numbered_pattern = r'\d+\.\s*([^:]+:?[^\n\d]+)'
        matches = re.findall(numbered_pattern, recommendations_text, re.MULTILINE)
        
        if matches:
            for match in matches:
                clean_rec = match.strip().replace('\n', ' ')[:150]
                if len(clean_rec) > 15:
                    recommendations.append(clean_rec)
        
        # If no numbered items, split by keywords
        if not recommendations:
            sections = re.split(r'(IMMEDIATE|MEDIUM|LONG|SHORT)', recommendations_text)
            for section in sections:
                if len(section) > 20 and not section.isupper():
                    clean_sec = section.strip().replace('\n', ' ')[:150]
                    if clean_sec and len(clean_sec) > 15:
                        recommendations.append(clean_sec)
        
        return recommendations[:3] if recommendations else self._generate_dynamic_recommendations({})

    # Keep existing methods for backward compatibility
    def _extract_policy_recommendations(self, ai_insights: str) -> List[str]:
        """Extract policy recommendations from AI insights"""
        return self._parse_ai_recommendations(ai_insights)

    def _optimize_prompt(self, template: str, data: Dict, max_tokens: int = 100) -> str:
        """Optimize prompt to stay within token limits"""
        try:
            # For the new enhanced templates, we want more detailed prompts
            return template.format(**data)
        except Exception as e:
            logger.error(f"Prompt optimization error: {str(e)}")
            return f"Analisis {data.get('commodity', 'komoditas')} di {data.get('region', 'wilayah')} untuk insight dan rekomendasi kebijakan."

    def _get_cached_response(self, cache_key: str) -> Optional[Dict]:
        """Simple in-memory caching"""
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

    # Enhanced chat functionality dengan AI generation
    def chat_with_ai(self, user_message: str, context: Optional[Dict] = None) -> Dict:
        """Enhanced natural language chat dengan context awareness"""
        try:
            # Validate input length
            if len(user_message) > 500:
                return {
                    "success": False,
                    "error": "Pesan terlalu panjang. Maksimal 500 karakter."
                }
            
            # Prepare enhanced context
            context_str = self._prepare_enhanced_chat_context(context or {})
            
            # Create cache key
            cache_key = f"chat_{hash(user_message + context_str)}"
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                return cached_response
            
            # Enhanced chat prompt
            chat_prompt = self.chat_template.format(
                context=context_str,
                user_message=user_message
            )
            
            if self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Anda adalah PANGAN-AI Assistant dengan expertise dalam analisis pasar komoditas dan kebijakan pangan Indonesia."},
                        {"role": "user", "content": chat_prompt}
                    ],
                    max_tokens=200,
                    temperature=0.8,
                    timeout=10
                )
                
                ai_response = response.choices[0].message.content.strip()
            elif self.anthropic_client:
                response = self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=200,
                    messages=[{"role": "user", "content": chat_prompt}]
                )
                ai_response = response.content[0].text.strip()
            else:
                ai_response = self._generate_enhanced_fallback_chat_response(user_message, context)
            
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
                "fallback_response": self._generate_enhanced_fallback_chat_response(user_message, context)
            }

    def _prepare_enhanced_chat_context(self, context: Dict) -> str:
        """Prepare enhanced context untuk chat prompts"""
        try:
            context_parts = []
            
            if context.get('current_commodity'):
                context_parts.append(f"Sedang menganalisis: {context['current_commodity']}")
            
            if context.get('current_region'):
                context_parts.append(f"Wilayah fokus: {context['current_region']}")
                
            if context.get('last_prediction'):
                pred = context['last_prediction']
                trend = pred.get('trend_analysis', {}).get('direction', 'STABLE')
                context_parts.append(f"Prediksi terakhir: {trend}")
            
            if context.get('alerts'):
                context_parts.append(f"Alert aktif: {len(context['alerts'])} notifikasi")
            
            if context.get('market_conditions'):
                context_parts.append(f"Kondisi pasar: {context['market_conditions']}")
            
            return " | ".join(context_parts) if context_parts else "Sistem prediksi harga pangan PANGAN-AI untuk pengambilan keputusan berbasis data"
            
        except Exception as e:
            logger.error(f"Enhanced context preparation error: {str(e)}")
            return "Sistem prediksi harga pangan PANGAN-AI"

    def _generate_enhanced_fallback_chat_response(self, user_message: str, context: Dict) -> str:
        """Enhanced fallback chat response dengan dynamic content"""
        message_lower = user_message.lower()
        
        # Enhanced keyword detection dengan contextual responses
        if any(word in message_lower for word in ['harga', 'price', 'mahal', 'murah']):
            if context and context.get('current_commodity'):
                commodity = context['current_commodity'].replace('_', ' ').title()
                return f"Analisis harga {commodity} menunjukkan fluktuasi berdasarkan faktor supply-demand, cuaca, dan seasonal patterns. Sistem PANGAN-AI memberikan prediksi akurat untuk 7 hari ke depan dengan confidence level yang tinggi. Silakan akses dashboard untuk detail lengkap dan rekomendasi kebijakan."
            else:
                return "Fluktuasi harga pangan dipengaruhi multiple factors seperti cuaca, distribusi, dan demand seasonal. PANGAN-AI menganalisis 30+ indikator untuk memberikan early warning system. Ada komoditas spesifik yang ingin Anda analisis?"
        
        elif any(word in message_lower for word in ['prediksi', 'forecast', 'ramalan', 'proyeksi']):
            return "Model LSTM PANGAN-AI menggunakan sequence 30 hari untuk prediksi 7 hari ke depan dengan akurasi R² 0.8437. Algoritma mempertimbangkan historical patterns, seasonal trends, dan market volatility. Prediksi dilengkapi confidence interval dan risk assessment untuk decision making yang optimal."
        
        elif any(word in message_lower for word in ['cabai', 'chili', 'lombok']):
            return "Cabai merupakan komoditas highly volatile dengan coefficient of variation tinggi. Faktor cuaca, pest disease, dan harvest timing sangat mempengaruhi price swing. PANGAN-AI tracking cabai rawit merah dan cabai merah keriting dengan granularitas regional. Early warning system dapat detect price spike 2-3 hari sebelumnya."
        
        elif any(word in message_lower for word in ['bawang', 'onion']):
            return "Bawang merah memiliki seasonal pattern yang predictable dengan 3 puncak panen per tahun. Brebes sebagai production center utama mempengaruhi national pricing. Import policy dari India/Thailand menjadi stabilizing factor. PANGAN-AI dapat prediksi optimal timing untuk market intervention."
        
        elif any(word in message_lower for word in ['inflasi', 'inflation']):
            return "Volatile food prices berkontribusi 60-70% terhadap headline inflation Indonesia. PANGAN-AI membantu Bank Indonesia dan Tim Pengendalian Inflasi Daerah (TPID) untuk early detection inflationary pressure. Real-time monitoring mencegah price spiral dan mendukung inflation targeting framework."
        
        elif any(word in message_lower for word in ['rekomendasi', 'saran', 'advice', 'kebijakan', 'policy']):
            return "Rekomendasi kebijakan PANGAN-AI berbasis predictive analytics dengan 3-tier approach: immediate action (1-3 hari), medium-term strategy (1-2 minggu), dan long-term planning (1 bulan). Setiap rekomendasi dilengkapi cost-benefit analysis dan implementation roadmap untuk decision makers."
        
        elif any(word in message_lower for word in ['akurasi', 'accuracy', 'valid']):
            return "Model validation menggunakan walk-forward analysis dengan MAPE <8% untuk mayoritas komoditas. Cross-validation score menunjukkan konsistensi prediksi across different market conditions. Real-time performance monitoring ensures model reliability dan trigger retraining jika accuracy turun."
        
        elif any(word in message_lower for word in ['data', 'sumber', 'source']):
            return "Data sourcing dari multi-channel: harga pasar induk (real-time), data cuaca BMKG, harvest calendar Kementan, import-export statistics, dan consumer price index. Data preprocessing menggunakan outlier detection dan seasonal decomposition untuk ensure quality input ke ML models."
        
        elif any(word in message_lower for word in ['alert', 'warning', 'notif']):
            return "Early warning system beroperasi 24/7 dengan threshold-based alerts: price spike >15% (critical), unusual volatility pattern (warning), dan supply disruption indicators (caution). Push notification ke stakeholders dengan actionable insights dan recommended response timeline."
        
        elif any(word in message_lower for word in ['help', 'bantuan', 'cara', 'how']):
            return "PANGAN-AI menyediakan comprehensive support: dashboard interaktif untuk monitoring, API endpoints untuk integration, export functionality untuk reporting, dan chat assistant untuk real-time consultation. User manual dan training materials tersedia untuk optimal utilization."
        
        else:
            # Contextual default response
            if context and context.get('current_commodity'):
                commodity = context['current_commodity'].replace('_', ' ').title()
                return f"Saya siap membantu analisis {commodity}. Anda dapat menanyakan tentang trend harga, faktor-faktor yang mempengaruhi, rekomendasi kebijakan, atau interpretasi hasil prediksi. Ada aspek spesifik yang ingin Anda dalami?"
            else:
                return "Saya adalah PANGAN-AI Assistant yang dapat membantu analisis prediksi harga, interpretasi trend, risk assessment, dan rekomendasi kebijakan pangan. Silakan specify komoditas atau wilayah yang ingin dianalisis, atau tanyakan tentang methodology dan insights yang tersedia."

    def generate_quick_insight(self, quick_data: Dict) -> str:
        """Generate enhanced quick insight dengan AI-powered analysis"""
        try:
            # Prepare data untuk AI quick insight
            insight_data = {
                'commodity': quick_data.get('commodity', '').replace('_', ' ').title(),
                'current_price': quick_data.get('current_price', 0),
                'predicted_price': quick_data.get('predicted_price', 0),
                'days_ahead': quick_data.get('days_ahead', 7),
                'change_pct': quick_data.get('change_pct', '0.0')
            }
            
            # Enhanced quick insight template
            quick_prompt = f"""Generate quick insight untuk:
{insight_data['commodity']}: Rp{insight_data['current_price']:,} → Rp{insight_data['predicted_price']:,} ({insight_data['days_ahead']} hari)
Perubahan: {insight_data['change_pct']}%

Berikan insight singkat (max 60 kata) yang mencakup:
- Interpretasi trend
- Faktor utama 
- Rekomendasi actionable

Format: [Commodity] mengalami [trend description]. [Key factor]. [Actionable recommendation]."""

            if self.openai_client:
                try:
                    response = self.openai_client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "Anda adalah ekonom ahli yang memberikan quick insights untuk decision makers."},
                            {"role": "user", "content": quick_prompt}
                        ],
                        max_tokens=100,
                        temperature=0.6
                    )
                    return response.choices[0].message.content.strip()
                except Exception:
                    pass
            
            # Fallback ke dynamic generation
            return self._generate_dynamic_quick_insight(insight_data)
            
        except Exception as e:
            logger.error(f"Quick insight error: {str(e)}")
            return f"Quick insight untuk {quick_data.get('commodity', 'komoditas')}: monitoring trend dan analisis detail tersedia melalui dashboard prediksi."

    def _generate_dynamic_quick_insight(self, insight_data: Dict) -> str:
        """Generate dynamic quick insight ketika API tidak tersedia"""
        commodity = insight_data['commodity']
        current_price = insight_data['current_price']
        predicted_price = insight_data['predicted_price']
        change_pct = float(insight_data['change_pct'].replace('%', '')) if isinstance(insight_data['change_pct'], str) else insight_data['change_pct']
        
        # Dynamic trend assessment
        if predicted_price > current_price:
            if change_pct > 10:
                trend_desc = "mengalami kenaikan signifikan"
                factor = "tekanan supply atau lonjakan demand"
                action = "siapkan intervensi stabilisasi segera"
            else:
                trend_desc = "menunjukkan tren kenaikan moderat"
                factor = "seasonal adjustment atau demand normal"
                action = "tingkatkan monitoring supply chain"
        else:
            if abs(change_pct) > 10:
                trend_desc = "mengalami koreksi turun tajam"
                factor = "supply berlebih atau demand lemah"
                action = "implementasi dukungan harga petani"
            else:
                trend_desc = "cenderung turun moderat"
                factor = "rebalancing pasar normal"
                action = "monitor dampak terhadap income petani"
        
        return f"{commodity} {trend_desc} {abs(change_pct):.1f}% karena {factor}. Rekomendasi: {action}."

    def get_ai_service_status(self) -> Dict:
        """Enhanced AI service status dengan detailed health check"""
        
        status = {
            'openai_configured': bool(self.openai_client and settings.openai_api_key),
            'anthropic_configured': bool(hasattr(settings, 'anthropic_api_key') and settings.anthropic_api_key),
            'default_provider': getattr(settings, 'default_ai_provider', 'openai'),
            'max_tokens': getattr(settings, 'ai_max_tokens', 400),
            'temperature': getattr(settings, 'ai_temperature', 0.7),
            'service_health': 'healthy',
            'enhanced_features': {
                'dynamic_insights': True,
                'ai_summaries': True,
                'contextual_recommendations': True,
                'enhanced_chat': True
            }
        }
        
        # Test OpenAI connectivity with enhanced check
        if status['openai_configured']:
            try:
                test_response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "test connection"}],
                    max_tokens=1
                )
                status['openai_status'] = 'connected'
                status['last_test'] = datetime.now().isoformat()
            except Exception as e:
                status['openai_status'] = f'error: {str(e)}'
        else:
            status['openai_status'] = 'not_configured'
        
        # Test Anthropic if configured
        if status['anthropic_configured']:
            try:
                test_response = self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=1,
                    messages=[{"role": "user", "content": "test"}]
                )
                status['anthropic_status'] = 'connected'
            except Exception as e:
                status['anthropic_status'] = f'error: {str(e)}'
        else:
            status['anthropic_status'] = 'not_configured'
        
        return status