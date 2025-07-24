// frontend/src/utils/testApiIntegration.js
// Test script untuk memastikan API integration berfungsi

import { apiService, chatWithAI, getAIStatus } from "../services/api";

const runApiIntegrationTest = async () => {
  console.log("🧪 Starting API Integration Test for Chat Interface");
  console.log("================================================");

  const results = {
    tests: [],
    passed: 0,
    failed: 0,
  };

  // Test 1: Health Check
  try {
    console.log("\n🏥 Test 1: Health Check");
    const healthResponse = await apiService.testConnection();

    if (healthResponse.success) {
      console.log("✅ Backend connection: OK");
      results.tests.push({ name: "Health Check", status: "PASSED" });
      results.passed++;
    } else {
      throw new Error("Health check failed");
    }
  } catch (error) {
    console.log("❌ Backend connection: FAILED");
    console.log("Error:", error.message);
    results.tests.push({
      name: "Health Check",
      status: "FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 2: AI Status Check
  try {
    console.log("\n🤖 Test 2: AI Service Status");
    const aiStatus = await getAIStatus();

    if (aiStatus.success) {
      console.log("✅ AI Service status: OK");
      console.log(
        `   OpenAI configured: ${aiStatus.ai_status?.openai_configured}`
      );
      console.log(`   Service health: ${aiStatus.ai_status?.service_health}`);
      results.tests.push({ name: "AI Status Check", status: "PASSED" });
      results.passed++;
    } else {
      throw new Error("AI status check failed");
    }
  } catch (error) {
    console.log("❌ AI Service status: FAILED");
    console.log("Error:", error.message);
    results.tests.push({
      name: "AI Status Check",
      status: "FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 3: Simple Chat Request
  try {
    console.log("\n💬 Test 3: Simple Chat Request");
    const chatResponse = await chatWithAI(
      "Halo, test koneksi chat",
      { test: true },
      "test_conversation_1"
    );

    if (chatResponse.success && chatResponse.response) {
      console.log("✅ Chat request: OK");
      console.log(`   Response length: ${chatResponse.response.length} chars`);
      console.log(
        `   Provider: ${chatResponse.metadata?.provider || "unknown"}`
      );
      results.tests.push({ name: "Simple Chat Request", status: "PASSED" });
      results.passed++;
    } else {
      throw new Error("Chat request failed");
    }
  } catch (error) {
    console.log("❌ Chat request: FAILED");
    console.log("Error:", error.message);
    results.tests.push({
      name: "Simple Chat Request",
      status: "FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 4: Contextual Chat Request
  try {
    console.log("\n🎯 Test 4: Contextual Chat Request");
    const contextualResponse = await apiService.chatWithAI(
      "Bagaimana prediksi harga cabai minggu depan?",
      {
        current_commodity: "cabai_rawit_merah",
        current_region: "jakarta",
        session_type: "test",
      },
      "test_conversation_2"
    );

    if (contextualResponse.success && contextualResponse.response) {
      console.log("✅ Contextual chat: OK");
      console.log(
        `   Context used: ${contextualResponse.context_used || false}`
      );
      console.log(
        `   Response preview: ${contextualResponse.response.substring(
          0,
          100
        )}...`
      );
      results.tests.push({ name: "Contextual Chat Request", status: "PASSED" });
      results.passed++;
    } else {
      throw new Error("Contextual chat failed");
    }
  } catch (error) {
    console.log("❌ Contextual chat: FAILED");
    console.log("Error:", error.message);
    results.tests.push({
      name: "Contextual Chat Request",
      status: "FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 5: All Services Check
  try {
    console.log("\n🔍 Test 5: All Services Check");
    const servicesStatus = await apiService.checkAllServices();

    if (servicesStatus.success) {
      console.log("✅ All services check: OK");
      console.log(`   Backend: ${servicesStatus.services.backend.status}`);
      console.log(`   AI: ${servicesStatus.services.ai.status}`);
      results.tests.push({ name: "All Services Check", status: "PASSED" });
      results.passed++;
    } else {
      throw new Error("Services check failed");
    }
  } catch (error) {
    console.log("❌ All services check: FAILED");
    console.log("Error:", error.message);
    results.tests.push({
      name: "All Services Check",
      status: "FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Summary
  console.log("\n================================================");
  console.log("📋 TEST SUMMARY");
  console.log("================================================");

  results.tests.forEach((test, index) => {
    const status = test.status === "PASSED" ? "✅" : "❌";
    console.log(`${index + 1}. ${test.name}: ${status} ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });

  console.log(
    `\nOverall: ${results.passed}/${results.tests.length} tests passed`
  );

  if (results.passed === results.tests.length) {
    console.log("🎉 All tests passed! Chat interface is ready for production.");
  } else {
    console.log("⚠️ Some tests failed. Please check backend configuration.");
  }

  return results;
};

// Usage in browser console:
// import testApi from './utils/testApiIntegration';
// testApi.runApiIntegrationTest();

export { runApiIntegrationTest };
export default { runApiIntegrationTest };
