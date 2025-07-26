// frontend/src/components/Prediction/SimpleResultsDisplay.js
// SIMPLE component untuk display prediction results langsung

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Schedule,
} from "@mui/icons-material";

const SimpleResultsDisplay = ({ predictionData, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Memproses Prediksi...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (!predictionData || !predictionData.success) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">No prediction data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Extract data with safe defaults
  const {
    predictions = [],
    current_price = 0,
    prediction_dates = [],
    trend_analysis = {},
    risk_assessment = {},
    summary = {},
  } = predictionData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = () => {
    const direction = trend_analysis.direction;
    if (direction === "INCREASING") return <TrendingUp color="success" />;
    if (direction === "DECREASING") return <TrendingDown color="error" />;
    return <Assessment color="info" />;
  };

  const getTrendColor = () => {
    const direction = trend_analysis.direction;
    if (direction === "INCREASING") return "success";
    if (direction === "DECREASING") return "error";
    return "info";
  };

  return (
    <Box>
      {/* Header */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", mb: 3 }}
      >
        {getTrendIcon()}
        <Box sx={{ ml: 1 }}>
          Hasil Prediksi Harga {predictionData.commodity}
        </Box>
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color="primary">
              {formatCurrency(current_price)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Harga Saat Ini
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color={getTrendColor()}>
              {trend_analysis.total_change_pct?.toFixed(1) || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Perubahan Prediksi
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Chip
              label={risk_assessment.risk_level || "MEDIUM"}
              color={
                risk_assessment.risk_level === "LOW"
                  ? "success"
                  : risk_assessment.risk_level === "HIGH"
                  ? "error"
                  : "warning"
              }
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Level Risiko
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{predictions.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Hari Prediksi
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Predictions Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Schedule sx={{ mr: 1 }} />
            Detail Prediksi Harian
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Tanggal</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Harga Prediksi</strong>
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
                {predictions.map((price, index) => {
                  const date = prediction_dates[index] || `Hari ${index + 1}`;
                  const change = predictionData.price_changes_pct?.[index] || 0;

                  return (
                    <TableRow key={index}>
                      <TableCell>{date}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={change >= 0 ? "success.main" : "error.main"}
                          variant="body2"
                        >
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={predictionData.confidence || "High"}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Summary & Recommendations */}
      {summary && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ringkasan & Rekomendasi
            </Typography>

            {summary.summary_text && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Ringkasan:</strong> {summary.summary_text}
              </Typography>
            )}

            {summary.recommendation && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Rekomendasi:</strong> {summary.recommendation}
              </Typography>
            )}

            {summary.confidence_level && (
              <Typography variant="body2" color="text.secondary">
                Tingkat Keyakinan: {summary.confidence_level}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SimpleResultsDisplay;
