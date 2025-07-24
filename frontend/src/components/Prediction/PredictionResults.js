import React, { useState } from "react";
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
} from "@mui/material";
import {
  ShowChart,
  TableChart,
  Assessment,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
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
  const [viewMode, setViewMode] = useState("chart");

  if (!predictionData && !loading && !error) {
    return (
      <Alert severity="info">
        Silakan isi form prediksi untuk melihat hasil forecasting
      </Alert>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6">Memproses prediksi...</Typography>
            <Typography variant="body2" color="text.secondary">
              Model LSTM sedang menganalisis data dan menghasilkan forecasting
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
      line: { color: CHART_COLORS[0], width: 2 },
      marker: { size: 4 },
    };

    const predictionTrace = {
      x: predictions.map((d) => d.date),
      y: predictions.map((d) => d.predicted_price),
      type: "scatter",
      mode: "lines+markers",
      name: "Prediksi",
      line: { color: CHART_COLORS[1], width: 3, dash: "dot" },
      marker: { size: 6 },
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
            fillcolor: "rgba(25, 118, 210, 0.1)",
            line: { color: "transparent" },
            name: "Confidence Interval",
            showlegend: true,
          }
        : null;

    const data = [historicalTrace, predictionTrace];
    if (confidenceTrace) data.push(confidenceTrace);

    return {
      data,
      layout: {
        title: "Prediksi Harga Pangan",
        xaxis: {
          title: "Tanggal",
          type: "date",
        },
        yaxis: {
          title: "Harga (IDR)",
          tickformat: ",.0f",
        },
        showlegend: true,
        hovermode: "x unified",
        margin: { t: 50, r: 50, b: 80, l: 100 },
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
              color: "red",
              width: 2,
              dash: "dash",
            },
          },
        ],
        annotations: [
          {
            x: predictions[0]?.date,
            y: 0.95,
            xref: "x",
            yref: "paper",
            text: "Mulai Prediksi",
            showarrow: true,
            arrowhead: 2,
            ax: 30,
            ay: -30,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ["lasso2d", "select2d"],
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
      low: { label: "Rendah", color: "success", icon: <CheckCircle /> },
      medium: { label: "Sedang", color: "warning", icon: <Warning /> },
      high: { label: "Tinggi", color: "error", icon: <Warning /> },
    };
    return riskLevels[level] || riskLevels.medium;
  };

  const riskInfo = getRiskLevel(risk_assessment.level);

  return (
    <Box>
      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Harga Saat Ini
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(statistics.current_price)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Prediksi Akhir
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(statistics.final_predicted_price)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {getPriceChangeIcon(statistics.predicted_change_percent)}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {statistics.predicted_change_percent >= 0 ? "+" : ""}
                  {statistics.predicted_change_percent?.toFixed(2)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Model Accuracy
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {(model_info.accuracy * 100)?.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                RMSE: {model_info.rmse?.toFixed(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Risk Level
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Chip
                  icon={riskInfo.icon}
                  label={riskInfo.label}
                  color={riskInfo.color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {risk_assessment.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Results */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Assessment sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Hasil Prediksi
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="chart">
                <ShowChart sx={{ mr: 0.5 }} />
                Chart
              </ToggleButton>
              <ToggleButton value="table">
                <TableChart sx={{ mr: 0.5 }} />
                Tabel
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {viewMode === "chart" && (
            <Plot
              {...createPredictionChart()}
              style={{ width: "100%", height: "500px" }}
              useResizeHandler
            />
          )}

          {viewMode === "table" && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Tanggal</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Prediksi Harga</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Lower Bound</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Upper Bound</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Perubahan</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Confidence</strong>
                    </TableCell>
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
                      <TableRow key={pred.date}>
                        <TableCell>{formatDate(pred.date)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(pred.predicted_price)}
                        </TableCell>
                        <TableCell align="right">
                          {confidence
                            ? formatCurrency(confidence.lower_bound)
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          {confidence
                            ? formatCurrency(confidence.upper_bound)
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            {getPriceChangeIcon(change)}
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {change >= 0 ? "+" : ""}
                              {change.toFixed(2)}%
                            </Typography>
                          </Box>
                        </TableCell>
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
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Model Information */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Informasi Model
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Model Type:</strong>{" "}
                  {model_info.type || "Hybrid SARIMA-LSTM"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Training Period:</strong>{" "}
                  {model_info.training_period || "2022-2025"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Last Updated:</strong>{" "}
                  {formatDate(model_info.last_updated || new Date())}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PredictionResults;
