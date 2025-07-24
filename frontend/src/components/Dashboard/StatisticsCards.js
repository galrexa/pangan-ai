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
  CloudQueue,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatNumber,
  calculatePercentageChange,
} from "../../utils/helpers";

const StatisticsCards = ({
  statistics = {},
  weatherStats = {},
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
      title: "Harga Saat Ini",
      value: formatCurrency(current_price),
      subtitle: `${priceChange >= 0 ? "+" : ""}${formatNumber(
        priceChange,
        2
      )}% dari sebelumnya`,
      icon: <AttachMoney />,
      color: getTrendColor(priceChange),
      trend: getTrendIcon(priceChange),
    },
    {
      title: "Harga Rata-rata",
      value: formatCurrency(avg_price),
      subtitle: `Range: ${formatCurrency(min_price)} - ${formatCurrency(
        max_price
      )}`,
      icon: <Assessment />,
      color: "info",
    },
    {
      title: "Volatilitas",
      value: `${formatNumber(price_volatility, 2)}%`,
      subtitle:
        price_volatility > 15
          ? "Tinggi"
          : price_volatility > 5
          ? "Sedang"
          : "Rendah",
      icon: <TrendingUp />,
      color:
        price_volatility > 15
          ? "error"
          : price_volatility > 5
          ? "warning"
          : "success",
      progress: (Math.min(price_volatility, 50) / 50) * 100,
    },
    {
      title: "Status Cuaca",
      value: weatherStats.temperature
        ? `${formatNumber(weatherStats.temperature, 1)}°C`
        : "N/A",
      subtitle: weatherStats.condition || "Data tidak tersedia",
      icon: <CloudQueue />,
      color: "primary",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Event color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Event Aktif
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {eventStats.active_events.map((event) => (
                    <Chip
                      key={event.name}
                      label={`${event.name} (${event.impact}% dampak harga)`}
                      color="warning"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default StatisticsCards;
