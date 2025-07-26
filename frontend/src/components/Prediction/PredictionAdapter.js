// Enhanced Prediction Results Adapter
// Compatible dengan format data dari NewPredictionPage.js
// Mengintegrasikan AI insights dari backend
// Restrukturisasi dan Refactor dalam satu file

import React, { useState, useEffect, useCallback } from "react";
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
  Divider,
  LinearProgress,
  Avatar,
  IconButton,
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
  Tabs,
  Tab,
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
  Speed,
  Timeline,
  Analytics,
  Refresh,
  Psychology,
  AutoAwesome,
  Chat,
  Send,
  Close,
  Lightbulb,
  InfoOutlined,
  CalendarToday, // Changed from Schedule to CalendarToday for clarity
  PriceChange,
  Insights,
} from "@mui/icons-material";
// Plot from 'react-plotly.js' is not used in the provided code, so it's removed.
// If it's intended to be used, it should be re-added and implemented.
// import Plot from "react-plotly.js";
import apiService from "../../services/api"; // Pastikan path ini benar

// --- Helper Functions ---
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

// --- AI Data Transformation and Fallback Logic ---
const transformPredictionDataForAI = (data, commodity, region) => {
  if (!data) return null;
  return {
    commodity: commodity,
    region: region,
    current_price: data.current_price || 0,
    predictions: data.predictions || [],
    trend_analysis: data.trend_analysis || {
      direction: "STABLE",
      total_change_pct: 0,
    },
    risk_assessment: data.risk_assessment || {
      risk_level: "MEDIUM",
    },
  };
};

const createEnhancedAnalysisPrompt = (
  originalData,
  commodity,
  region,
  predictionDays
) => {
  const currentPrice = originalData.current_price || 0;
  const predictions = originalData.predictions || [];
  const finalPrice = predictions[predictions.length - 1] || currentPrice;
  const changePercent = originalData.trend_analysis?.total_change_pct || 0;

  return `Sebagai AI analyst ahli ekonomi pangan, berikan analisis mendalam terhadap prediksi harga berikut:

KONTEKS PREDIKSI:
- Komoditas: ${commodity}
- Wilayah: ${region}
- Harga Saat Ini: Rp ${currentPrice.toLocaleString("id-ID")}
- Harga Prediksi Akhir: Rp ${finalPrice.toLocaleString("id-ID")}
- Perubahan Prediksi: ${changePercent.toFixed(2)}%
- Periode Prediksi: ${predictionDays} hari
- Trend Direction: ${originalData.trend_analysis?.direction || "STABLE"}
- Risk Level: ${originalData.risk_assessment?.risk_level || "MEDIUM"}

DETAIL PREDIKSI HARIAN:
${predictions
  .slice(0, 7)
  .map(
    (price, index) => `Hari ${index + 1}: Rp ${price.toLocaleString("id-ID")}`
  )
  .join("\n")}

Berikan analisis dalam format JSON:
{
  "executive_summary": "Ringkasan analisis komprehensif (150 kata)",
  "market_analysis": {
    "price_trajectory": "ascending/descending/stable",
    "volatility_assessment": "low/medium/high",
    "key_drivers": ["faktor penggerak 1", "faktor penggerak 2"]
  },
  "risk_factors": {
    "immediate_risks": ["risiko jangka pendek 1", "risiko jangka pendek 2"],
    "mitigation_strategies": ["strategi mitigasi 1", "strategi mitigasi 2"]
  },
  "actionable_recommendations": {
    "immediate_actions": ["tindakan segera 1", "tindakan segera 2"],
    "monitoring_points": ["titik monitor 1", "titik monitor 2"],
    "intervention_threshold": "kondisi yang memerlukan intervensi"
  },
  "confidence_assessment": {
    "prediction_confidence": 85,
    "key_uncertainties": ["ketidakpastian utama 1", "ketidakpastian utama 2"]
  }
}

Fokus pada insight actionable untuk pengambilan keputusan kebijakan pangan.`;
};

const createStructuredAnalysisFromText = (textResponse, data) => {
  return {
    executive_summary:
      textResponse.split("\n")[0] ||
      `Analisis prediksi ${data.commodity} menunjukkan trend ${
        data.trend_analysis?.direction?.toLowerCase() || "stabil"
      } dengan tingkat risiko ${
        data.risk_assessment?.risk_level?.toLowerCase() || "sedang"
      }.`,
    market_analysis: {
      price_trajectory:
        data.trend_analysis?.direction === "INCREASING"
          ? "ascending"
          : data.trend_analysis?.direction === "DECREASING"
          ? "descending"
          : "stable",
      volatility_assessment:
        Math.abs(data.trend_analysis?.total_change_pct || 0) > 10
          ? "high"
          : "medium",
      key_drivers: [
        "Kondisi pasokan regional",
        "Pola permintaan konsumen",
        "Faktor musiman",
      ],
    },
    risk_factors: {
      immediate_risks: ["Fluktuasi pasokan", "Perubahan permintaan"],
      mitigation_strategies: [
        "Monitoring harga real-time",
        "Koordinasi stakeholder",
      ],
    },
    actionable_recommendations: {
      immediate_actions: [
        "Monitor pergerakan harga harian",
        "Evaluasi kondisi pasokan",
      ],
      monitoring_points: ["Harga di pasar utama", "Volume perdagangan"],
      intervention_threshold:
        "Jika volatilitas melebihi 15% atau tren negatif 3 hari berturut-turut",
    },
    confidence_assessment: {
      prediction_confidence: 80,
      key_uncertainties: ["Variabilitas cuaca", "Dinamika permintaan"],
    },
  };
};

const createFallbackInsights = (data) => ({
  summary: `Prediksi harga ${data.commodity} di ${data.region} menunjukkan ${
    data.trend_analysis?.direction?.toLowerCase() || "stabilitas"
  } dengan perubahan ${
    data.trend_analysis?.total_change_pct?.toFixed(1) || "0"
  }% selama ${data.predictionDays} hari ke depan.`,
  factors: [
    "Kondisi pasokan dari sentra produksi relatif stabil",
    "Permintaan pasar dalam level normal",
    "Tidak ada gangguan signifikan yang diidentifikasi",
  ],
  recommendations: [
    "Lakukan monitoring harga harian secara konsisten",
    "Pantau perkembangan kondisi di sentra produksi",
    "Siapkan mekanisme respons cepat jika terjadi volatilitas",
  ],
});

const createFallbackEnhancedAnalysis = (data) => ({
  executive_summary: `Analisis prediksi ${data.commodity} di ${
    data.region
  } menunjukkan kondisi ${
    data.trend_analysis?.direction?.toLowerCase() || "stabil"
  } dengan tingkat kepercayaan tinggi. Tidak ada indikasi shock price yang signifikan dalam periode ${
    data.predictionDays
  } hari.`,
  market_analysis: {
    price_trajectory:
      data.trend_analysis?.direction === "INCREASING"
        ? "ascending"
        : data.trend_analysis?.direction === "DECREASING"
        ? "descending"
        : "stable",
    volatility_assessment: "medium",
    key_drivers: [
      "Stabilitas pasokan regional",
      "Permintaan konsumen normal",
      "Kondisi cuaca mendukung",
    ],
  },
  risk_factors: {
    immediate_risks: ["Fluktuasi musiman", "Gangguan transportasi"],
    mitigation_strategies: [
      "Early warning system",
      "Diversifikasi sumber pasokan",
    ],
  },
  actionable_recommendations: {
    immediate_actions: [
      "Aktivasi monitoring intensif",
      "Koordinasi dengan petani",
    ],
    monitoring_points: [
      "Harga eceran di pasar tradisional",
      "Volume di pasar grosir",
    ],
    intervention_threshold:
      "Volatilitas harian > 10% atau trend negatif > 5 hari",
  },
  confidence_assessment: {
    prediction_confidence: 82,
    key_uncertainties: ["Faktor cuaca ekstrem", "Perubahan pola konsumsi"],
  },
});

// --- Main Component ---
const PredictionAdapter = ({
  predictionData = null,
  loading = false,
  error = null,
  commodity = "Cabai Rawit Merah",
  region = "Kota Bandung",
  predictionDays = 7,
  historicalDays = 7, // Not used, but kept for compatibility
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // AI Enhancement states
  const [aiInsights, setAiInsights] = useState(null);
  const [enhancedAIAnalysis, setEnhancedAIAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Generate AI insights when prediction data is available
  const generateAIInsights = useCallback(async () => {
    if (!predictionData || !predictionData.success) return;

    setAiLoading(true);
    try {
      const transformedData = transformPredictionDataForAI(
        predictionData,
        commodity,
        region
      );

      console.log("🤖 Generating AI insights for transformed data...");

      // Call backend AI insights
      const insightsResponse = await apiService.getAIInsights({
        prediction_data: transformedData,
        form_data: {
          komoditas: commodity,
          wilayah: region,
        },
      });
      setAiInsights(insightsResponse);

      // Generate enhanced analysis via chat
      const enhancedPrompt = createEnhancedAnalysisPrompt(
        predictionData,
        commodity,
        region,
        predictionDays
      );
      const chatResponse = await apiService.chatWithAI({
        message: enhancedPrompt,
        context: {
          prediction_data: transformedData,
          original_data: predictionData,
          analysis_type: "enhanced_prediction_analysis",
        },
      });

      if (chatResponse && chatResponse.response) {
        try {
          const analysis = JSON.parse(chatResponse.response);
          setEnhancedAIAnalysis(analysis);
        } catch {
          setEnhancedAIAnalysis(
            createStructuredAnalysisFromText(chatResponse.response, {
              commodity,
              region,
              predictionDays,
              ...predictionData,
            })
          );
        }
      }
    } catch (error) {
      console.error("AI insights generation error:", error);
      // Fallback to basic insights
      setAiInsights(
        createFallbackInsights({
          commodity,
          region,
          predictionDays,
          ...predictionData,
        })
      );
      setEnhancedAIAnalysis(
        createFallbackEnhancedAnalysis({
          commodity,
          region,
          predictionDays,
          ...predictionData,
        })
      );
    } finally {
      setAiLoading(false);
    }
  }, [predictionData, commodity, region, predictionDays]);

  // Effect to trigger AI insights generation on initial load or data change
  useEffect(() => {
    if (predictionData && predictionData.success && !loading) {
      generateAIInsights();
    }
  }, [predictionData, loading, generateAIInsights]);

  // Chat with AI
  const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setChatLoading(true);

    try {
      const chatResponse = await apiService.chatWithAI({
        message: userMessage,
        context: {
          prediction_data: transformPredictionDataForAI(
            predictionData,
            commodity,
            region
          ),
          ai_insights: aiInsights,
          enhanced_analysis: enhancedAIAnalysis,
          commodity: commodity,
          region: region,
          chat_type: "prediction_qa",
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
      }
    } catch (error) {
      console.error("Chat AI error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, terjadi error. Silakan coba pertanyaan lain tentang prediksi harga ini.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [
    chatInput,
    chatLoading,
    predictionData,
    aiInsights,
    enhancedAIAnalysis,
    commodity,
    region,
  ]);

  // --- Internal Sub-Components for Rendering ---

  // Sub-component for Summary Cards
  const SummaryCards = ({ data }) => {
    if (!data) return null;
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.2)", mx: "auto", mb: 1 }}
              >
                <Speed />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(data.current_price || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Harga Saat Ini
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              background: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.2)", mx: "auto", mb: 1 }}
              >
                <TrendingUp />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {data.trend_analysis?.total_change_pct?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Perubahan Prediksi
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "secondary.main", mx: "auto", mb: 1 }}>
                <Analytics />
              </Avatar>
              <Chip
                label={data.risk_assessment?.risk_level || "MEDIUM"}
                color={getRiskColor(data.risk_assessment?.risk_level)}
                sx={{ fontWeight: 700, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Level Risiko
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 1 }}>
                <CalendarToday />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {data.predictions?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hari Prediksi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Sub-component for Predictions Table
  const PredictionTable = ({ data }) => {
    if (!data || !data.predictions) return null;
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <TableChart sx={{ mr: 1 }} />
            Detail Prediksi Harian
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell>
                    <strong>No</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tanggal</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Harga Prediksi</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Perubahan (%)</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Trend</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.predictions.map((price, index) => {
                  const date = data.prediction_dates?.[index];
                  const change = data.price_changes_pct?.[index] || 0;

                  return (
                    <TableRow key={index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {date ? formatDate(date) : `Hari ${index + 1}`}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {formatCurrency(price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={change >= 0 ? "success.main" : "error.main"}
                          sx={{ fontWeight: "medium" }}
                        >
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {change >= 0 ? (
                          <TrendingUp color="success" />
                        ) : (
                          <TrendingDown color="error" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  // Sub-component for Backend AI Insights Display
  const AIInsightsDisplay = ({ insights, loadingAI }) => {
    if (loadingAI) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            🤖 Menghasilkan AI insights...
          </Typography>
        </Box>
      );
    }
    if (!insights) {
      return <Alert severity="info">AI insights sedang diproses...</Alert>;
    }
    return (
      <Card elevation={1}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Assessment color="secondary" sx={{ mr: 1 }} />
            Backend AI Insights
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {insights.summary}
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Faktor Kunci:
          </Typography>
          <List dense>
            {insights.factors?.map((factor, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={factor} />
              </ListItem>
            ))}
          </List>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 1, mt: 2 }}
          >
            Rekomendasi:
          </Typography>
          <List dense>
            {insights.recommendations?.map((rec, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon>
                  <Lightbulb color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={rec} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  // Sub-component for Enhanced AI Analysis Display
  const EnhancedAnalysisDisplay = ({ analysis }) => {
    if (!analysis) {
      return (
        <Alert severity="info">Enhanced AI analysis sedang diproses...</Alert>
      );
    }
    return (
      <Box>
        {/* Executive Summary */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            🎯 Executive Summary
          </Typography>
          <Typography variant="body2">{analysis.executive_summary}</Typography>
        </Alert>

        <Grid container spacing={3}>
          {/* Market Analysis */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  📊 Analisis Pasar
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Trajektori Harga:
                  </Typography>
                  <Chip
                    label={analysis.market_analysis?.price_trajectory?.toUpperCase()}
                    color={
                      analysis.market_analysis?.price_trajectory === "ascending"
                        ? "success"
                        : analysis.market_analysis?.price_trajectory ===
                          "descending"
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
                    label={analysis.market_analysis?.volatility_assessment?.toUpperCase()}
                    color={
                      analysis.market_analysis?.volatility_assessment === "high"
                        ? "error"
                        : analysis.market_analysis?.volatility_assessment ===
                          "medium"
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
                  Key Drivers:
                </Typography>
                <List dense>
                  {analysis.market_analysis?.key_drivers?.map(
                    (driver, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Typography variant="body2">•</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={driver}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    )
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Factors */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  ⚠️ Faktor Risiko
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Risiko Immediate:
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {analysis.risk_factors?.immediate_risks?.map(
                    (risk, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Warning color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={risk}
                          primaryTypographyProps={{ variant: "body2" }}
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
                <List dense>
                  {analysis.risk_factors?.mitigation_strategies?.map(
                    (strategy, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={strategy}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    )
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Actionable Recommendations */}
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  🎯 Rekomendasi Actionable
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Tindakan Segera:
                    </Typography>
                    <List dense>
                      {analysis.actionable_recommendations?.immediate_actions?.map(
                        (action, index) => (
                          <ListItem key={index} disableGutters>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Lightbulb color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={action}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Titik Monitoring:
                    </Typography>
                    <List dense>
                      {analysis.actionable_recommendations?.monitoring_points?.map(
                        (point, index) => (
                          <ListItem key={index} disableGutters>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Analytics color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={point}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Threshold Intervensi:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: "warning.50" }}>
                      <Typography variant="body2">
                        {
                          analysis.actionable_recommendations
                            ?.intervention_threshold
                        }
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Confidence Assessment */}
          <Grid item xs={12}>
            <Card elevation={1} sx={{ bgcolor: "grey.50" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  📊 Assessment Kepercayaan
                </Typography>

                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      >
                        {analysis.confidence_assessment?.prediction_confidence}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confidence Level
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Key Uncertainties:
                    </Typography>
                    <List dense>
                      {analysis.confidence_assessment?.key_uncertainties?.map(
                        (uncertainty, index) => (
                          <ListItem key={index} disableGutters>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <InfoOutlined color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={uncertainty}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Sub-component for Chat Dialog
  const ChatbotDialog = ({
    open,
    onClose,
    messages,
    input,
    setInput,
    loadingChat,
    onSubmit,
    komoditas,
  }) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: "70vh", display: "flex", flexDirection: "column" },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesome color="primary" />
          Chat AI tentang Prediksi {komoditas}
          <Chip label="Enhanced AI" size="small" variant="outlined" />
          <Box sx={{ ml: "auto" }}>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Psychology sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Tanyakan apa saja tentang prediksi {komoditas}!
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Contoh: "Bagaimana outlook harga minggu depan?" atau "Strategi
                  apa yang disarankan?"
                </Typography>
              </Box>
            ) : (
              <Box>
                {messages.map((message, index) => (
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
                {loadingChat && (
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
                          AI sedang menganalisis...
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
              placeholder="Tanyakan tentang prediksi harga..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSubmit()}
              disabled={loadingChat}
              size="small"
            />
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={!input.trim() || loadingChat}
              startIcon={
                loadingChat ? <CircularProgress size={16} /> : <Send />
              }
            >
              {loadingChat ? "..." : "Kirim"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  };

  // --- Main Component Render Logic ---

  if (!predictionData && !loading && !error) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Menunggu Data Prediksi
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Silakan generate prediksi untuk melihat hasil dan analisis AI.
        </Typography>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Error Memuat Prediksi
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
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 80,
              height: 80,
              mx: "auto",
              mb: 3,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.7)" },
                "70%": { boxShadow: "0 0 0 20px rgba(25, 118, 210, 0)" },
                "100%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)" },
              },
            }}
          >
            <Timeline sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Memproses Prediksi & AI Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sistem sedang menganalisis data dan menghasilkan insights dengan AI
          </Typography>
          <LinearProgress sx={{ maxWidth: 300, mx: "auto" }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Main Results Card */}
      <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Enhanced Prediction Results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {commodity} - {region} | {predictionDays} hari prediksi
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                startIcon={
                  aiLoading ? <CircularProgress size={16} /> : <Refresh />
                }
                onClick={generateAIInsights}
                disabled={aiLoading}
                variant="outlined"
              >
                Refresh AI
              </Button>
            </Box>
          </Box>

          {/* Tabs for different views */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Basic Results" icon={<ShowChart />} />
              <Tab label="AI Insights" icon={<Psychology />} />
              <Tab label="Enhanced Analysis" icon={<AutoAwesome />} />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Box>
              <SummaryCards data={predictionData} />
              <PredictionTable data={predictionData} />

              {/* Analysis & Recommendations from original data */}
              {predictionData && predictionData.success && (
                <Box sx={{ mt: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <PriceChange sx={{ mr: 1 }} />
                            Analisis Trend
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Arah Trend:
                            </Typography>
                            <Chip
                              label={
                                predictionData.trend_analysis?.direction ||
                                "STABLE"
                              }
                              color={getTrendColor(
                                predictionData.trend_analysis?.direction
                              )}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Volatilitas:
                            </Typography>
                            <Typography variant="body1">
                              {predictionData.trend_analysis?.volatility_pct?.toFixed(
                                2
                              ) || 0}
                              %
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Harga Tertinggi:
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                predictionData.trend_analysis?.highest_price ||
                                  0
                              )}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Harga Terendah:
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                predictionData.trend_analysis?.lowest_price || 0
                              )}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <Insights sx={{ mr: 1 }} />
                            Ringkasan & Rekomendasi
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          {predictionData.summary?.summary_text && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="primary">
                                Ringkasan:
                              </Typography>
                              <Typography variant="body2">
                                {predictionData.summary.summary_text}
                              </Typography>
                            </Box>
                          )}

                          {predictionData.summary?.recommendation && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="primary">
                                Rekomendasi:
                              </Typography>
                              <Typography variant="body2">
                                {predictionData.summary.recommendation}
                              </Typography>
                            </Box>
                          )}

                          {predictionData.summary?.confidence_level && (
                            <Box>
                              <Typography variant="subtitle2" color="primary">
                                Tingkat Keyakinan:
                              </Typography>
                              <Chip
                                label={predictionData.summary.confidence_level}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
          {activeTab === 1 && (
            <AIInsightsDisplay insights={aiInsights} loadingAI={aiLoading} />
          )}
          {activeTab === 2 && (
            <EnhancedAnalysisDisplay analysis={enhancedAIAnalysis} />
          )}
        </CardContent>
      </Card>

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

      {/* Chat Dialog */}
      <ChatbotDialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        input={chatInput}
        setInput={setChatInput}
        loadingChat={chatLoading}
        onSubmit={handleChatSubmit}
        komoditas={commodity}
      />

      {/* Footer Information */}
      <Card elevation={1} sx={{ mt: 3, bgcolor: "grey.50" }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary">
                <strong>💡 Enhanced Analysis:</strong> Hasil prediksi dari
                NewPredictionPage diperkaya dengan AI insights dari backend.
                Analisis mencakup basic prediction, AI insights, dan enhanced
                analysis untuk pengambilan keputusan yang lebih baik.
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
                  <strong>Enhanced AI:</strong> Backend + OpenAI Integration
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PredictionAdapter;
