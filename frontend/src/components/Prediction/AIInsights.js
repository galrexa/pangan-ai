import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";
import {
  Insights,
  PriceChange,
  CalendarToday,
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  Flare,
  ArrowUpward, // For price trend naik
  ArrowDownward, // For price trend turun
} from "@mui/icons-material";
// Corrected import path based on your file structure: src/services/api.js
import apiService from "../../services/api";
import dayjs from "dayjs";

// --- GLOBAL VIRTUAL DATE CONFIGURATION ---
// Pastikan ini konsisten dengan DATASET_MAX_DATE di FilterPanel.js
const DATASET_MAX_DATE = "2025-05-31"; // Your dataset's maximum date
const VIRTUAL_TODAY = dayjs(DATASET_MAX_DATE); // The "current" virtual date for predictions

const AIInsights = ({ filters }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to determine the prediction period based on VIRTUAL_TODAY
  const getPredictionPeriod = useCallback(() => {
    const daysToPredict = 7; // You can make this configurable if needed
    const predictionStartDate = VIRTUAL_TODAY.format("YYYY-MM-DD");
    const predictionEndDate = VIRTUAL_TODAY.add(daysToPredict, "day").format(
      "YYYY-MM-DD"
    );
    return { predictionStartDate, predictionEndDate, daysToPredict };
  }, []); // No dependencies as VIRTUAL_TODAY is a constant

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPredictionData(null);
    setAiInsights(null);

    const { predictionStartDate, predictionEndDate, daysToPredict } =
      getPredictionPeriod();

    console.log("🔍 Form Data for Prediction:", filters);
    console.log("🔍 Prediction Period:", {
      predictionStartDate,
      predictionEndDate,
      daysToPredict,
    });

    try {
      // --- 1. Call Prediction API (/predict/) ---
      // IMPORTANT: Adjust these payload keys to match your backend's API specification
      const predictionPayload = {
        komoditas: filters.komoditas,
        wilayah: filters.wilayah, // Expected to be an array, handled in FilterPanel
        start_date: predictionStartDate, // Virtual date as prediction start
        end_date: predictionEndDate, // Virtual date + prediction horizon
        prediction_horizon_days: daysToPredict,
        // Add any other fields your /predict/ endpoint requires (e.g., historical_period_start, historical_period_end)
      };

      console.log("🤖 Attempting to get real price prediction from backend...");
      const predictionResponse = await apiService.generatePrediction(
        predictionPayload
      );
      console.log(
        "✅ Real price prediction received from backend:",
        predictionResponse
      );
      setPredictionData(predictionResponse);

      // --- 2. Call AI Insights API (/ai/insights) ---
      // IMPORTANT: Adjust these payload keys to match your backend's API specification
      const insightPayload = {
        komoditas: filters.komoditas,
        wilayah: filters.wilayah,
        // Insights might need historical context from the filter panel:
        start_date_historical: filters.start_date,
        end_date_historical: filters.end_date,
        // Or if it needs to know the prediction period:
        prediction_start_date: predictionStartDate,
        prediction_end_date: predictionEndDate,
        // Add any other fields your /ai/insights endpoint requires
      };

      console.log("🤖 Attempting to get real AI insights from backend...");
      const insightsResponse = await apiService.getAIInsights(insightPayload);
      console.log(
        "✅ Real AI insights received from backend:",
        insightsResponse
      );
      setAiInsights(insightsResponse);
    } catch (err) {
      console.error("❌ Error fetching AI data:", err);
      setError("Gagal memuat data AI. Silakan coba lagi.");

      // --- Fallback to mock data on error ---
      // Adjust the structure of this mock data to match what your components expect
      setPredictionData({
        price_trend: "stabil", // or "naik", "turun"
        predicted_prices: [
          { date: VIRTUAL_TODAY.format("YYYY-MM-DD"), price: 15000 },
          {
            date: VIRTUAL_TODAY.add(1, "day").format("YYYY-MM-DD"),
            price: 15100,
          },
          {
            date: VIRTUAL_TODAY.add(2, "day").format("YYYY-MM-DD"),
            price: 15150,
          },
          {
            date: VIRTUAL_TODAY.add(3, "day").format("YYYY-MM-DD"),
            price: 15120,
          },
          {
            date: VIRTUAL_TODAY.add(4, "day").format("YYYY-MM-DD"),
            price: 15080,
          },
          {
            date: VIRTUAL_TODAY.add(5, "day").format("YYYY-MM-DD"),
            price: 15050,
          },
          {
            date: VIRTUAL_TODAY.add(6, "day").format("YYYY-MM-DD"),
            price: 15020,
          },
        ],
        // You might add more mock fields like 'confidence_score' etc.
      });
      setAiInsights({
        summary:
          "Ini adalah ringkasan insight mock: Berdasarkan data virtual, harga menunjukkan tren yang stabil dalam seminggu ke depan. Tidak ada faktor eksternal signifikan yang terdeteksi.",
        factors: [
          "Pasokan domestik diperkirakan cukup.",
          "Permintaan pasar cenderung moderat.",
          "Tidak ada perubahan cuaca ekstrem yang diantisipasi.",
        ],
        recommendations: [
          "Pantau terus perkembangan pasokan dari sentra produksi utama.",
          "Pertimbangkan untuk menjaga stok di level normal.",
          "Sesuai prototipe, tanggal prediksi dimulai dari 31 Mei 2025.",
        ],
      });
      console.log("🔄 Using fallback mock prediction and insight data.");
    } finally {
      setLoading(false);
    }
  }, [filters, getPredictionPeriod]); // `getPredictionPeriod` is stable due to useCallback with no deps

  useEffect(() => {
    // Only fetch new insights if filters have genuinely changed
    // We rely on the parent component's onFiltersChange to trigger a re-render
    // of AIInsights with new `filters` prop, then this effect runs.
    fetchInsights();
  }, [filters, fetchInsights]);

  // Helper to display prediction dates
  const renderPredictionDates = () => {
    const { predictionStartDate, predictionEndDate } = getPredictionPeriod();
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Prediksi untuk periode:{" "}
        {dayjs(predictionStartDate).format("DD MMM YYYY")} s/d{" "}
        {dayjs(predictionEndDate).format("DD MMM YYYY")}
      </Typography>
    );
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Insights sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Analisis & Prediksi Harga Pangan
          </Typography>
          <Chip
            icon={<CalendarToday />}
            label={`Data Aktual s/d: ${DATASET_MAX_DATE}`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ ml: 2 }}
          />
        </Box>

        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Memuat prediksi dan insight AI...
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Display data if not loading and data is available OR using fallback */}
        {!loading &&
          (predictionData || aiInsights) && ( // Check for either prediction or insights data
            <Box>
              {/* Price Prediction Section */}
              {predictionData && (
                <>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <PriceChange color="primary" sx={{ mr: 1 }} />
                    Prediksi Harga{" "}
                    {filters.komoditas === "all"
                      ? "Pangan Umum"
                      : filters.komoditas}
                  </Typography>
                  {renderPredictionDates()}

                  <Paper
                    elevation={1}
                    sx={{ p: 2, mt: 2, bgcolor: "primary.50" }}
                  >
                    <Typography variant="h6" color="primary.dark" gutterBottom>
                      Tren Harga Diperkirakan:
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {predictionData.price_trend ? (
                        <Chip
                          label={predictionData.price_trend.toUpperCase()}
                          color={
                            predictionData.price_trend === "naik"
                              ? "error"
                              : predictionData.price_trend === "turun"
                              ? "success"
                              : "info"
                          }
                          icon={
                            predictionData.price_trend === "naik" ? (
                              <ArrowUpward />
                            ) : predictionData.price_trend === "turun" ? (
                              <ArrowDownward />
                            ) : (
                              <InfoOutlined />
                            )
                          }
                          sx={{
                            fontSize: "1.2rem",
                            height: 40,
                            "& .MuiChip-label": { fontWeight: 600 },
                          }}
                        />
                      ) : (
                        "Tidak Diketahui"
                      )}
                    </Typography>
                    {predictionData.predicted_prices &&
                      predictionData.predicted_prices.length > 0 && (
                        <Box>
                          <Typography variant="body1" color="text.secondary">
                            Beberapa perkiraan harga harian:
                          </Typography>
                          <List dense>
                            {predictionData.predicted_prices.slice(0, 4).map(
                              (
                                item,
                                index // Show first 4
                              ) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon>
                                    <CalendarToday sx={{ fontSize: "1rem" }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={`${dayjs(item.date).format(
                                      "DD MMM YYYY"
                                    )}: Rp ${item.price.toLocaleString(
                                      "id-ID"
                                    )}`}
                                  />
                                </ListItem>
                              )
                            )}
                            {predictionData.predicted_prices.length > 4 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 4 }}
                              >
                                ... dan seterusnya untuk{" "}
                                {predictionData.predicted_prices.length - 4}{" "}
                                hari berikutnya.
                              </Typography>
                            )}
                          </List>
                        </Box>
                      )}
                  </Paper>
                </>
              )}

              <Divider sx={{ my: 4 }} />

              {/* AI Insights Section */}
              {aiInsights && (
                <>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Insights color="secondary" sx={{ mr: 1 }} />
                    Insight AI Mendalam
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {aiInsights.summary ||
                        "Tidak ada ringkasan insight tersedia."}
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Faktor-faktor Kunci:
                    </Typography>
                    <List dense>
                      {aiInsights.factors && aiInsights.factors.length > 0 ? (
                        aiInsights.factors.map((factor, index) => (
                          <ListItem key={index} disableGutters>
                            <ListItemIcon>
                              <CheckCircleOutline color="success" />
                            </ListItemIcon>
                            <ListItemText primary={factor} />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <InfoOutlined color="info" />
                          </ListItemIcon>
                          <ListItemText primary="Tidak ada faktor khusus yang teridentifikasi." />
                        </ListItem>
                      )}
                    </List>

                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Rekomendasi:
                    </Typography>
                    <List dense>
                      {aiInsights.recommendations &&
                      aiInsights.recommendations.length > 0 ? (
                        aiInsights.recommendations.map((rec, index) => (
                          <ListItem key={index} disableGutters>
                            <ListItemIcon>
                              <ErrorOutline color="warning" />
                            </ListItemIcon>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <InfoOutlined color="info" />
                          </ListItemIcon>
                          <ListItemText primary="Tidak ada rekomendasi khusus." />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </>
              )}
            </Box>
          )}

        {/* Initial message when no data is loaded yet and no error */}
        {!loading && !predictionData && !aiInsights && !error && (
          <Alert severity="info">
            Pilih filter di atas untuk melihat prediksi dan insight AI.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
