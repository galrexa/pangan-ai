import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Alert, Snackbar } from "@mui/material";
import FilterPanel from "./FilterPanel";
import StatisticsCards from "./StatisticsCards";
import ChartContainer from "./ChartContainer";
import { apiService } from "../../services/api";
import { getLastNDays, parseDataRow } from "../../utils/helpers";

const HistoricalDashboard = () => {
  const [filters, setFilters] = useState({
    komoditas: "all",
    wilayah: "all",
    level_harga: "all",
    ...getLastNDays(30),
    include_weather: true,
    include_events: true,
  });

  const [data, setData] = useState({
    priceData: [],
    weatherData: [],
    correlationData: [],
    statistics: {},
    weatherStats: {},
    eventStats: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeEvents, setActiveEvents] = useState([]);
  const [weatherEnabled, setWeatherEnabled] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getHistoricalData({
        ...filters,
        limit: 50, // LIMIT DATA untuk test performa
      });

      const apiData = response.data;
      const rawData = apiData.data || apiData;

      if (!Array.isArray(rawData)) {
        console.warn("Data bukan array");
        setData({
          priceData: [],
          weatherData: [],
          correlationData: [],
          statistics: {
            current_price: 0,
            avg_price: 0,
            min_price: 0,
            max_price: 0,
            price_volatility: 0,
          },
          weatherStats: { temperature: 0, condition: "N/A" },
          eventStats: { active_events: [] },
        });
        return;
      }

      // SIMPLE processing - no parseDataRow
      const priceData = rawData.slice(0, 50).map((item) => ({
        date: item.tanggal,
        price: item.harga || 0,
        region: item.wilayah || "Unknown",
        commodity: item.komoditas || "Unknown",
      }));

      // Simple stats
      const prices = priceData.map((d) => d.price).filter((p) => p > 0);
      const statistics = {
        current_price: prices[prices.length - 1] || 0,
        avg_price:
          prices.length > 0
            ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
            : 0,
        min_price: prices.length > 0 ? Math.min(...prices) : 0,
        max_price: prices.length > 0 ? Math.max(...prices) : 0,
        price_volatility: 0,
        data_points: prices.length,
      };

      setData({
        priceData,
        weatherData: [], // Kosongkan untuk performance
        correlationData: [],
        statistics,
        weatherStats: { temperature: 25, condition: "Normal" },
        eventStats: { active_events: [] },
      });

      console.log(`✅ Data loaded: ${priceData.length} records`);
    } catch (err) {
      console.error("Error:", err);
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const calculateVolatility = (prices) => {
    if (prices.length < 2) return 0;
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      prices.length;
    return (Math.sqrt(variance) / mean) * 100;
  };

  const getWeatherCondition = (weather) => {
    if (!weather) return "N/A";
    if (weather.rainfall > 10) return "Hujan Lebat";
    if (weather.rainfall > 1) return "Hujan Ringan";
    if (weather.humidity > 80) return "Lembab";
    return "Cerah";
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const handleWeatherToggle = (enabled) => {
    setWeatherEnabled(enabled);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Historical Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analisis data historis harga pangan dengan integrasi data cuaca dan
          event monitoring
        </Typography>
      </Box>

      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        onApplyFilters={handleApplyFilters}
        activeEvents={activeEvents}
        weatherEnabled={weatherEnabled}
        onWeatherToggle={handleWeatherToggle}
      />

      <StatisticsCards
        statistics={data.statistics}
        weatherStats={data.weatherStats}
        eventStats={data.eventStats}
        loading={loading}
      />

      <ChartContainer
        priceData={data.priceData}
        weatherData={[]}
        correlationData={[]}
        activeEvents={activeEvents}
        loading={loading}
        error={error}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HistoricalDashboard;
