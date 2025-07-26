// File: frontend/src/components/Dashboard/StatisticsCards.js
// LIGHTWEIGHT VERSION - Minimal client-side processing

import React, { useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  AttachMoney,
  Assessment,
  Event,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatNumber,
  //calculatePercentageChange,
} from "../../utils/helpers";

const StatisticsCards = ({
  statistics = {},
  eventStats = {},
  loading = false,
  priceData = [],
  filters = {},
}) => {
  // LIGHTWEIGHT filtering - hanya filter dan hitung basic stats
  const filteredStatistics = useMemo(() => {
    if (!priceData.length) {
      return statistics; // Fallback ke original statistics
    }

    // Simple filtering
    let filtered = [...priceData]; // Make a copy

    // Filter by wilayah (simplified)
    if (filters.wilayah && filters.wilayah !== "all") {
      if (Array.isArray(filters.wilayah) && !filters.wilayah.includes("all")) {
        filtered = filtered.filter((item) =>
          filters.wilayah.includes(item.region)
        );
      } else if (!Array.isArray(filters.wilayah)) {
        filtered = filtered.filter((item) => item.region === filters.wilayah);
      }
    }

    // Filter by komoditas (simplified)
    if (filters.komoditas && filters.komoditas !== "all") {
      filtered = filtered.filter(
        (item) => item.commodity === filters.komoditas
      );
    }

    // Quick calculation (tidak complex)
    const prices = filtered.map((item) => item.price).filter((p) => p > 0);

    if (prices.length === 0) {
      return {
        ...statistics,
        data_points: 0,
        current_price: 0,
        avg_price: 0,
        min_price: 0,
        max_price: 0,
        price_change_percent: 0,
      };
    }

    // Simple stats only
    const min_price = Math.min(...prices);
    const max_price = Math.max(...prices);
    const avg_price = Math.round(
      prices.reduce((a, b) => a + b, 0) / prices.length
    );
    const current_price = prices[prices.length - 1] || 0;
    const previous_price = prices[prices.length - 2] || current_price;

    // Simple price change
    const price_change_percent =
      previous_price > 0
        ? Math.round(
            ((current_price - previous_price) / previous_price) * 100 * 100
          ) / 100
        : 0;

    const calculatedStats = {
      ...statistics, // Keep original complex calculations
      // Override with filtered simple calculations
      current_price: Math.round(current_price),
      previous_price: Math.round(previous_price),
      avg_price,
      min_price: Math.round(min_price),
      max_price: Math.round(max_price),
      data_points: prices.length,
      price_change_percent,
      // Keep original volatility (too complex to recalculate)
      price_volatility: statistics.price_volatility || 0,
    };
    return calculatedStats;
  }, [priceData, filters, statistics]);

  const {
    current_price = 0,
    //previous_price = 0,
    avg_price = 0,
    min_price = 0,
    max_price = 0,
    price_volatility = 0,
    data_points = 0,
    price_change_percent = 0,
  } = filteredStatistics;

  const getTrendIcon = (change) => {
    if (Math.abs(change) < 1) return <TrendingFlat color="success" />;
    return change > 0 ? (
      <TrendingUp color="error" />
    ) : (
      <TrendingDown color="primary" />
    );
  };

  const getTrendColor = (change) => {
    if (Math.abs(change) < 1) return "success";
    return change > 0 ? "error" : "primary";
  };

  const cards = [
    {
      title: "Harga Terakhir",
      value: formatCurrency(current_price),
      subtitle: `${price_change_percent >= 0 ? "+" : ""}${formatNumber(
        price_change_percent,
        2
      )}% dari periode sebelumnya`,
      icon: <AttachMoney />,
      color: getTrendColor(price_change_percent),
      trend: getTrendIcon(price_change_percent),
    },
    {
      title: "Harga Rata-rata",
      value: formatCurrency(avg_price),
      subtitle:
        data_points > 0
          ? `Berdasarkan ${data_points} data points`
          : "Berdasarkan semua data periode ini",
      icon: <Assessment />,
      color: "info",
    },
    {
      title: "Harga Tertinggi",
      value: formatCurrency(max_price),
      subtitle: `Peak harga dalam periode ini`,
      icon: <KeyboardArrowUp />,
      color: "error",
    },
    {
      title: "Harga Terendah",
      value: formatCurrency(min_price),
      subtitle: `Lowest harga dalam periode ini`,
      icon: <KeyboardArrowDown />,
      color: "success",
    },
    {
      title: "Volatilitas",
      value: `${formatNumber(price_volatility, 2)}%`,
      subtitle:
        price_volatility > 15
          ? "Tinggi - Harga sering berubah drastis"
          : price_volatility > 5
          ? "Sedang - Fluktuasi normal"
          : "Rendah - Harga cenderung stabil",
      icon: <TrendingUp />,
      color:
        price_volatility > 15
          ? "error"
          : price_volatility > 5
          ? "warning"
          : "success",
      progress: (Math.min(price_volatility, 50) / 50) * 100,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Main Statistics Cards */}
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={index < 4 ? 3 : 12} key={index}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    variant="body2"
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {loading ? "..." : card.value}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {card.subtitle}
                  </Typography>

                  {card.progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={card.progress}
                        color={card.color}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        💡 Volatilitas mengukur seberapa sering harga naik-turun
                        dalam periode tertentu
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    ml: 1,
                  }}
                >
                  <Chip
                    icon={card.icon}
                    label=""
                    color={card.color}
                    sx={{
                      "& .MuiChip-label": { display: "none" },
                      "& .MuiChip-icon": { margin: 0 },
                    }}
                  />
                  {card.trend && <Box sx={{ mt: 1 }}>{card.trend}</Box>}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Event Indicators */}
      {eventStats.active_events && eventStats.active_events.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Event color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Event yang Mempengaruhi Harga
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", gap: 1, flexWrap: "wrap", flex: 1 }}
                >
                  {eventStats.active_events.map((event, index) => (
                    <Chip
                      key={event.name || index}
                      label={
                        typeof event === "string"
                          ? event
                          : `${event.name} (~${event.impact}% dampak)`
                      }
                      color="warning"
                      size="small"
                      icon={<Event />}
                    />
                  ))}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  💡 Event khusus dapat mempengaruhi demand dan supply komoditas
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Summary Info Card */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: "grey.50" }}>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              📊 <strong>Ringkasan:</strong> Harga berkisar antara{" "}
              {formatCurrency(min_price)} - {formatCurrency(max_price)}
              {data_points > 0 && ` berdasarkan ${data_points} data points`}
              {statistics.date_range && ` periode ${statistics.date_range}`}
              {/* Show filter info jika ada */}
              {filters.wilayah && filters.wilayah !== "all" && (
                <span>
                  {" "}
                  untuk wilayah{" "}
                  <strong>
                    {Array.isArray(filters.wilayah)
                      ? filters.wilayah.join(", ")
                      : filters.wilayah}
                  </strong>
                </span>
              )}
              {filters.komoditas && filters.komoditas !== "all" && (
                <span>
                  {" "}
                  komoditas <strong>{filters.komoditas}</strong>
                </span>
              )}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatisticsCards;
