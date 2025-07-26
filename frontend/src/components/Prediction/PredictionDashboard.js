// frontend/src/components/Prediction/PredictionDashboard.js - FIXED VERSION
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  Snackbar,
  Fade,
} from "@mui/material";
import PredictionForm from "./PredictionForm";
import PredictionResults from "./PredictionResults";
import SimplePredictionDebug from "./SimplePredictionDebug";
import SimpleResultsDisplay from "./SimpleResultsDisplay";
import AIInsights from "./AIInsights";
import AIChat from "./AIChat";
import apiService from "../../services/api";

const PredictionDashboard = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Available options for form
  const [availableRegions, setAvailableRegions] = useState([]);
  const [availableCommodities, setAvailableCommodities] = useState([]);

  useEffect(() => {
    loadFormOptions();
  }, []);

  const loadFormOptions = async () => {
    try {
      const [regionsResponse, commoditiesResponse] = await Promise.all([
        apiService.getRegions(),
        apiService.getCommodities(),
      ]);

      setAvailableRegions(regionsResponse.data || []);
      setAvailableCommodities(commoditiesResponse.data || []);
    } catch (err) {
      console.error("Error loading form options:", err);
      // Continue with default options
    }
  };

  const handlePredictionSubmit = async (formValues) => {
    setLoading(true);
    setError(null);
    setFormData(formValues);

    try {
      const response = await apiService.generatePrediction(formValues);
      console.log("📊 Raw API Response:", response);

      // FIXED: Handle direct response structure (no nested .data)
      const processedData = {
        ...response, // Use response directly, not response.data
        request_params: formValues,
      };

      console.log("✅ Processed prediction data:", processedData);
      setPredictionData(processedData);
      setSuccess(true);
    } catch (err) {
      console.error("❌ Error generating prediction:", err);
      setError("Gagal menghasilkan prediksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const generateMockPrediction = (formValues) => {
    const { prediction_days = 7, komoditas } = formValues;
    const basePrice = getBasePriceForCommodity(komoditas);

    // Generate mock historical data
    const historical_data = [];
    for (let i = 30; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      historical_data.push({
        date: date.toISOString().split("T")[0],
        price: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
      });
    }

    // Generate mock predictions
    const predictions = [];
    const confidence_intervals = [];
    let currentPrice = basePrice;

    for (let i = 1; i <= prediction_days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Simulate price changes with some trend
      const change = (Math.random() - 0.5) * 0.05 + 0.001 * i;
      currentPrice = currentPrice * (1 + change);

      const confidence = Math.max(0.7, 0.95 - i * 0.02);
      const margin = currentPrice * (1 - confidence) * 0.5;

      predictions.push({
        date: date.toISOString().split("T")[0],
        predicted_price: currentPrice,
        confidence: confidence * 100,
      });

      confidence_intervals.push({
        date: date.toISOString().split("T")[0],
        lower_bound: currentPrice - margin,
        upper_bound: currentPrice + margin,
      });
    }

    // Calculate statistics
    const finalPrice = predictions[predictions.length - 1].predicted_price;
    const initialPrice = historical_data[historical_data.length - 1].price;
    const changePercent = ((finalPrice - initialPrice) / initialPrice) * 100;

    return {
      success: true,
      historical_data,
      predictions,
      confidence_intervals,
      statistics: {
        current_price: initialPrice,
        final_predicted_price: finalPrice,
        predicted_change_percent: changePercent,
        prediction_period: prediction_days,
      },
      model_info: {
        type: "Hybrid SARIMA-LSTM",
        accuracy: 0.85 + Math.random() * 0.1,
        rmse: Math.random() * 5000 + 2000,
        training_period: "2022-2025",
        last_updated: new Date().toISOString(),
      },
      risk_assessment: {
        level:
          Math.abs(changePercent) > 15
            ? "high"
            : Math.abs(changePercent) > 5
            ? "medium"
            : "low",
        description:
          Math.abs(changePercent) > 15
            ? "Prediksi menunjukkan volatilitas tinggi yang memerlukan monitoring ketat"
            : Math.abs(changePercent) > 5
            ? "Prediksi menunjukkan fluktuasi sedang yang normal untuk komoditas ini"
            : "Prediksi menunjukkan stabilitas harga yang baik",
      },
      request_params: formValues,
    };
  };

  const getBasePriceForCommodity = (commodity) => {
    const basePrices = {
      "Cabai Rawit Merah": 45000,
      "Cabai Merah Keriting": 35000,
      "Bawang Merah": 28000,
    };
    return basePrices[commodity] || 40000;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Price Prediction Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate prediksi harga pangan menggunakan model LSTM dengan
          AI-powered insights
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Prediction Debug */}
        <Grid item xs={12}>
          <SimplePredictionDebug />
        </Grid>
        {/* Prediction Form */}
        <Grid item xs={12}>
          <PredictionForm
            onSubmit={handlePredictionSubmit}
            loading={loading}
            availableRegions={availableRegions}
            availableCommodities={availableCommodities}
          />
        </Grid>

        {/* Debug Info - Remove in production */}
        {predictionData && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Debug:</strong> Prediction data loaded successfully.
                Success: {predictionData.success ? "Yes" : "No"}, Predictions:{" "}
                {predictionData.predictions?.length || 0} items
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Prediction Results */}
        {(predictionData || loading) && (
          <Grid item xs={12}>
            <Fade in timeout={500}>
              <div>
                <SimpleResultsDisplay
                  predictionData={predictionData}
                  loading={loading}
                />
              </div>
            </Fade>
          </Grid>
        )}

        {/* AI Insights and AI Chat */}
        {predictionData && formData && !loading && (
          <>
            <Grid item xs={12} lg={6}>
              <Fade in timeout={800}>
                <div>
                  <AIInsights
                    filters={formData} // FIXED: Pass formData as filters
                    predictionData={predictionData}
                    loading={loading}
                  />
                </div>
              </Fade>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Fade in timeout={1000}>
                <div>
                  <AIChat formData={formData} predictionData={predictionData} />
                </div>
              </Fade>
            </Grid>
          </>
        )}
      </Grid>

      {/* Success/Error Notifications */}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Prediksi berhasil dihasilkan! Scroll ke bawah untuk melihat hasil dan
          AI insights.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PredictionDashboard;
