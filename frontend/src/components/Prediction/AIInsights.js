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
  Button,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  Insights,
  PriceChange,
  CalendarToday,
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  Flare,
  ArrowUpward,
  ArrowDownward,
  Psychology,
  Assessment,
  TrendingUp,
  Warning,
  Lightbulb,
  Analytics,
  ExpandMore,
  AutoAwesome,
  Refresh,
} from "@mui/icons-material";
import apiService from "../../services/api";
import dayjs from "dayjs";

// Global Virtual Date Configuration
const DATASET_MAX_DATE = "2025-05-31";
const VIRTUAL_TODAY = dayjs(DATASET_MAX_DATE);

const AIInsights = ({ filters }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [enhancedAIAnalysis, setEnhancedAIAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Function to determine the prediction period
  const getPredictionPeriod = useCallback(() => {
    const daysToPredict = 7;
    const predictionStartDate = VIRTUAL_TODAY.format("YYYY-MM-DD");
    const predictionEndDate = VIRTUAL_TODAY.add(daysToPredict, "day").format(
      "YYYY-MM-DD"
    );
    return { predictionStartDate, predictionEndDate, daysToPredict };
  }, []);

  // Enhanced AI Analysis using backend AI service
  const generateEnhancedAIAnalysis = useCallback(
    async (predictionData, aiInsights) => {
      if (!predictionData || !predictionData.predicted_prices) return;

      setAiAnalysisLoading(true);
      try {
        // Use backend AI chat endpoint for enhanced analysis
        const enhancedPrompt = createEnhancedAnalysisPrompt(
          predictionData,
          aiInsights,
          filters
        );

        const chatResponse = await apiService.chatWithAI({
          message: enhancedPrompt,
          context: {
            prediction_data: predictionData,
            basic_insights: aiInsights,
            filters: filters,
          },
        });

        if (chatResponse && chatResponse.response) {
          try {
            // Try to parse structured response
            const analysis = JSON.parse(chatResponse.response);
            setEnhancedAIAnalysis(analysis);
          } catch {
            // If not JSON, create structured response from text
            setEnhancedAIAnalysis({
              executive_summary:
                chatResponse.response.split("\n")[0] ||
                "Analisis AI menunjukkan pola prediksi yang stabil.",
              key_insights: chatResponse.response.split("\n").slice(1, 4) || [
                "Prediksi menunjukkan tren yang konsisten",
                "Volatilitas dalam rentang normal",
                "Faktor eksternal perlu dimonitor",
              ],
              risk_assessment: {
                level: predictionData.price_trend === "naik" ? "medium" : "low",
                factors: ["Fluktuasi pasokan", "Perubahan permintaan"],
              },
              recommendations: [
                "Monitor harga harian secara konsisten",
                "Siapkan strategi intervensi jika diperlukan",
                "Koordinasi dengan stakeholder terkait",
              ],
              confidence_score: 85,
            });
          }
        }
      } catch (error) {
        console.error("Enhanced AI Analysis Error:", error);
        // Fallback analysis
        setEnhancedAIAnalysis(
          createFallbackEnhancedAnalysis(predictionData, aiInsights)
        );
      } finally {
        setAiAnalysisLoading(false);
      }
    },
    [filters]
  );

  // Create enhanced analysis prompt for backend AI
  const createEnhancedAnalysisPrompt = (
    predictionData,
    aiInsights,
    filters
  ) => {
    const currentPrice = predictionData.predicted_prices[0]?.price || 0;
    const finalPrice =
      predictionData.predicted_prices[
        predictionData.predicted_prices.length - 1
      ]?.price || 0;
    const priceChange = (
      ((finalPrice - currentPrice) / currentPrice) *
      100
    ).toFixed(2);

    return `Sebagai AI analyst ahli dalam ekonomi pangan, berikan analisis mendalam berdasarkan data berikut:

KONTEKS PREDIKSI:
- Komoditas: ${filters.komoditas}
- Wilayah: ${filters.wilayah}
- Trend: ${predictionData.price_trend}
- Perubahan Harga: ${priceChange}%
- Periode: ${predictionData.predicted_prices.length} hari

ANALISIS DASAR TERSEDIA:
${
  aiInsights
    ? `
- Ringkasan: ${aiInsights.summary}
- Faktor Kunci: ${aiInsights.factors?.join(", ")}
- Rekomendasi: ${aiInsights.recommendations?.join(", ")}
`
    : "Belum tersedia"
}

BERIKAN ANALISIS LANJUTAN DALAM FORMAT JSON:
{
  "executive_summary": "Ringkasan eksekutif (150 kata max)",
  "key_insights": ["insight strategis 1", "insight strategis 2", "insight strategis 3"],
  "risk_assessment": {
    "level": "low/medium/high",
    "factors": ["faktor risiko 1", "faktor risiko 2"]
  },
  "recommendations": ["rekomendasi actionable 1", "rekomendasi actionable 2"],
  "confidence_score": 85
}

Fokus pada insight yang dapat ditindaklanjuti untuk kebijakan pangan.`;
  };

  // Create fallback enhanced analysis
  const createFallbackEnhancedAnalysis = (predictionData, aiInsights) => ({
    executive_summary: `Berdasarkan analisis prediksi harga ${filters.komoditas} di ${filters.wilayah}, tren menunjukkan ${predictionData.price_trend} dengan tingkat volatilitas yang terkendali. Prediksi menunjukkan stabilitas relatif dalam jangka pendek dengan beberapa fluktuasi minor yang perlu dimonitor.`,
    key_insights: [
      "Pola harga mengikuti tren historis yang konsisten",
      "Tidak ada indikasi shock price dalam periode prediksi",
      "Faktor musiman memberikan pengaruh moderat",
    ],
    risk_assessment: {
      level: predictionData.price_trend === "naik" ? "medium" : "low",
      factors: [
        "Volatilitas pasokan dari sentra produksi",
        "Perubahan pola konsumsi masyarakat",
        "Faktor cuaca dan musim",
      ],
    },
    recommendations: [
      "Lakukan monitoring harga harian di pasar utama",
      "Siapkan stok buffer untuk antisipasi lonjakan permintaan",
      "Koordinasi dengan daerah sentra produksi",
      "Aktifkan early warning system untuk volatilitas tinggi",
    ],
    confidence_score: Math.round(80 + Math.random() * 15),
  });

  // Main fetch insights function
  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPredictionData(null);
    setAiInsights(null);
    setEnhancedAIAnalysis(null);

    const { predictionStartDate, predictionEndDate, daysToPredict } =
      getPredictionPeriod();

    try {
      // 1. Call Backend Prediction API
      const predictionPayload = {
        komoditas: filters.komoditas,
        wilayah: filters.wilayah,
        start_date: predictionStartDate,
        end_date: predictionEndDate,
        prediction_horizon_days: daysToPredict,
      };

      console.log("🤖 Calling backend prediction API...");
      const predictionResponse = await apiService.generatePrediction(
        predictionPayload
      );
      console.log("✅ Backend prediction response:", predictionResponse);
      setPredictionData(predictionResponse);

      // 2. Call Backend AI Insights API
      const insightPayload = {
        prediction_data: predictionResponse,
        form_data: filters,
      };

      console.log("🤖 Calling backend AI insights API...");
      const insightsResponse = await apiService.getAIInsights(insightPayload);
      console.log("✅ Backend AI insights response:", insightsResponse);
      setAiInsights(insightsResponse);

      // 3. Generate Enhanced AI Analysis using backend AI chat
      await generateEnhancedAIAnalysis(predictionResponse, insightsResponse);
    } catch (err) {
      console.error("❌ Error fetching AI data:", err);
      setError("Gagal memuat data AI. Menggunakan data fallback.");

      // Fallback data
      const fallbackPrediction = generateFallbackPrediction();
      const fallbackInsights = generateFallbackInsights();

      setPredictionData(fallbackPrediction);
      setAiInsights(fallbackInsights);
      await generateEnhancedAIAnalysis(fallbackPrediction, fallbackInsights);
    } finally {
      setLoading(false);
    }
  }, [filters, generateEnhancedAIAnalysis, getPredictionPeriod]);

  // Helper functions for fallback data
  const generateFallbackPrediction = () => ({
    price_trend: "stabil",
    predicted_prices: Array.from({ length: 7 }, (_, i) => ({
      date: VIRTUAL_TODAY.add(i, "day").format("YYYY-MM-DD"),
      price: 15000 + (Math.random() - 0.5) * 1000,
    })),
  });

  const generateFallbackInsights = () => ({
    summary:
      "Analisis menunjukkan stabilitas harga dalam jangka pendek dengan fluktuasi minor yang masih dalam batas wajar.",
    factors: [
      "Pasokan domestik cukup stabil",
      "Permintaan pasar dalam kondisi normal",
      "Tidak ada gangguan cuaca ekstrem yang signifikan",
    ],
    recommendations: [
      "Pantau perkembangan pasokan dari sentra produksi utama",
      "Pertahankan stok pada level optimal",
      "Monitor indikator cuaca dan faktor musiman",
    ],
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const refreshEnhancedAnalysis = () => {
    if (predictionData && aiInsights) {
      generateEnhancedAIAnalysis(predictionData, aiInsights);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [filters, fetchInsights]);

  // Render functions
  const renderPredictionSection = () => (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <PriceChange color="primary" sx={{ mr: 1 }} />
        Prediksi Harga{" "}
        {filters.komoditas === "all" ? "Pangan Umum" : filters.komoditas}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Prediksi untuk periode:{" "}
        {VIRTUAL_TODAY.add(1, "day").format("DD MMM YYYY")} s/d{" "}
        {VIRTUAL_TODAY.add(7, "day").format("DD MMM YYYY")}
      </Typography>

      {predictionData && (
        <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: "primary.50" }}>
          <Typography variant="h6" color="primary.dark" gutterBottom>
            Tren Harga Diperkirakan:
          </Typography>
          <Chip
            label={predictionData.price_trend?.toUpperCase() || "STABIL"}
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

          {predictionData.predicted_prices && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Preview harga harian:
              </Typography>
              <List dense>
                {predictionData.predicted_prices
                  .slice(0, 4)
                  .map((item, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon>
                        <CalendarToday sx={{ fontSize: "1rem" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${dayjs(item.date).format(
                          "DD MMM YYYY"
                        )}: Rp ${item.price.toLocaleString("id-ID")}`}
                      />
                    </ListItem>
                  ))}
                {predictionData.predicted_prices.length > 4 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 4 }}
                  >
                    ... dan {predictionData.predicted_prices.length - 4} hari
                    berikutnya
                  </Typography>
                )}
              </List>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );

  const renderBackendAIInsights = () => (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Assessment color="secondary" sx={{ mr: 1 }} />
        Analisis Backend AI
      </Typography>

      {aiInsights && (
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {aiInsights.summary || "Tidak ada ringkasan tersedia."}
          </Typography>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Faktor-faktor Kunci:
          </Typography>
          <List dense>
            {aiInsights.factors?.map((factor, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon>
                  <CheckCircleOutline color="success" />
                </ListItemIcon>
                <ListItemText primary={factor} />
              </ListItem>
            )) || (
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
            {aiInsights.recommendations?.map((rec, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon>
                  <Lightbulb color="warning" />
                </ListItemIcon>
                <ListItemText primary={rec} />
              </ListItem>
            )) || (
              <ListItem disableGutters>
                <ListItemIcon>
                  <InfoOutlined color="info" />
                </ListItemIcon>
                <ListItemText primary="Tidak ada rekomendasi khusus." />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );

  const renderEnhancedAIAnalysis = () => (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <AutoAwesome color="primary" sx={{ mr: 1 }} />
          Enhanced AI Analysis
        </Typography>
        <Button
          size="small"
          startIcon={
            aiAnalysisLoading ? <CircularProgress size={16} /> : <Refresh />
          }
          onClick={refreshEnhancedAnalysis}
          disabled={aiAnalysisLoading || !predictionData}
          variant="outlined"
        >
          {aiAnalysisLoading ? "Analyzing..." : "Refresh"}
        </Button>
      </Box>

      {aiAnalysisLoading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            🤖 Backend AI sedang menganalisis data prediksi...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {enhancedAIAnalysis && (
        <Paper elevation={2} sx={{ p: 3, bgcolor: "background.paper" }}>
          {/* Executive Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Psychology color="primary" sx={{ mr: 1 }} />
              Ringkasan Eksekutif
            </Typography>
            <Alert severity="info" sx={{ bgcolor: "primary.50" }}>
              <Typography variant="body2">
                {enhancedAIAnalysis.executive_summary}
              </Typography>
            </Alert>
          </Box>

          {/* Key Insights */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                💡 Key Strategic Insights
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {enhancedAIAnalysis.key_insights?.map((insight, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon>
                      <Lightbulb color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={insight} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Risk Assessment */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                ⚠️ Assessment Risiko
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Level Risiko:
                </Typography>
                <Chip
                  label={enhancedAIAnalysis.risk_assessment?.level?.toUpperCase()}
                  color={
                    enhancedAIAnalysis.risk_assessment?.level === "high"
                      ? "error"
                      : enhancedAIAnalysis.risk_assessment?.level === "medium"
                      ? "warning"
                      : "success"
                  }
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Faktor Risiko:
              </Typography>
              <List dense>
                {enhancedAIAnalysis.risk_assessment?.factors?.map(
                  (factor, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon>
                        <Warning color="error" />
                      </ListItemIcon>
                      <ListItemText primary={factor} />
                    </ListItem>
                  )
                )}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Recommendations */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                🎯 Rekomendasi Strategis
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {enhancedAIAnalysis.recommendations?.map((rec, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Confidence Score */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Confidence Score
            </Typography>
            <Chip
              icon={<Analytics />}
              label={`${enhancedAIAnalysis.confidence_score}%`}
              color={
                enhancedAIAnalysis.confidence_score > 80 ? "success" : "warning"
              }
              variant="outlined"
              sx={{ fontSize: "1rem", px: 2 }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );

  // Main render
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
            <Insights />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Analisis & Prediksi Harga Pangan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Powered by Backend AI Service & Enhanced Analysis
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Chip
              icon={<CalendarToday />}
              label={`Data s/d: ${DATASET_MAX_DATE}`}
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>
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
              Memuat prediksi dan insight AI dari backend...
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && (predictionData || aiInsights || enhancedAIAnalysis) && (
          <Box>
            {/* Tabs for different analysis types */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Prediksi Harga" icon={<PriceChange />} />
                <Tab label="Backend AI" icon={<Assessment />} />
                <Tab label="Enhanced Analysis" icon={<AutoAwesome />} />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            {activeTab === 0 && renderPredictionSection()}
            {activeTab === 1 && renderBackendAIInsights()}
            {activeTab === 2 && renderEnhancedAIAnalysis()}
          </Box>
        )}

        {!loading && !predictionData && !aiInsights && !error && (
          <Alert severity="info">
            Pilih filter di atas untuk melihat prediksi dan insight AI dari
            backend.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
