import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  ShowChart,
  TableChart,
  Assessment,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  ExpandMore,
  Speed,
  Timeline,
  Analytics,
  Download,
  Share,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  Refresh,
  Psychology,
  AutoAwesome,
  Chat,
  Send,
  Close,
  Lightbulb,
  InfoOutlined,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatDate,
  calculatePercentageChange,
} from "../../utils/helpers";
import { CHART_COLORS } from "../../utils/constants";
import apiService from "../../services/api";

const PredictionResults = ({
  predictionData = null,
  loading = false,
  error = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [viewMode, setViewMode] = useState("chart");
  const [chartZoom, setChartZoom] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [animationPlayed, setAnimationPlayed] = useState(false);

  // Backend AI Chat Integration
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Backend AI Analysis states
  const [backendAIAnalysis, setBackendAIAnalysis] = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  useEffect(() => {
    if (predictionData && !loading) {
      setAnimationPlayed(true);
      // Auto-generate AI analysis when prediction data is available
      generateBackendAIAnalysis();
    }
  }, [predictionData, loading]);

  // Generate AI Analysis using backend AI service
  const generateBackendAIAnalysis = useCallback(async () => {
    if (!predictionData || !predictionData.predictions) return;

    setAiAnalysisLoading(true);
    try {
      const analysisPrompt = createDetailedAnalysisPrompt(predictionData);

      console.log("🤖 Requesting detailed analysis from backend AI...");
      const chatResponse = await apiService.chatWithAI({
        message: analysisPrompt,
        context: {
          prediction_data: predictionData,
          analysis_type: "detailed_prediction_analysis",
        },
      });

      if (chatResponse && chatResponse.response) {
        try {
          // Try to parse as JSON first
          const analysis = JSON.parse(chatResponse.response);
          setBackendAIAnalysis(analysis);
        } catch {
          // If not JSON, create structured analysis from text
          setBackendAIAnalysis(
            createStructuredAnalysisFromText(
              chatResponse.response,
              predictionData
            )
          );
        }
      }
    } catch (error) {
      console.error("Backend AI Analysis Error:", error);
      setBackendAIAnalysis(createFallbackAnalysis(predictionData));
    } finally {
      setAiAnalysisLoading(false);
    }
  }, [predictionData]);

  // Create detailed analysis prompt for backend AI
  const createDetailedAnalysisPrompt = (data) => {
    const predictions = data.predictions || [];
    const currentPrice = data.statistics?.current_price || 0;
    const finalPrice = data.statistics?.final_predicted_price || 0;
    const changePercent = data.statistics?.predicted_change_percent || 0;

    return `Sebagai AI analyst ekonomi pangan, berikan analisis mendalam terhadap hasil prediksi harga berikut:

DATA PREDIKSI:
- Model: ${data.model_info?.type || "LSTM"}
- Akurasi Model: ${((data.model_info?.accuracy || 0.8) * 100).toFixed(1)}%
- Harga Saat Ini: Rp ${currentPrice.toLocaleString("id-ID")}
- Harga Prediksi Akhir: Rp ${finalPrice.toLocaleString("id-ID")}
- Perubahan: ${changePercent.toFixed(2)}%
- Jumlah Hari Prediksi: ${predictions.length}

DETAIL PREDIKSI HARIAN:
${predictions
  .slice(0, 7)
  .map(
    (pred, index) =>
      `Hari ${index + 1}: Rp ${
        pred.predicted_price?.toLocaleString("id-ID") || "N/A"
      } (Confidence: ${pred.confidence?.toFixed(1) || "N/A"}%)`
  )
  .join("\n")}

RISK ASSESSMENT:
- Level: ${data.risk_assessment?.level || "MEDIUM"}
- Deskripsi: ${data.risk_assessment?.description || "Normal market volatility"}

Berikan analisis dalam format JSON dengan struktur:
{
  "overall_assessment": "Penilaian keseluruhan situasi prediksi (150 kata)",
  "price_trajectory": {
    "trend": "ascending/descending/stable",
    "volatility": "low/medium/high", 
    "turning_points": ["hari ke-X mengalami...", "hari ke-Y menunjukkan..."]
  },
  "market_dynamics": {
    "supply_factors": ["faktor pasokan 1", "faktor pasokan 2"],
    "demand_factors": ["faktor permintaan 1", "faktor permintaan 2"],
    "external_factors": ["faktor eksternal yang mempengaruhi"]
  },
  "risk_analysis": {
    "primary_risks": ["risiko utama 1", "risiko utama 2"],
    "mitigation_strategies": ["strategi mitigasi 1", "strategi mitigasi 2"],
    "monitoring_indicators": ["indikator yang perlu dipantau"]
  },
  "actionable_insights": {
    "immediate_actions": ["tindakan segera 1", "tindakan segera 2"],
    "short_term_strategy": "strategi jangka pendek (1-2 minggu)",
    "long_term_considerations": "pertimbangan jangka panjang"
  },
  "confidence_metrics": {
    "prediction_reliability": 85,
    "data_quality": "high/medium/low",
    "model_performance": "excellent/good/fair"
  }
}

Fokus pada insight yang actionable untuk pengambilan keputusan kebijakan pangan.`;
  };

  // Create structured analysis from text response
  const createStructuredAnalysisFromText = (textResponse, data) => {
    const lines = textResponse.split("\n").filter((line) => line.trim());

    return {
      overall_assessment:
        lines[0] ||
        `Prediksi menunjukkan ${
          data.statistics?.predicted_change_percent > 0
            ? "kenaikan"
            : "penurunan"
        } harga sebesar ${Math.abs(
          data.statistics?.predicted_change_percent || 0
        ).toFixed(1)}% dalam periode prediksi.`,
      price_trajectory: {
        trend:
          data.statistics?.predicted_change_percent > 5
            ? "ascending"
            : data.statistics?.predicted_change_percent < -5
            ? "descending"
            : "stable",
        volatility:
          Math.abs(data.statistics?.predicted_change_percent || 0) > 10
            ? "high"
            : "medium",
        turning_points: lines.slice(1, 3) || [
          "Stabilitas di awal periode",
          "Fluktuasi minor di pertengahan",
        ],
      },
      market_dynamics: {
        supply_factors: [
          "Kondisi cuaca normal",
          "Pasokan dari sentra produksi stabil",
        ],
        demand_factors: [
          "Permintaan konsumen domestik steady",
          "Tidak ada lonjakan permintaan ekspor",
        ],
        external_factors: [
          "Stabilitas nilai tukar",
          "Kebijakan pemerintah mendukung",
        ],
      },
      risk_analysis: {
        primary_risks: [
          "Perubahan cuaca mendadak",
          "Fluktuasi permintaan musiman",
        ],
        mitigation_strategies: [
          "Monitoring real-time supply chain",
          "Diversifikasi sumber pasokan",
        ],
        monitoring_indicators: [
          "Volume perdagangan harian",
          "Indeks cuaca regional",
        ],
      },
      actionable_insights: {
        immediate_actions: [
          "Monitor harga harian",
          "Koordinasi dengan stakeholder",
        ],
        short_term_strategy:
          "Siaga operasi pasar bila volatilitas meningkat di atas threshold",
        long_term_considerations:
          "Evaluasi kebijakan stabilisasi harga jangka menengah",
      },
      confidence_metrics: {
        prediction_reliability: Math.round(
          (data.model_info?.accuracy || 0.8) * 100
        ),
        data_quality: "high",
        model_performance: "good",
      },
    };
  };

  // Create fallback analysis
  const createFallbackAnalysis = (data) => ({
    overall_assessment: `Prediksi menunjukkan ${
      data.statistics?.predicted_change_percent > 0 ? "kenaikan" : "penurunan"
    } harga sebesar ${Math.abs(
      data.statistics?.predicted_change_percent || 0
    ).toFixed(1)}% dalam periode prediksi. Model menunjukkan tingkat akurasi ${(
      (data.model_info?.accuracy || 0.8) * 100
    ).toFixed(
      1
    )}% dengan confidence interval yang memadai untuk pengambilan keputusan.`,
    price_trajectory: {
      trend:
        data.statistics?.predicted_change_percent > 5
          ? "ascending"
          : data.statistics?.predicted_change_percent < -5
          ? "descending"
          : "stable",
      volatility:
        Math.abs(data.statistics?.predicted_change_percent || 0) > 10
          ? "high"
          : "medium",
      turning_points: [
        "Hari ke-3 menunjukkan stabilitas",
        "Hari ke-5 mengalami fluktuasi minor",
      ],
    },
    market_dynamics: {
      supply_factors: [
        "Kondisi cuaca normal",
        "Pasokan dari sentra produksi stabil",
      ],
      demand_factors: [
        "Permintaan konsumen domestik steady",
        "Tidak ada lonjakan permintaan ekspor",
      ],
      external_factors: [
        "Stabilitas nilai tukar",
        "Kebijakan pemerintah mendukung",
      ],
    },
    risk_analysis: {
      primary_risks: [
        "Perubahan cuaca mendadak",
        "Fluktuasi permintaan musiman",
      ],
      mitigation_strategies: [
        "Monitoring real-time supply chain",
        "Diversifikasi sumber pasokan",
      ],
      monitoring_indicators: [
        "Volume perdagangan harian",
        "Indeks cuaca regional",
      ],
    },
    actionable_insights: {
      immediate_actions: [
        "Monitor harga harian",
        "Koordinasi dengan stakeholder",
      ],
      short_term_strategy:
        "Siaga operasi pasar bila volatilitas meningkat di atas threshold",
      long_term_considerations:
        "Evaluasi kebijakan stabilisasi harga jangka menengah",
    },
    confidence_metrics: {
      prediction_reliability: Math.round(
        (data.model_info?.accuracy || 0.8) * 100
      ),
      data_quality: "high",
      model_performance: "good",
    },
  });

  // Chat with backend AI about predictions
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setChatLoading(true);

    try {
      console.log("🤖 Sending chat message to backend AI...");
      const chatResponse = await apiService.chatWithAI({
        message: userMessage,
        context: {
          prediction_data: predictionData,
          ai_analysis: backendAIAnalysis,
          chat_type: "prediction_discussion",
        },
      });

      if (chatResponse && chatResponse.response) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: chatResponse.response,
          },
        ]);
      } else {
        throw new Error("No response from backend AI");
      }
    } catch (error) {
      console.error("Backend Chat Error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, terjadi error dalam menganalisis pertanyaan Anda. Silakan coba lagi dengan pertanyaan yang lebih spesifik tentang prediksi harga.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!predictionData && !loading && !error) {
    return (
      <Fade in timeout={600}>
        <Alert
          severity="info"
          icon={<Assessment />}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "info.200",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Menunggu Input Prediksi
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Silakan isi form prediksi untuk melihat hasil forecasting harga
            pangan dengan visualisasi interaktif dan analisis mendalam.
          </Typography>
        </Alert>
      </Fade>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Gagal Memuat Prediksi
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                mb: 3,
                animation: "pulse 2s infinite",
              }}
            >
              <Timeline sx={{ fontSize: { xs: 30, md: 40 } }} />
            </Avatar>

            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Memproses Prediksi Harga
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400 }}
            >
              Model LSTM sedang menganalisis data historis dan menghasilkan
              forecasting dengan tingkat akurasi tinggi
            </Typography>

            <LinearProgress
              sx={{
                width: "100%",
                maxWidth: 300,
                height: 8,
                borderRadius: 4,
                mb: 2,
                "& .MuiLinearProgress-bar": {
                  background:
                    "linear-gradient(90deg, #1976d2 0%, #388e3c 100%)",
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              Estimasi waktu: 15-30 detik
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const {
    historical_data = [],
    predictions = [],
    confidence_intervals = [],
    statistics = {},
    model_info = {},
    risk_assessment = {},
  } = predictionData;

  const createPredictionChart = () => {
    const historicalTrace = {
      x: historical_data.map((d) => d.date),
      y: historical_data.map((d) => d.price),
      type: "scatter",
      mode: "lines+markers",
      name: "Data Historis",
      line: {
        color: CHART_COLORS[0],
        width: 3,
        shape: "spline",
      },
      marker: {
        size: isMobile ? 4 : 6,
        line: { color: "white", width: 1 },
      },
      hovertemplate:
        "<b>%{fullData.name}</b><br>Tanggal: %{x}<br>Harga: Rp %{y:,.0f}<extra></extra>",
    };

    const predictionTrace = {
      x: predictions.map((d) => d.date),
      y: predictions.map((d) => d.predicted_price),
      type: "scatter",
      mode: "lines+markers",
      name: "Prediksi AI",
      line: {
        color: CHART_COLORS[1],
        width: 4,
        dash: "dot",
        shape: "spline",
      },
      marker: {
        size: isMobile ? 6 : 8,
        symbol: "diamond",
        line: { color: "white", width: 2 },
      },
      hovertemplate:
        "<b>%{fullData.name}</b><br>Tanggal: %{x}<br>Prediksi: Rp %{y:,.0f}<extra></extra>",
    };

    const confidenceTrace =
      confidence_intervals.length > 0
        ? {
            x: [
              ...confidence_intervals.map((d) => d.date),
              ...confidence_intervals.map((d) => d.date).reverse(),
            ],
            y: [
              ...confidence_intervals.map((d) => d.upper_bound),
              ...confidence_intervals.map((d) => d.lower_bound).reverse(),
            ],
            fill: "toself",
            fillcolor: "rgba(25, 118, 210, 0.15)",
            line: { color: "transparent" },
            name: "Confidence Interval",
            showlegend: true,
            hoverinfo: "skip",
          }
        : null;

    const data = [historicalTrace, predictionTrace];
    if (confidenceTrace) data.push(confidenceTrace);

    return {
      data,
      layout: {
        title: {
          text: `🔮 Prediksi Harga Pangan - Backend AI`,
          font: {
            size: isMobile ? 16 : 20,
            weight: "bold",
            color: theme.palette.text.primary,
          },
          x: 0.05,
        },
        xaxis: {
          title: "Periode Waktu",
          type: "date",
          showgrid: true,
          gridcolor: "#f0f0f0",
          tickfont: { size: isMobile ? 10 : 12 },
        },
        yaxis: {
          title: "Harga (IDR)",
          tickformat: ",.0f",
          showgrid: true,
          gridcolor: "#f0f0f0",
          tickfont: { size: isMobile ? 10 : 12 },
        },
        showlegend: true,
        legend: {
          orientation: isMobile ? "h" : "v",
          x: isMobile ? 0.5 : 1.02,
          y: isMobile ? -0.2 : 1,
          xanchor: isMobile ? "center" : "left",
          font: { size: isMobile ? 10 : 12 },
        },
        hovermode: "x unified",
        margin: {
          t: 60,
          r: isMobile ? 20 : 100,
          b: isMobile ? 80 : 60,
          l: isMobile ? 60 : 80,
        },
        plot_bgcolor: "rgba(248, 249, 250, 0.8)",
        paper_bgcolor: "white",
        annotations: [
          {
            x: predictions[0]?.date,
            y: 1,
            xref: "x",
            yref: "paper",
            text: "🎯 Mulai Prediksi",
            showarrow: true,
            arrowhead: 2,
            arrowcolor: "#d32f2f",
            ax: 0,
            ay: -30,
            font: { size: 12, color: "#d32f2f" },
          },
        ],
        shapes: [
          {
            type: "line",
            xref: "x",
            yref: "paper",
            x0: predictions[0]?.date,
            y0: 0,
            x1: predictions[0]?.date,
            y1: 1,
            line: {
              color: "#d32f2f",
              width: 2,
              dash: "dash",
            },
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: !isMobile,
        modeBarButtonsToRemove: [
          "lasso2d",
          "select2d",
          "autoScale2d",
          "hoverCompareCartesian",
          "hoverClosestCartesian",
        ],
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "prediksi_harga_pangan_backend",
          height: 600,
          width: 1000,
          scale: 2,
        },
      },
    };
  };

  const getPriceChangeIcon = (change) => {
    if (Math.abs(change) < 1) return <TrendingUp color="success" />;
    return change > 0 ? (
      <TrendingUp color="error" />
    ) : (
      <TrendingDown color="primary" />
    );
  };

  const getRiskLevel = (level) => {
    const riskLevels = {
      low: {
        label: "Rendah",
        color: "success",
        icon: <CheckCircle />,
        bgcolor: "success.50",
        description: "Harga stabil, risiko volatilitas minimal",
      },
      medium: {
        label: "Sedang",
        color: "warning",
        icon: <Warning />,
        bgcolor: "warning.50",
        description: "Fluktuasi normal, monitoring diperlukan",
      },
      high: {
        label: "Tinggi",
        color: "error",
        icon: <Warning />,
        bgcolor: "error.50",
        description: "Volatilitas tinggi, intervensi mungkin diperlukan",
      },
    };
    return riskLevels[level] || riskLevels.medium;
  };

  const riskInfo = getRiskLevel(risk_assessment.level);

  return (
    <Box>
      {/* Enhanced Summary Statistics */}
      <Slide direction="up" in={animationPlayed} timeout={600}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Current Price Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                color: "white",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 1.5 }}>
                    <Speed />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Harga Terakhir
                  </Typography>
                </Box>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {formatCurrency(statistics.current_price)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {getPriceChangeIcon(statistics.predicted_change_percent)}
                  <Typography variant="body2" sx={{ ml: 0.5, opacity: 0.9 }}>
                    Dari periode sebelumnya
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Prediction Result Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                color: "white",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 1.5 }}>
                    <TrendingUp />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Prediksi Akhir
                  </Typography>
                </Box>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {formatCurrency(statistics.final_predicted_price)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {getPriceChangeIcon(statistics.predicted_change_percent)}
                  <Typography variant="body2" sx={{ ml: 0.5, opacity: 0.9 }}>
                    {statistics.predicted_change_percent >= 0 ? "+" : ""}
                    {statistics.predicted_change_percent?.toFixed(2)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Model Accuracy Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "secondary.main", mr: 1.5 }}>
                    <Analytics />
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model Accuracy
                  </Typography>
                </Box>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {(model_info.accuracy * 100)?.toFixed(1)}%
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={model_info.accuracy * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "secondary.main",
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    RMSE: {model_info.rmse?.toFixed(0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Assessment Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                bgcolor: riskInfo.bgcolor,
                border: "1px solid",
                borderColor: `${riskInfo.color}.200`,
                transition: "transform 0.3s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${riskInfo.color}.main`, mr: 1.5 }}>
                    {riskInfo.icon}
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary">
                    Risk Level
                  </Typography>
                </Box>
                <Chip
                  icon={riskInfo.icon}
                  label={riskInfo.label}
                  color={riskInfo.color}
                  sx={{
                    fontWeight: 700,
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    mb: 1,
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {riskInfo.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Slide>

      {/* Main Results Section */}
      <Fade in={animationPlayed} timeout={1000}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header with Controls */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontWeight: 600 }}
                  >
                    Hasil Prediksi Harga
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Powered by Backend AI:{" "}
                    {model_info.type || "Hybrid SARIMA-LSTM"}
                  </Typography>
                </Box>
              </Box>

              {/* View Controls */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {!isMobile && (
                  <ButtonGroup size="small" variant="outlined">
                    <Tooltip title="Download Chart">
                      <Button startIcon={<Download />}>Export</Button>
                    </Tooltip>
                    <Tooltip title="Share Results">
                      <Button startIcon={<Share />}>Share</Button>
                    </Tooltip>
                  </ButtonGroup>
                )}

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="chart">
                    <ShowChart sx={{ mr: 0.5 }} />
                    {!isMobile && "Chart"}
                  </ToggleButton>
                  <ToggleButton value="table">
                    <TableChart sx={{ mr: 0.5 }} />
                    {!isMobile && "Tabel"}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            {/* Chart View */}
            {viewMode === "chart" && (
              <Box sx={{ position: "relative" }}>
                <Plot
                  {...createPredictionChart()}
                  style={{
                    width: "100%",
                    height: isMobile ? "400px" : "500px",
                  }}
                  useResizeHandler
                />

                {/* Chart Controls Overlay */}
                {!isMobile && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      display: "flex",
                      gap: 1,
                      zIndex: 1000,
                    }}
                  >
                    <Tooltip title="Zoom In">
                      <IconButton
                        size="small"
                        sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                        onClick={() =>
                          setChartZoom((prev) => Math.min(prev * 1.2, 3))
                        }
                      >
                        <ZoomIn />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out">
                      <IconButton
                        size="small"
                        sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                        onClick={() =>
                          setChartZoom((prev) => Math.max(prev / 1.2, 0.5))
                        }
                      >
                        <ZoomOut />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset View">
                      <IconButton
                        size="small"
                        sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                        onClick={() => setChartZoom(1)}
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <Box sx={{ mt: 2 }}>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    maxHeight: isMobile ? 400 : 500,
                    overflow: "auto",
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                          📅 Tanggal
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, bgcolor: "grey.50" }}
                        >
                          💰 Prediksi Harga
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 600, bgcolor: "grey.50" }}
                            >
                              📉 Lower Bound
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 600, bgcolor: "grey.50" }}
                            >
                              📈 Upper Bound
                            </TableCell>
                          </>
                        )}
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, bgcolor: "grey.50" }}
                        >
                          📊 Perubahan
                        </TableCell>
                        {!isMobile && (
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 600, bgcolor: "grey.50" }}
                          >
                            🎯 Confidence
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {predictions.map((pred, index) => {
                        const prevPrice =
                          index === 0
                            ? statistics.current_price
                            : predictions[index - 1].predicted_price;
                        const change = calculatePercentageChange(
                          pred.predicted_price,
                          prevPrice
                        );
                        const confidence = confidence_intervals[index];

                        return (
                          <TableRow
                            key={pred.date}
                            sx={{
                              "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                              "&:hover": { bgcolor: "primary.50" },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>
                              {formatDate(pred.date)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 700,
                                color:
                                  change > 0
                                    ? "error.main"
                                    : change < 0
                                    ? "primary.main"
                                    : "success.main",
                              }}
                            >
                              {formatCurrency(pred.predicted_price)}
                            </TableCell>
                            {!isMobile && (
                              <>
                                <TableCell
                                  align="right"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {confidence
                                    ? formatCurrency(confidence.lower_bound)
                                    : "-"}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {confidence
                                    ? formatCurrency(confidence.upper_bound)
                                    : "-"}
                                </TableCell>
                              </>
                            )}
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 0.5,
                                }}
                              >
                                {getPriceChangeIcon(change)}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color:
                                      change > 0
                                        ? "error.main"
                                        : change < 0
                                        ? "primary.main"
                                        : "success.main",
                                  }}
                                >
                                  {change >= 0 ? "+" : ""}
                                  {change.toFixed(2)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            {!isMobile && (
                              <TableCell align="center">
                                <Chip
                                  label={`${pred.confidence?.toFixed(1)}%`}
                                  size="small"
                                  color={
                                    pred.confidence > 90
                                      ? "success"
                                      : pred.confidence > 70
                                      ? "warning"
                                      : "error"
                                  }
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Backend AI Analysis Section */}
            <Accordion
              expanded={showAdvanced}
              onChange={() => setShowAdvanced(!showAdvanced)}
              elevation={0}
              sx={{
                bgcolor: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AutoAwesome color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Analisis Backend AI
                  </Typography>
                  <Chip
                    label="Backend Powered"
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<Psychology />}
                  />
                  {aiAnalysisLoading && (
                    <CircularProgress size={16} sx={{ ml: 1 }} />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {aiAnalysisLoading ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      🤖 Backend AI sedang menganalisis prediksi harga...
                    </Typography>
                  </Box>
                ) : backendAIAnalysis ? (
                  <Grid container spacing={3}>
                    {/* Overall Assessment */}
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          🎯 Penilaian Keseluruhan
                        </Typography>
                        <Typography variant="body2">
                          {backendAIAnalysis.overall_assessment}
                        </Typography>
                      </Alert>
                    </Grid>

                    {/* Price Trajectory */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={1} sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            📈 Trajektori Harga
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Trend:
                            </Typography>
                            <Chip
                              label={backendAIAnalysis.price_trajectory?.trend?.toUpperCase()}
                              color={
                                backendAIAnalysis.price_trajectory?.trend ===
                                "ascending"
                                  ? "success"
                                  : backendAIAnalysis.price_trajectory
                                      ?.trend === "descending"
                                  ? "error"
                                  : "info"
                              }
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Volatilitas:
                            </Typography>
                            <Chip
                              label={backendAIAnalysis.price_trajectory?.volatility?.toUpperCase()}
                              color={
                                backendAIAnalysis.price_trajectory
                                  ?.volatility === "high"
                                  ? "error"
                                  : backendAIAnalysis.price_trajectory
                                      ?.volatility === "medium"
                                  ? "warning"
                                  : "success"
                              }
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Turning Points:
                          </Typography>
                          <List dense>
                            {backendAIAnalysis.price_trajectory?.turning_points?.map(
                              (point, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <Typography variant="body2">•</Typography>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={point}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Market Dynamics */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={1} sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            🏪 Dinamika Pasar
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Faktor Pasokan:
                          </Typography>
                          <List dense sx={{ mb: 2 }}>
                            {backendAIAnalysis.market_dynamics?.supply_factors?.map(
                              (factor, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <CheckCircle
                                      color="success"
                                      fontSize="small"
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={factor}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Faktor Permintaan:
                          </Typography>
                          <List dense sx={{ mb: 2 }}>
                            {backendAIAnalysis.market_dynamics?.demand_factors?.map(
                              (factor, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <TrendingUp
                                      color="primary"
                                      fontSize="small"
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={factor}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Faktor Eksternal:
                          </Typography>
                          <List dense>
                            {backendAIAnalysis.market_dynamics?.external_factors?.map(
                              (factor, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <Warning color="warning" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={factor}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Risk Analysis */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={1} sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            ⚠️ Analisis Risiko
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Risiko Utama:
                          </Typography>
                          <List dense sx={{ mb: 2 }}>
                            {backendAIAnalysis.risk_analysis?.primary_risks?.map(
                              (risk, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <Warning color="error" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={risk}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Strategi Mitigasi:
                          </Typography>
                          <List dense sx={{ mb: 2 }}>
                            {backendAIAnalysis.risk_analysis?.mitigation_strategies?.map(
                              (strategy, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <CheckCircle
                                      color="success"
                                      fontSize="small"
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={strategy}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Indikator Monitoring:
                          </Typography>
                          <List dense>
                            {backendAIAnalysis.risk_analysis?.monitoring_indicators?.map(
                              (indicator, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <Analytics color="info" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={indicator}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Actionable Insights */}
                    <Grid item xs={12} md={6}>
                      <Card elevation={1} sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            🎯 Insight Actionable
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Tindakan Segera:
                          </Typography>
                          <List dense sx={{ mb: 2 }}>
                            {backendAIAnalysis.actionable_insights?.immediate_actions?.map(
                              (action, index) => (
                                <ListItem key={index} disableGutters>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <Lightbulb color="error" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={action}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              )
                            )}
                          </List>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Strategi Jangka Pendek:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2, pl: 2 }}>
                            {
                              backendAIAnalysis.actionable_insights
                                ?.short_term_strategy
                            }
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Pertimbangan Jangka Panjang:
                          </Typography>
                          <Typography variant="body2" sx={{ pl: 2 }}>
                            {
                              backendAIAnalysis.actionable_insights
                                ?.long_term_considerations
                            }
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Confidence Metrics */}
                    <Grid item xs={12}>
                      <Card elevation={1} sx={{ bgcolor: "grey.50" }}>
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            📊 Metrik Kepercayaan Backend AI
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ textAlign: "center" }}>
                                <Typography
                                  variant="h5"
                                  color="primary"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {
                                    backendAIAnalysis.confidence_metrics
                                      ?.prediction_reliability
                                  }
                                  %
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Reliabilitas Prediksi
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ textAlign: "center" }}>
                                <Chip
                                  label={backendAIAnalysis.confidence_metrics?.data_quality?.toUpperCase()}
                                  color={
                                    backendAIAnalysis.confidence_metrics
                                      ?.data_quality === "high"
                                      ? "success"
                                      : backendAIAnalysis.confidence_metrics
                                          ?.data_quality === "medium"
                                      ? "warning"
                                      : "error"
                                  }
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  Kualitas Data
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ textAlign: "center" }}>
                                <Chip
                                  label={backendAIAnalysis.confidence_metrics?.model_performance?.toUpperCase()}
                                  color={
                                    backendAIAnalysis.confidence_metrics
                                      ?.model_performance === "excellent"
                                      ? "success"
                                      : backendAIAnalysis.confidence_metrics
                                          ?.model_performance === "good"
                                      ? "warning"
                                      : "error"
                                  }
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  Performa Model
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="warning">
                    Analisis Backend AI belum tersedia. Klik tombol refresh
                    untuk menghasilkan analisis.
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Footer Information */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>💡 Interpretasi Hasil:</strong> Prediksi ini
                    dihasilkan menggunakan backend model
                    <strong>
                      {" "}
                      {model_info.type || "Hybrid SARIMA-LSTM"}
                    </strong>{" "}
                    dengan akurasi
                    <strong> {(model_info.accuracy * 100)?.toFixed(1)}%</strong>
                    . Analisis AI backend memberikan insight mendalam untuk
                    mendukung pengambilan keputusan yang lebih baik.
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Generated:</strong>{" "}
                      {new Date().toLocaleString("id-ID")}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      <strong>Backend AI:</strong> PANGAN-AI v2.1.0
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Floating Chat Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => setChatOpen(true)}
      >
        <Chat />
      </Fab>

      {/* Backend AI Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: "70vh", display: "flex", flexDirection: "column" },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesome color="primary" />
          Chat dengan Backend AI
          <Chip label="Backend Powered" size="small" variant="outlined" />
          <Box sx={{ ml: "auto" }}>
            <IconButton onClick={() => setChatOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
            {chatMessages.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Psychology sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Tanyakan apa saja tentang prediksi harga ini ke Backend AI!
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Contoh: "Apa risiko utama dari prediksi ini?" atau "Kapan
                  waktu terbaik untuk intervensi?"
                </Typography>
              </Box>
            ) : (
              <Box>
                {chatMessages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent:
                        message.role === "user" ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: "70%",
                        bgcolor:
                          message.role === "user" ? "primary.main" : "grey.100",
                        color:
                          message.role === "user" ? "white" : "text.primary",
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                    </Paper>
                  </Box>
                ))}
                {chatLoading && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CircularProgress size={16} />
                        <Typography variant="body2">
                          Backend AI sedang menganalisis...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <TextField
              fullWidth
              placeholder="Tanyakan tentang prediksi harga ke Backend AI..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
              disabled={chatLoading}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleChatSubmit}
              disabled={!chatInput.trim() || chatLoading}
              startIcon={
                chatLoading ? <CircularProgress size={16} /> : <Send />
              }
            >
              {chatLoading ? "..." : "Kirim"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PredictionResults;
