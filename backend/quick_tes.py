import sys
from pathlib import Path

# Add backend path
current_dir = Path(__file__).parent
backend_dir = current_dir / "backend"
sys.path.insert(0, str(backend_dir))

def test_fixed_methods():
    """Test methods yang sudah di-fix"""
    try:
        from services.ai_service import AIService
        
        ai_service = AIService()
        print("✅ AIService created successfully")
        
        # Test quick insight
        quick_data = {
            'commodity': 'cabai_rawit_merah',
            'current_price': 45000,
            'predicted_price': 47000,
            'days_ahead': 7,
            'change_pct': '+4.4'
        }
        
        quick_result = ai_service.generate_quick_insight(quick_data)
        print(f"✅ Quick insight: {quick_result}")
        
        # Test policy extraction
        sample_insights = """
        TREND: Harga naik 5% 
        FAKTOR: Supply terbatas
        REKOMENDASI: Monitor pasar, koordinasi distributor, siapkan buffer stock
        TIMING: 3-5 hari
        """
        
        policies = ai_service._extract_policy_recommendations(sample_insights)
        print(f"✅ Policy recommendations: {policies}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_fixed_methods()