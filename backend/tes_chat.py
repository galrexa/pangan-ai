# test_chat_integration.py
"""
Test script untuk uji coba ChatGPT integration di PANGAN-AI
Run this script untuk test chat functionality sebelum implementasi frontend
"""

import sys
import os
from pathlib import Path
import asyncio
import json
from datetime import datetime

# Add backend path
current_dir = Path(__file__).parent
backend_dir = current_dir / "backend"
sys.path.insert(0, str(backend_dir))

def test_ai_service():
    """Test AIService class functionality"""
    print("🧪 Testing AIService Integration...")
    print("=" * 50)
    
    try:
        from services.ai_service import AIService
        
        # Initialize AI service
        ai_service = AIService()
        print("✅ AIService initialized successfully")
        
        # Test 1: Generate Prediction Insights
        print("\n📊 Test 1: Prediction Insights")
        print("-" * 30)
        
        sample_prediction_data = {
            'commodity': 'cabai_rawit_merah',
            'region': 'kabupaten_bogor',
            'current_price': 45000,
            'predictions': [46000, 47500, 48000, 47000, 46500, 45500, 44000],
            'trend_analysis': {
                'direction': 'DECREASING',
                'total_change_pct': -2.2
            },
            'risk_assessment': {
                'risk_level': 'MEDIUM'
            }
        }
        
        insights_result = ai_service.generate_prediction_insights(sample_prediction_data)
        print(f"Success: {insights_result.get('success')}")
        print(f"Insights: {insights_result.get('insights', 'No insights')[:200]}...")
        
        if insights_result.get('metadata'):
            print(f"Tokens used: {insights_result['metadata'].get('tokens_used')}")
        
        # Test 2: Chat Interface
        print("\n💬 Test 2: Chat Interface")
        print("-" * 30)
        
        test_messages = [
            "Bagaimana trend harga cabai bulan ini?",
            "Kapan waktu terbaik untuk intervensi harga bawang merah?",
            "Apa rekomendasi kebijakan untuk stabilisasi harga pangan?"
        ]
        
        for i, message in enumerate(test_messages, 1):
            print(f"\nTest Chat {i}:")
            print(f"User: {message}")
            
            chat_result = ai_service.chat_with_ai(
                user_message=message,
                context={
                    'current_commodity': 'cabai_rawit_merah',
                    'current_region': 'kabupaten_bogor',
                    'last_prediction': sample_prediction_data
                }
            )
            
            print(f"Success: {chat_result.get('success')}")
            print(f"Response: {chat_result.get('response', 'No response')}")
            
            if chat_result.get('metadata'):
                meta = chat_result['metadata']
                print(f"Input length: {meta.get('input_length')}, Output length: {meta.get('output_length')}")
        
        # Test 3: Quick Insight
        print("\n⚡ Test 3: Quick Insight")
        print("-" * 30)
        
        quick_data = {
            'commodity': 'bawang_merah',
            'current_price': 25000,
            'predicted_price': 27500,
            'days_ahead': 7,
            'change_pct': '+10.0'
        }
        
        quick_result = ai_service.generate_quick_insight(quick_data)
        print(f"Quick insight: {quick_result}")
        
        # Test 4: Service Status
        print("\n🔍 Test 4: Service Status")
        print("-" * 30)
        
        status = ai_service.get_ai_service_status()
        print(f"OpenAI configured: {status.get('openai_configured')}")
        print(f"Service health: {status.get('service_health')}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure to run this from backend directory or check PYTHONPATH")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints using requests"""
    print("\n🌐 Testing API Endpoints...")
    print("=" * 50)
    
    try:
        import requests
        
        base_url = "http://localhost:8000"
        
        # Test 1: Health check
        print("\n🏥 Test 1: Health Check")
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Health check failed: {e}")
            print("Make sure FastAPI server is running: uvicorn app:app --reload")
            return False
        
        # Test 2: AI Status
        print("\n🤖 Test 2: AI Status")
        try:
            response = requests.get(f"{base_url}/api/ai/status", timeout=10)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"AI Status: {json.dumps(data, indent=2)}")
            else:
                print(f"Response: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ AI status failed: {e}")
        
        # Test 3: Chat Endpoint
        print("\n💬 Test 3: Chat Endpoint")
        chat_payload = {
            "message": "Bagaimana prediksi harga cabai minggu depan?",
            "context": {
                "current_commodity": "cabai_rawit_merah",
                "current_region": "jakarta"
            },
            "conversation_id": "test_conversation_1"
        }
        
        try:
            response = requests.post(
                f"{base_url}/api/ai/chat", 
                json=chat_payload,
                timeout=15
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Chat Response: {json.dumps(data, indent=2)}")
            else:
                print(f"Error Response: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Chat endpoint failed: {e}")
        
        # Test 4: Quick Insight Endpoint
        print("\n⚡ Test 4: Quick Insight Endpoint")
        try:
            params = {
                "commodity": "bawang_merah",
                "current_price": 30000,
                "predicted_price": 33000,
                "days_ahead": 7
            }
            
            response = requests.post(
                f"{base_url}/api/ai/quick-insight",
                params=params,
                timeout=10
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Quick Insight: {json.dumps(data, indent=2)}")
            else:
                print(f"Error Response: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Quick insight failed: {e}")
        
        return True
        
    except ImportError:
        print("❌ requests library not installed")
        print("Install with: pip install requests")
        return False

def run_interactive_chat():
    """Interactive chat test"""
    print("\n🗨️  Interactive Chat Test")
    print("=" * 50)
    print("Type 'quit' to exit, 'help' for commands")
    
    try:
        from services.ai_service import AIService
        ai_service = AIService()
        
        context = {
            'current_commodity': 'cabai_rawit_merah',
            'current_region': 'jakarta',
            'session_start': datetime.now().isoformat()
        }
        
        while True:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("👋 Goodbye!")
                break
            elif user_input.lower() == 'help':
                print("""
Available commands:
- quit/exit/bye: Exit chat
- help: Show this help
- status: Show AI service status
- context: Show current context

Try asking about:
- Prediksi harga komoditas
- Rekomendasi kebijakan
- Analisis trend harga
                """)
                continue
            elif user_input.lower() == 'status':
                status = ai_service.get_ai_service_status()
                print(f"AI Status: {json.dumps(status, indent=2)}")
                continue
            elif user_input.lower() == 'context':
                print(f"Current context: {json.dumps(context, indent=2)}")
                continue
            elif not user_input:
                continue
            
            print("🤖 Thinking...")
            
            result = ai_service.chat_with_ai(user_input, context)
            
            if result.get('success'):
                print(f"Bot: {result.get('response')}")
                
                if result.get('metadata'):
                    meta = result['metadata']
                    print(f"📊 Tokens: {meta.get('input_length', 0)} → {meta.get('output_length', 0)}")
            else:
                print(f"❌ Error: {result.get('error')}")
                if result.get('fallback_response'):
                    print(f"Fallback: {result.get('fallback_response')}")
    
    except ImportError as e:
        print(f"❌ Cannot start interactive chat: {e}")
    except KeyboardInterrupt:
        print("\n👋 Chat interrupted. Goodbye!")

def main():
    """Main test runner"""
    print("🚀 PANGAN-AI Chat Integration Test")
    print("=" * 60)
    print(f"Test started at: {datetime.now()}")
    
    # Test sequence
    tests = [
        ("Direct AIService Test", test_ai_service),
        ("API Endpoints Test", test_api_endpoints),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print(f"\n{'='*60}")
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    for test_name, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! Chat integration is ready.")
        
        # Offer interactive chat
        choice = input("\nWant to try interactive chat? (y/n): ").strip().lower()
        if choice in ['y', 'yes']:
            run_interactive_chat()
    else:
        print("⚠️  Some tests failed. Please check the configuration.")
        print("\nTroubleshooting tips:")
        print("1. Make sure FastAPI server is running: uvicorn app:app --reload")
        print("2. Check OpenAI API key in .env file")
        print("3. Verify all dependencies are installed")

if __name__ == "__main__":
    main()