// File: frontend/src/components/Dashboard/ChartContainer.js
// SIMPLIFIED VERSION - Price Chart Only

import React, { useState, useMemo } from "react";
import Plot from "react-plotly.js";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ShowChart, Event, Palette } from "@mui/icons-material";

// Enhanced color palettes
const COMMODITY_COLORS = {
  "Cabai Rawit Merah": "#d32f2f", // Red
  "Cabai Merah Keriting": "#ff5722", // Deep Orange
  "Bawang Merah": "#9c27b0", // Purple
  "Bawang Putih": "#673ab7", // Deep Purple
  Tomat: "#f44336", // Light Red
  default: "#1976d2", // Blue
};

const REGION_COLORS = {
  "Kota Bandung": "#1976d2", // Blue
  "Kabupaten Bogor": "#388e3c", // Green
  "Kabupaten Cirebon": "#f57c00", // Orange
  "Kabupaten Majalengka": "#7b1fa2", // Purple
  "Kota Depok": "#00796b", // Teal
  "Kota Bekasi": "#455a64", // Blue Grey
  "Kabupaten Garut": "#5d4037", // Brown
  "Kabupaten Bandung": "#e91e63", // Pink
  default: "#666666", // Grey
};

const CHART_COLORS = [
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#d32f2f",
  "#7b1fa2",
  "#00796b",
  "#455a64",
  "#e91e63",
];

const ChartContainer = ({
  priceData = [],
  activeEvents = [],
  loading = false,
  error = null,
  onLoadMore = null,
}) => {
  const [colorBy, setColorBy] = useState("commodity"); // 'commodity' or 'region'

  // Process and group data for multi-series charts
  const processedChartData = useMemo(() => {
    if (!priceData.length) return [];

    // Group data by the selected criteria
    const grouped = {};

    priceData.forEach((item) => {
      const key = colorBy === "commodity" ? item.commodity : item.region;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    // Convert to Plotly traces
    return Object.entries(grouped).map(([key, data], index) => {
      const colorMap =
        colorBy === "commodity" ? COMMODITY_COLORS : REGION_COLORS;
      const color =
        colorMap[key] ||
        colorMap.default ||
        CHART_COLORS[index % CHART_COLORS.length];

      // Sort data by date
      const sortedData = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      return {
        x: sortedData.map((d) => d.date),
        y: sortedData.map((d) => d.price),
        type: "scatter",
        mode: "lines+markers",
        name: key,
        line: {
          color: color,
          width: 2,
        },
        marker: {
          color: color,
          size: 4,
          line: { color: "white", width: 1 },
        },
        hovertemplate: `
          <b>%{fullData.name}</b><br>
          Tanggal: %{x}<br>
          Harga: Rp %{y:,.0f}<br>
          <extra></extra>
        `,
      };
    });
  }, [priceData, colorBy]);

  const handleColorByChange = (event) => {
    setColorBy(event.target.value);
  };

  const renderChart = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Memuat chart...</Typography>
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

    if (!priceData.length) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          Tidak ada data harga untuk filter yang dipilih. Silakan ubah filter
          atau periode tanggal.
        </Alert>
      );
    }

    return (
      <Plot
        data={processedChartData}
        layout={{
          title: {
            text: `Trend Harga Pangan (Dikelompokkan berdasarkan ${
              colorBy === "commodity" ? "Komoditas" : "Wilayah"
            })`,
            font: { size: 16, weight: "bold" },
          },
          xaxis: {
            title: "Tanggal",
            type: "date",
            showgrid: true,
            gridcolor: "#f0f0f0",
          },
          yaxis: {
            title: "Harga (Rp)",
            tickformat: ",.0f",
            showgrid: true,
            gridcolor: "#f0f0f0",
          },
          showlegend: true,
          legend: {
            orientation: "h",
            y: -0.15,
            x: 0.5,
            xanchor: "center",
          },
          hovermode: "x unified",
          margin: { t: 60, r: 50, b: 100, l: 80 },
          plot_bgcolor: "white",
          paper_bgcolor: "white",
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"],
          displaylogo: false,
        }}
        style={{ width: "100%", height: "450px" }}
        useResizeHandler={true}
      />
    );
  };

  // Get unique commodities and regions for legend info
  const uniqueCommodities = [...new Set(priceData.map((d) => d.commodity))];
  const uniqueRegions = [...new Set(priceData.map((d) => d.region))];

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ShowChart sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Trend Harga Pangan
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

          {/* Chart Controls - Only Color Grouping */}
          {priceData.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Kelompokkan berdasarkan</InputLabel>
                <Select
                  value={colorBy}
                  onChange={handleColorByChange}
                  label="Kelompokkan berdasarkan"
                  startAdornment={<Palette sx={{ mr: 0.5, fontSize: 16 }} />}
                >
                  <MenuItem value="commodity">
                    Komoditas ({uniqueCommodities.length})
                  </MenuItem>
                  <MenuItem value="region">
                    Wilayah ({uniqueRegions.length})
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>

        {/* Chart Rendering */}
        <Box sx={{ minHeight: 400 }}>{renderChart()}</Box>

        {/* Data Info */}
        {/* <Box sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tips:</strong> Klik dan drag untuk zoom, double-click
                untuk reset view. Hover untuk detail data. Ubah pengelompokan
                untuk analisis yang berbeda.
              </Typography>
            </Grid>

            {priceData.length > 0 && (
              <Grid item xs={12} md={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "right" }}
                >
                  <strong>Data:</strong> {priceData.length} records
                  {onLoadMore && (
                    <Box component="span" sx={{ ml: 1 }}>
                      •{" "}
                      <Box
                        component="span"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={onLoadMore}
                      >
                        Load More
                      </Box>
                    </Box>
                  )}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box> */}
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
