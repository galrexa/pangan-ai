import React, { useState } from "react";
import Plot from "react-plotly.js";
import {
  Card,
  CardContent,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ShowChart,
  CloudQueue,
  Event,
  CompareArrows,
} from "@mui/icons-material";
import {
  createPriceChartConfig,
  createWeatherChartConfig,
  createCorrelationChartConfig,
} from "../../services/chartUtils";

const ChartContainer = ({
  priceData = [],
  weatherData = [],
  correlationData = [],
  activeEvents = [],
  loading = false,
  error = null,
}) => {
  const [chartType, setChartType] = useState("price");
  const [weatherType, setWeatherType] = useState("temperature");

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleWeatherTypeChange = (event, newType) => {
    if (newType !== null) {
      setWeatherType(newType);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!priceData.length && chartType === "price") {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          Tidak ada data harga untuk filter yang dipilih
        </Alert>
      );
    }

    switch (chartType) {
      case "price":
        const priceConfig = createPriceChartConfig(
          priceData,
          "Trend Harga Pangan"
        );
        return (
          <Plot
            data={priceConfig.data}
            layout={priceConfig.layout}
            config={priceConfig.config}
            style={{ width: "100%", height: "400px" }}
            useResizeHandler
          />
        );

      case "weather":
        if (!weatherData.length) {
          return (
            <Alert severity="info" sx={{ m: 2 }}>
              Tidak ada data cuaca untuk filter yang dipilih
            </Alert>
          );
        }
        const weatherConfig = createWeatherChartConfig(
          weatherData,
          weatherType
        );
        return (
          <Plot
            data={weatherConfig.data}
            layout={weatherConfig.layout}
            config={weatherConfig.config}
            style={{ width: "100%", height: "400px" }}
            useResizeHandler
          />
        );

      case "correlation":
        if (!correlationData.length) {
          return (
            <Alert severity="info" sx={{ m: 2 }}>
              Data korelasi tidak tersedia
            </Alert>
          );
        }
        const correlationConfig = createCorrelationChartConfig(correlationData);
        return (
          <Plot
            data={correlationConfig.data}
            layout={correlationConfig.layout}
            config={correlationConfig.config}
            style={{ width: "100%", height: "400px" }}
            useResizeHandler
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ShowChart sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Visualisasi Data
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {activeEvents.map((event) => (
                  <Chip
                    key={event}
                    icon={<Event />}
                    label={event}
                    size="small"
                    color="warning"
                    sx={{ fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Chart Type Selector */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
            >
              <ToggleButton value="price">
                <ShowChart sx={{ mr: 0.5 }} />
                Harga
              </ToggleButton>
              <ToggleButton value="weather">
                <CloudQueue sx={{ mr: 0.5 }} />
                Cuaca
              </ToggleButton>
              <ToggleButton value="correlation">
                <CompareArrows sx={{ mr: 0.5 }} />
                Korelasi
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Weather Type Selector */}
            {chartType === "weather" && (
              <ToggleButtonGroup
                value={weatherType}
                exclusive
                onChange={handleWeatherTypeChange}
                size="small"
              >
                <ToggleButton value="temperature">Suhu</ToggleButton>
                <ToggleButton value="humidity">Kelembaban</ToggleButton>
                <ToggleButton value="rainfall">Hujan</ToggleButton>
                <ToggleButton value="windSpeed">Angin</ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>
        </Box>

        {/* Chart Rendering */}
        <Box sx={{ minHeight: 400 }}>{renderChart()}</Box>

        {/* Chart Info */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Tips:</strong>
            {chartType === "price" &&
              " Klik dan drag untuk zoom, double-click untuk reset view. Hover untuk detail data."}
            {chartType === "weather" &&
              " Data cuaca terintegrasi dengan data harga untuk analisis korelasi."}
            {chartType === "correlation" &&
              " Nilai korelasi mendekati 1 menunjukkan hubungan positif yang kuat."}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
