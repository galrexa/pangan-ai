import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  Psychology,
  Lightbulb,
  Warning,
  Policy,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  Event,
  CloudQueue,
  Insights,
} from "@mui/icons-material";
import { apiService } from "../../services/api";

const AIInsights = ({
  predictionData,
  formData,
  loading: parentLoading = false,
}) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    analysis: true,
    recommendations: true,
    risks: false,
    policy: false,
  });

  useEffect(() => {
    if (predictionData && formData) {
      generateInsights();
    }
  }, [predictionData, formData]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const insightRequest = {
        prediction_data: predictionData,
        form_data: formData,
        context: "government_policy_making",
        language: "indonesian",
      };

      const response = await apiService.getAIInsights(insightRequest);
      setInsights(response.data);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Gagal menghasilkan AI insights. Silakan coba lagi.");

      // Fallback to mock insights for demo
      setInsights(generateMockInsights());
    } finally {
      setLoading(false);
    }
  };

  const generateMockInsights = () => {
    const { predictions = [], statistics = {} } = predictionData;
    const priceChange = statistics.predicted_change_percent || 0;

    return {
      summary: `Berdasarkan analisis model LSTM, harga ${
        formData.komoditas
      } di ${formData.wilayah} diprediksi akan ${
        priceChange > 0 ? "naik" : "turun"
      } sebesar ${Math.abs(priceChange).toFixed(1)}% dalam ${
        formData.prediction_days
      } hari ke depan.`,

      key_findings: [
        {
          type: "trend",
          title: "Trend Harga",
          description:
            priceChange > 5
              ? "Prediksi menunjukkan kenaikan harga yang signifikan yang perlu diantisipasi"
              : priceChange < -5
              ? "Prediksi menunjukkan penurunan harga yang dapat menguntungkan konsumen"
              : "Harga diprediksi relatif stabil dengan fluktuasi minimal",
          impact:
            priceChange > 10
              ? "high"
              : Math.abs(priceChange) > 5
              ? "medium"
              : "low",
        },
        {
          type: "weather",
          title: "Faktor Cuaca",
          description: formData.include_weather_forecast
            ? "Prediksi cuaca telah diintegrasikan dalam model dan menunjukkan pengaruh terhadap supply chain"
            : "Faktor cuaca tidak diintegrasikan dalam prediksi ini",
          impact: "medium",
        },
        {
          type: "seasonal",
          title: "Pola Musiman",
          description:
            "Analisis menunjukkan adanya pola musiman yang konsisten dengan periode sebelumnya",
          impact: "medium",
        },
      ],

      recommendations: [
        {
          category: "immediate",
          title: "Tindakan Segera (1-3 hari)",
          actions:
            priceChange > 10
              ? [
                  "Monitoring intensif harga pasar harian",
                  "Koordinasi dengan TPID daerah untuk kesiapan operasi pasar",
                  "Komunikasi publik tentang antisipasi kenaikan harga",
                ]
              : [
                  "Monitoring rutin harga pasar",
                  "Evaluasi stok strategis nasional",
                  "Update stakeholder tentang stabilitas harga",
                ],
        },
        {
          category: "short_term",
          title: "Strategi Jangka Pendek (1-2 minggu)",
          actions: [
            "Evaluasi efektivitas kebijakan distribusi",
            "Koordinasi dengan daerah penghasil utama",
            "Monitoring supply chain dan logistik",
          ],
        },
        {
          category: "policy",
          title: "Rekomendasi Kebijakan",
          actions:
            priceChange > 15
              ? [
                  "Pertimbangkan release cadangan strategis",
                  "Evaluasi kebijakan import temporer",
                  "Koordinasi lintas kementerian untuk intervensi pasar",
                ]
              : [
                  "Lanjutkan kebijakan stabilisasi existing",
                  "Fokus pada peningkatan produktivitas jangka panjang",
                  "Perkuat early warning system",
                ],
        },
      ],

      risk_factors: [
        {
          factor: "Volatilitas Harga Tinggi",
          probability: priceChange > 15 ? "high" : "medium",
          impact: "high",
          mitigation:
            "Siapkan operasi pasar dan release cadangan strategis jika diperlukan",
        },
        {
          factor: "Gangguan Supply Chain",
          probability: "medium",
          impact: "high",
          mitigation:
            "Monitoring transportasi dan distribusi, koordinasi dengan logistik",
        },
        {
          factor: "Faktor Cuaca Ekstrem",
          probability: formData.include_weather_forecast ? "medium" : "low",
          impact: "medium",
          mitigation:
            "Koordinasi dengan BMKG dan antisipasi dampak cuaca terhadap produksi",
        },
      ],

      confidence_score: statistics.model_accuracy || 0.85,
      generated_at: new Date().toISOString(),
    };
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getImpactColor = (impact) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success",
    };
    return colors[impact] || "default";
  };

  const getRiskColor = (probability) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "success",
    };
    return colors[probability] || "default";
  };

  if (parentLoading || !predictionData) {
    return (
      <Alert severity="info">
        Generate prediksi terlebih dahulu untuk melihat AI insights
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress sx={{ mr: 2 }} />
            <Typography variant="h6">Generating AI Insights...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={generateInsights}>
            Coba Lagi
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Psychology sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Insights & Recommendations
          </Typography>
          <Chip
            label={`${(insights.confidence_score * 100).toFixed(
              1
            )}% Confidence`}
            color="primary"
            size="small"
            sx={{ ml: "auto" }}
          />
        </Box>

        {/* Executive Summary */}
        <Alert severity="info" icon={<Insights />} sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {insights.summary}
          </Typography>
        </Alert>

        {/* Key Findings */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => toggleSection("analysis")}
            endIcon={
              expandedSections.analysis ? <ExpandLess /> : <ExpandMore />
            }
            sx={{ mb: 2, p: 0, justifyContent: "flex-start" }}
          >
            <Lightbulb sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Analisis Utama
            </Typography>
          </Button>

          <Collapse in={expandedSections.analysis}>
            <List>
              {insights.key_findings.map((finding, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon>
                    {finding.type === "trend" && <TrendingUp />}
                    {finding.type === "weather" && <CloudQueue />}
                    {finding.type === "seasonal" && <Event />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {finding.title}
                        <Chip
                          label={finding.impact}
                          size="small"
                          color={getImpactColor(finding.impact)}
                        />
                      </Box>
                    }
                    secondary={finding.description}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Recommendations */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => toggleSection("recommendations")}
            endIcon={
              expandedSections.recommendations ? <ExpandLess /> : <ExpandMore />
            }
            sx={{ mb: 2, p: 0, justifyContent: "flex-start" }}
          >
            <Policy sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Rekomendasi Tindakan
            </Typography>
          </Button>

          <Collapse in={expandedSections.recommendations}>
            {insights.recommendations.map((rec, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {rec.title}
                </Typography>
                <List dense>
                  {rec.actions.map((action, actionIndex) => (
                    <ListItem key={actionIndex} sx={{ pl: 2 }}>
                      <ListItemText
                        primary={`• ${action}`}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Collapse>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Risk Assessment */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => toggleSection("risks")}
            endIcon={expandedSections.risks ? <ExpandLess /> : <ExpandMore />}
            sx={{ mb: 2, p: 0, justifyContent: "flex-start" }}
          >
            <Warning sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Analisis Risiko
            </Typography>
          </Button>

          <Collapse in={expandedSections.risks}>
            <List>
              {insights.risk_factors.map((risk, index) => (
                <ListItem
                  key={index}
                  sx={{
                    pl: 0,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      width: "100%",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {risk.factor}
                    </Typography>
                    <Chip
                      label={`Probabilitas: ${risk.probability}`}
                      size="small"
                      color={getRiskColor(risk.probability)}
                    />
                    <Chip
                      label={`Dampak: ${risk.impact}`}
                      size="small"
                      color={getImpactColor(risk.impact)}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ pl: 0 }}
                  >
                    <strong>Mitigasi:</strong> {risk.mitigation}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>

        {/* Footer Info */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Catatan:</strong> Insights ini dihasilkan menggunakan AI
            Generatif berdasarkan hasil prediksi model LSTM. Rekomendasi
            bersifat saran dan perlu dikombinasikan dengan analisis kebijakan
            yang lebih mendalam. Generated pada:{" "}
            {new Date(insights.generated_at).toLocaleString("id-ID")}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
