// frontend/src/components/Prediction/NewPredictionPage.js
// BRAND NEW SIMPLE PREDICTION PAGE
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid, // Ensure Grid is imported
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Slider,
} from "@mui/material";
import { TrendingUp, Assessment, Schedule } from "@mui/icons-material";
import Plot from "react-plotly.js";
import axios from "axios";
import PredictionAdapter from "./PredictionAdapter";
import AIChat from "./AIChat"; // Import AIChat

const NewPredictionPage = () => {
  // VIRTUAL DATE - sesuai dengan dataset terakhir
  const DATASET_MAX_DATE = "2025-05-31"; // Tanggal terakhir di dataset
  const VIRTUAL_TODAY = new Date(DATASET_MAX_DATE); // "Hari ini" virtual

  // State management
  const [commodity, setCommodity] = useState("Cabai Rawit Merah");
  const [region, setRegion] = useState("Kota Bandung");
  const [predictionDays, setPredictionDays] = useState(7); // Slider untuk hari prediksi
  const [historicalDays, setHistoricalDays] = useState(7); // Berapa hari historis yang ditampilkan
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  // const [viewMode, setViewMode] = useState("chart"); // "chart" or "table"

  // Options
  const commodityOptions = ["Cabai Rawit Merah"];

  const regionOptions = [
    "Kabupaten Bogor",
    "Kabupaten Cirebon",
    "Kabupaten Majalengka",
    "Kota Bandung",
  ];

  // API call function dengan historical data yang lebih robust
  const generatePrediction = async () => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      console.log("🚀 Starting prediction request...");

      // Direct API call untuk prediksi
      const response = await axios.post("http://localhost:8000/api/predict/", {
        commodity: commodity,
        region: region,
        days_ahead: predictionDays,
        level_harga: "Konsumen",
        prediction_type: "daily",
        include_confidence: true,
        include_factors: true,
      });

      console.log("✅ API Response received:", response.data);

      // Generate mock historical data berdasarkan current price dan historicalDays
      const mockHistoricalData = generateMockHistorical(
        response.data.current_price || 45000,
        historicalDays // Gunakan nilai dari state historicalDays
      );

      console.log(
        `📊 Generated ${mockHistoricalData.length} days of historical data for ${historicalDays} days setting`
      );

      // Combine prediction dan historical data
      const result = {
        ...response.data,
        historical_data: mockHistoricalData,
      };

      setPredictionResult(result);
    } catch (err) {
      console.error("❌ API Error:", err);
      setError(`Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock historical data yang konsisten berdasarkan virtual date
  const generateMockHistorical = (currentPrice, days) => {
    const historicalData = [];
    const baseDate = new Date(VIRTUAL_TODAY); // Gunakan virtual today

    // Generate data dari (days) hari sebelum virtual today sampai 1 hari sebelum virtual today
    for (let i = days - 1; i >= 0; i--) {
      // ← Ubah ini
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);

      // Generate realistic price variation yang smooth
      // Semakin jauh dari virtual today, semakin bervariasi
      const dayDistance = i / days; // 0 to 1, where 1 is furthest
      const baseVariation = (Math.random() - 0.5) * 0.06 * dayDistance; // Max ±6% untuk hari terjauh
      const smoothing = Math.sin(i * 0.3) * 0.02; // Smooth wave pattern
      const totalVariation = baseVariation + smoothing;

      const price = currentPrice * (1 + totalVariation);

      historicalData.push({
        tanggal: date.toISOString().split("T")[0],
        date: date.toISOString().split("T")[0],
        harga: Math.round(price),
        price: Math.round(price),
      });
    }

    // Sort by date untuk memastikan urutan yang benar
    return historicalData.sort(
      (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
    );
  };

  // Slider marks untuk prediksi hari
  const predictionMarks = [
    { value: 1, label: "1" },
    { value: 3, label: "3" },
    { value: 7, label: "7" },
    { value: 14, label: "14" },
  ];

  // Function untuk update historical data ketika historicalDays berubah
  const updateHistoricalData = () => {
    if (predictionResult && predictionResult.current_price) {
      const updatedHistoricalData = generateMockHistorical(
        predictionResult.current_price,
        historicalDays
      );

      setPredictionResult((prev) => ({
        ...prev,
        historical_data: updatedHistoricalData,
      }));

      console.log(`🔄 Updated historical data to ${historicalDays} days`);
    }
  };

  // Helper functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case "INCREASING":
        return "success";
      case "DECREASING":
        return "error";
      default:
        return "info";
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "LOW":
        return "success";
      case "HIGH":
        return "error";
      default:
        return "warning";
    }
  };

  // Chart rendering function yang lebih robust
  const renderChart = () => {
    if (!predictionResult) return null;

    const {
      historical_data = [],
      predictions = [],
      prediction_dates = [],
    } = predictionResult;

    // Clean dan sort historical data
    const cleanedHistorical = historical_data
      .filter(
        (item) =>
          item && (item.tanggal || item.date) && (item.harga || item.price)
      )
      .sort(
        (a, b) => new Date(a.tanggal || a.date) - new Date(b.tanggal || b.date)
      );

    // Ambil data historis sesuai pilihan user (tidak perlu slice lagi karena sudah di-generate sesuai historicalDays)
    const limitedHistorical = cleanedHistorical;

    // Prepare historical data dengan format yang konsisten
    const historicalDates = limitedHistorical.map(
      (item) => item.tanggal || item.date
    );
    const historicalPrices = limitedHistorical.map(
      (item) => item.harga || item.price
    );

    // Prepare prediction data
    const predictionDatesForChart = prediction_dates;
    const predictionPrices = predictions;

    // Pastikan ada data untuk connection
    const hasHistoricalData =
      historicalDates.length > 0 && historicalPrices.length > 0;
    const hasPredictionData =
      predictionDatesForChart.length > 0 && predictionPrices.length > 0;

    const plotData = [];

    // Historical data trace
    if (hasHistoricalData) {
      plotData.push({
        x: historicalDates,
        y: historicalPrices,
        type: "scatter",
        mode: "lines+markers",
        name: `Data Historis (${historicalDays} hari)`,
        line: {
          color: "#1976d2",
          width: 2,
        },
        marker: {
          size: 4,
          color: "#1976d2",
        },
        hovertemplate: "<b>%{x}</b><br>Harga: Rp %{y:,.0f}<extra></extra>",
      });
    }

    // Connection line (jika ada data historis dan prediksi)
    if (hasHistoricalData && hasPredictionData) {
      const lastHistoricalDate = historicalDates[historicalDates.length - 1];
      const lastHistoricalPrice = historicalPrices[historicalPrices.length - 1];
      const firstPredictionDate = predictionDatesForChart[0];
      const firstPredictionPrice = predictionPrices[0];

      plotData.push({
        x: [lastHistoricalDate, firstPredictionDate],
        y: [lastHistoricalPrice, firstPredictionPrice],
        type: "scatter",
        mode: "lines",
        name: "Transisi",
        line: {
          color: "#666",
          width: 1,
          dash: "dot",
        },
        showlegend: false,
        hoverinfo: "skip",
      });
    }

    // Prediction data trace
    if (hasPredictionData) {
      plotData.push({
        x: predictionDatesForChart,
        y: predictionPrices,
        type: "scatter",
        mode: "lines+markers",
        name: `Prediksi (${predictionDays} hari)`,
        line: {
          color: "#f44336",
          width: 3,
        },
        marker: {
          size: 6,
          symbol: "circle",
          color: "#f44336",
        },
        hovertemplate: "<b>%{x}</b><br>Prediksi: Rp %{y:,.0f}<extra></extra>",
      });
    }

    const layout = {
      title: {
        text: `Prediksi Harga ${commodity} - ${region}`,
        font: { size: 18, family: "Roboto" },
      },
      xaxis: {
        title: "Tanggal",
        type: "date",
        showgrid: true,
        gridcolor: "#f0f0f0",
        tickformat: "%d %b",
      },
      yaxis: {
        title: "Harga (IDR)",
        showgrid: true,
        gridcolor: "#f0f0f0",
        tickformat: ",.0f",
      },
      legend: {
        orientation: "h",
        y: -0.1,
        x: 0.5,
        xanchor: "center",
      },
      hovermode: "x unified",
      plot_bgcolor: "white",
      paper_bgcolor: "white",
      margin: { t: 60, b: 80, l: 80, r: 40 },
      height: 400,
      showlegend: true,
    };

    const config = {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["pan2d", "select2d", "lasso2d", "autoScale2d"],
      responsive: true,
    };

    // Jika tidak ada data, tampilkan pesan
    if (plotData.length === 0) {
      return (
        <Box
          sx={{
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed #ccc",
            borderRadius: 1,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Tidak ada data untuk ditampilkan
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100%", height: 450 }}>
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header dengan virtual date indicator */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          🔮 Prediksi Harga Pangan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Sistem prediksi harga berbasis AI untuk komoditas pangan strategis
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          📅 <strong>Tanggal Virtual:</strong>{" "}
          {VIRTUAL_TODAY.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          (Berdasarkan data terakhir: {DATASET_MAX_DATE})
        </Alert>
      </Box>

      {/* Input Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Assessment sx={{ mr: 1 }} />
            Parameter Prediksi
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Komoditas</InputLabel>
                <Select
                  value={commodity}
                  label="Komoditas"
                  onChange={(e) => setCommodity(e.target.value)}
                >
                  {commodityOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Wilayah</InputLabel>
                <Select
                  value={region}
                  label="Wilayah"
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {regionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ px: 2, py: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Schedule sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="body2" color="text.secondary">
                    Periode Prediksi:
                  </Typography>
                  <Chip
                    label={`${predictionDays} hari`}
                    color="primary"
                    size="small"
                    sx={{ ml: 1, fontWeight: "bold" }}
                  />
                </Box>
                <Slider
                  value={predictionDays}
                  onChange={(e, newValue) => setPredictionDays(newValue)}
                  min={1}
                  max={14}
                  step={1}
                  marks={predictionMarks}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} hari`}
                  sx={{
                    mt: 1,
                    "& .MuiSlider-thumb": {
                      backgroundColor: "primary.main",
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: "primary.main",
                    },
                    "& .MuiSlider-rail": {
                      backgroundColor: "grey.300",
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    1 hari
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    14 hari
                  </Typography>
                </Box>

                {/* Quick preset buttons */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    mt: 1,
                    justifyContent: "center",
                  }}
                >
                  {[3, 7, 14].map((days) => (
                    <Button
                      key={days}
                      size="small"
                      variant={
                        predictionDays === days ? "contained" : "outlined"
                      }
                      onClick={() => setPredictionDays(days)}
                      sx={{ minWidth: "auto", px: 1 }}
                    >
                      {days}d
                    </Button>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            size="large"
            onClick={generatePrediction}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} /> : <TrendingUp />
            }
            sx={{ px: 4 }}
          >
            {loading
              ? "Memproses Prediksi..."
              : `Generate Prediksi ${predictionDays} Hari`}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Results Display */}
      <PredictionAdapter
        predictionData={predictionResult}
        loading={loading}
        error={error}
        commodity={commodity}
        region={region}
        predictionDays={predictionDays}
        historicalDays={historicalDays}
      />

      {/* AI Chat Integration */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <AIChat
            formData={{ komoditas: commodity, wilayah: region }}
            predictionData={predictionResult}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default NewPredictionPage;
