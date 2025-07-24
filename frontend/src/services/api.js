import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: () => apiClient.get("/health"),

  // Data endpoints
  getCommodities: () => apiClient.get("/api/data/commodities"),
  getRegions: () => apiClient.get("/api/data/regions"),
  getPriceLevels: () => apiClient.get("/api/data/price-levels"),

  // Historical data with enhanced filters
  getHistoricalData: (params) => {
    const {
      komoditas,
      wilayah,
      level_harga,
      start_date,
      end_date,
      include_weather = true,
      include_events = true,
    } = params;

    return apiClient.get("/api/data/historical", {
      params: {
        komoditas,
        wilayah,
        level_harga,
        start_date,
        end_date,
        include_weather,
        include_events,
      },
    });
  },

  // Weather correlation analysis
  getWeatherCorrelation: (params) =>
    apiClient.get("/api/data/weather-correlation", { params }),

  // Event impact analysis
  getEventImpact: (params) =>
    apiClient.get("/api/data/event-impact", { params }),

  // Prediction endpoints
  generatePrediction: (data) => {
    const {
      komoditas,
      wilayah,
      level_harga = "Konsumen",
      prediction_days = 7,
      include_weather_forecast = true,
    } = data;

    return apiClient.post("/api/predict", {
      komoditas,
      wilayah,
      level_harga,
      prediction_days,
      include_weather_forecast,
    });
  },

  // AI endpoints
  getAIInsights: (data) => apiClient.post("/api/ai/insights", data),
  chatWithAI: (data) => apiClient.post("/api/ai/chat", data),
};

export default apiClient;
