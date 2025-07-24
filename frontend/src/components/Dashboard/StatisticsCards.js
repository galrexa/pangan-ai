// File: frontend/src/components/Dashboard/StatisticsCards.js
// MODIFIED VERSION - No Weather, Add Min/Max Price

import React from "react";
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
  calculatePercentageChange,
} from "../../utils/helpers";

const StatisticsCards = ({
  statistics = {},
  eventStats = {},
  loading = false,
}) => {
  const {
    current_price = 0,
    previous_price = 0,
    avg_price = 0,
    min_price = 0,
    max_price = 0,
    price_volatility = 0,
  } = statistics;

  const priceChange = calculatePercentageChange(current_price, previous_price);

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
      title: "Harga Terakhir", // ✅ Changed from "Harga Saat Ini"
      value: formatCurrency(current_price),
      subtitle: `${priceChange >= 0 ? "+" : ""}${formatNumber(
        priceChange,
        2
      )}% dari periode sebelumnya`,
      icon: <AttachMoney />,
      color: getTrendColor(priceChange),
      trend: getTrendIcon(priceChange),
    },
    {
      title: "Harga Rata-rata",
      value: formatCurrency(avg_price),
      subtitle: `Berdasarkan semua data periode ini`,
      icon: <Assessment />,
      color: "info",
    },
    {
      title: "Harga Tertinggi", // ✅ New Card
      value: formatCurrency(max_price),
      subtitle: `Peak harga dalam periode ini`,
      icon: <KeyboardArrowUp />,
      color: "error",
    },
    {
      title: "Harga Terendah", // ✅ New Card
      value: formatCurrency(min_price),
      subtitle: `Lowest harga dalam periode ini`,
      icon: <KeyboardArrowDown />,
      color: "success",
    },
    {
      title: "Volatilitas", // ✅ Keep with explanation
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

      {/* Event Indicators - Enhanced Display */}
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
                  {eventStats.active_events.map((event) => (
                    <Chip
                      key={event.name}
                      label={`${event.name} (~${event.impact}% dampak)`}
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
              {statistics.data_points &&
                ` berdasarkan ${statistics.data_points} data points`}
              {statistics.date_range && ` periode ${statistics.date_range}`}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatisticsCards;
