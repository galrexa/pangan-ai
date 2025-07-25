import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import {
  formatCurrency,
  formatDate,
  calculatePercentageChange,
} from "../../utils/helpers";
import { CHART_COLORS } from "../../utils/constants";

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

  useEffect(() => {
    if (predictionData && !loading) {
      setAnimationPlayed(true);
    }
  }, [predictionData, loading]);

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
          text: `🔮 Prediksi Harga Pangan - Model AI`,
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
          filename: "prediksi_harga_pangan",
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
                    Model: {model_info.type || "Hybrid SARIMA-LSTM"}
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

            {/* Advanced Analytics Section */}
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
                  <Analytics color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Analisis Mendalam
                  </Typography>
                  <Chip
                    label="Advanced"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Model Performance Metrics */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={1} sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 2 }}
                        >
                          📊 Model Performance
                        </Typography>
                        <Box sx={{ space: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">Accuracy:</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {(model_info.accuracy * 100)?.toFixed(2)}%
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">RMSE:</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {model_info.rmse?.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">
                              Training Period:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {model_info.training_period || "2022-2025"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              Last Updated:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatDate(
                                model_info.last_updated || new Date()
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Prediction Statistics */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={1} sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 2 }}
                        >
                          🎯 Statistik Prediksi
                        </Typography>
                        <Box sx={{ space: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">Periode:</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {predictions.length} hari
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">
                              Avg. Confidence:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {predictions.length > 0
                                ? (
                                    predictions.reduce(
                                      (sum, p) => sum + (p.confidence || 0),
                                      0
                                    ) / predictions.length
                                  ).toFixed(1)
                                : 0}
                              %
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">
                              Price Range:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {formatCurrency(
                                Math.min(
                                  ...predictions.map((p) => p.predicted_price)
                                )
                              )}{" "}
                              -{" "}
                              {formatCurrency(
                                Math.max(
                                  ...predictions.map((p) => p.predicted_price)
                                )
                              )}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">Volatility:</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {Math.abs(
                                statistics.predicted_change_percent || 0
                              ).toFixed(1)}
                              %
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Risk Factors */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={1} sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 2 }}
                        >
                          ⚠️ Faktor Risiko
                        </Typography>
                        <Box sx={{ space: 1 }}>
                          <Alert
                            severity={riskInfo.color}
                            sx={{ mb: 2, py: 0.5 }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Risk Level: {riskInfo.label}
                            </Typography>
                          </Alert>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Deskripsi:</strong>{" "}
                            {risk_assessment.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Rekomendasi:</strong>
                            {risk_assessment.level === "high"
                              ? " Perlu monitoring intensif dan persiapan intervensi pasar."
                              : risk_assessment.level === "medium"
                              ? " Monitoring rutin dan kesiagaan operasi pasar."
                              : " Monitoring standar, kondisi relatif stabil."}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
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
                    dihasilkan menggunakan model
                    <strong>
                      {" "}
                      {model_info.type || "Hybrid SARIMA-LSTM"}
                    </strong>{" "}
                    dengan akurasi
                    <strong> {(model_info.accuracy * 100)?.toFixed(1)}%</strong>
                    . Confidence interval menunjukkan rentang kemungkinan harga
                    dengan tingkat kepercayaan tinggi.
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
                      <strong>Model Version:</strong> v2.1.0
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default PredictionResults;
