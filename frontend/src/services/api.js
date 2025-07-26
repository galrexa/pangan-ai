// File: frontend/src/services/api.js
// FIXED VERSION - Perbaikan parameter mapping

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", error);
    return Promise.reject(error);
  }
);

const apiService = {
  // ===== DATA ENDPOINTS =====
  async getAvailableCommodities() {
    try {
      const response = await apiClient.get("/api/data/commodities");
      return response.data;
    } catch (error) {
      console.error("Error fetching commodities:", error);
      // Fallback untuk demo
      return {
        success: true,
        commodities: [
          {
            value: "Cabai Rawit Merah",
            label: "Cabai Rawit Merah",
            volatility: 15,
          },
          {
            value: "Bawang Merah",
            label: "Bawang Merah",
            volatility: 12,
          },
          {
            value: "Cabai Merah Keriting",
            label: "Cabai Merah Keriting",
            volatility: 18,
          },
          {
            value: "Cabai Merah Besar",
            label: "Cabai Merah Besar",
            volatility: 20,
          },
        ],
      };
    }
  },

  async getAvailableRegions() {
    try {
      const response = await apiClient.get("/api/data/regions");
      return response.data;
    } catch (error) {
      console.error("Error fetching regions:", error);
      // Fallback untuk demo
      return {
        success: true,
        regions: [
          { value: "Kota Bandung", label: "Kota Bandung" },
          { value: "Kabupaten Bogor", label: "Kabupaten Bogor" },
          { value: "Kota Jakarta Pusat", label: "Kota Jakarta Pusat" },
          { value: "Kabupaten Garut", label: "Kabupaten Garut" },
        ],
      };
    }
  },

  // FIXED: Parameter mapping untuk getHistoricalData
  async getHistoricalData(params = {}) {
    try {
      console.log("🔍 Frontend params received:", params);

      // FIXED: Extract both 'wilayah' and 'region' and map properly
      const {
        komoditas, // ← Frontend param
        commodity, // ← Fallback
        wilayah, // ← Frontend param
        region, // ← Fallback
        start_date,
        end_date,
        limit = 1000,
        include_weather,
        include_events,
      } = params;

      // FIXED: Use wilayah first, then region, then default
      const finalCommodity = komoditas || commodity || "all";
      const finalRegion = wilayah || region || "all";

      console.log("🔍 Mapped params:", {
        finalCommodity,
        finalRegion,
        originalWilayah: wilayah,
        originalRegion: region,
      });

      const queryParams = new URLSearchParams({
        commodity: finalCommodity,
        region: finalRegion, // ← Now uses correct mapped value
        limit: limit.toString(),
      });

      if (start_date) queryParams.append("start_date", start_date);
      if (end_date) queryParams.append("end_date", end_date);
      if (include_weather)
        queryParams.append("include_weather", include_weather);
      if (include_events) queryParams.append("include_events", include_events);

      console.log("🔍 Final query params:", queryParams.toString());

      const response = await apiClient.get(
        `/api/data/historical?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw error;
    }
  },

  // ===== PREDICTION ENDPOINTS =====
  async generatePrediction(predictionRequest) {
    try {
      console.log("📤 Sending prediction request:", predictionRequest);

      // Transform formData ke format yang diexpected backend
      const backendRequest = {
        commodity: predictionRequest.komoditas || predictionRequest.commodity,
        region: predictionRequest.wilayah || predictionRequest.region,
        level_harga: predictionRequest.level_harga || "Konsumen",
        days_ahead:
          predictionRequest.prediction_days ||
          predictionRequest.days_ahead ||
          7,
        prediction_length: predictionRequest.prediction_length || 7,
        include_confidence: true,
        model_type: "lstm",
      };

      console.log("📤 Transformed backend request:", backendRequest);

      const response = await apiClient.post("/api/predict", backendRequest);

      console.log("📥 Prediction response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Prediction error:", error);

      // Enhanced error handling
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail;
        if (Array.isArray(detail)) {
          const validationErrors = detail.map((err) => err.msg).join(", ");
          throw new Error(`Validation error: ${validationErrors}`);
        }
      }

      throw error;
    }
  },

  // ===== AI ENDPOINTS =====
  async generateInsights(predictionData) {
    try {
      console.log("🤖 Requesting AI insights for:", predictionData);

      const response = await apiClient.post("/api/ai/insights", {
        prediction_data: predictionData,
        analysis_type: "comprehensive",
        include_recommendations: true,
      });

      console.log("🤖 AI insights response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ AI insights error:", error);

      // Fallback insight untuk demo
      return {
        success: true,
        insights: {
          summary:
            "Analisis prediksi menunjukkan tren harga yang stabil dengan fluktuasi normal.",
          key_points: [
            "Harga diprediksi mengalami kenaikan bertahap",
            "Volatilitas berada dalam batas normal",
            "Faktor musiman berpengaruh signifikan",
          ],
          recommendations: [
            "Pantau perkembangan harga secara berkala",
            "Pertimbangkan intervensi jika volatilitas meningkat",
          ],
          confidence_level: "High",
          analysis_timestamp: new Date().toISOString(),
        },
      };
    }
  },

  async chatWithAI(messages, context = {}) {
    try {
      console.log("💬 Sending chat request:", { messages, context });

      const response = await apiClient.post("/api/ai/chat", {
        messages,
        context,
        max_tokens: 1000,
        temperature: 0.7,
      });

      console.log("💬 Chat response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Chat error:", error);

      // Fallback response untuk demo
      return {
        success: true,
        response:
          "Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.",
        conversation_id: Date.now().toString(),
      };
    }
  },

  // ===== UTILITY ENDPOINTS =====
  async healthCheck() {
    try {
      const response = await apiClient.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "error", message: "Service unavailable" };
    }
  },

  // ===== DATA EXPORT =====
  async exportData(filters, format = "csv") {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        format,
      });

      const response = await apiClient.get(`/api/data/export?${queryParams}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `pangan_data_${new Date().toISOString().split("T")[0]}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "Data exported successfully" };
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  },
};

export default apiService;
