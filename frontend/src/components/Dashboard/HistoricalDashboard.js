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
      // Fetch historical data
      const response = await apiService.getHistoricalData(filters);
      const rawData = response.data;

      // Process and parse data
      const processedData = rawData.map(parseDataRow);

      // Extract price data
      const priceData = processedData.map((item) => ({
        date: item.date,
        price: item.price.value,
        region: item.region,
        commodity: item.price.commodity,
        level: item.price.level,
      }));

      // Extract weather data if enabled
      const weatherData = filters.include_weather
        ? processedData.map((item) => ({
            date: item.date,
            temperature: item.weather.temperature,
            humidity: item.weather.humidity,
            rainfall: item.weather.rainfall,
            windSpeed: item.weather.windSpeed,
          }))
        : [];

      // Extract active events
      const events = [];
      if (filters.include_events) {
        processedData.forEach((item) => {
          if (item.events.ramadan) events.push("Ramadan");
          if (item.events.idulFitri) events.push("Idul Fitri");
          if (item.events.christmasNewYear) events.push("Natal & Tahun Baru");
        });
      }
      const uniqueEvents = [...new Set(events)];

      // Calculate statistics
      const prices = priceData.map((d) => d.price);
      const statistics = {
        current_price: prices[prices.length - 1] || 0,
        previous_price: prices[prices.length - 2] || 0,
        avg_price:
          prices.reduce((sum, price) => sum + price, 0) / prices.length || 0,
        min_price: Math.min(...prices) || 0,
        max_price: Math.max(...prices) || 0,
        price_volatility: calculateVolatility(prices),
      };

      // Weather statistics
      const weatherStats =
        weatherData.length > 0
          ? {
              temperature: weatherData[weatherData.length - 1]?.temperature,
              condition: getWeatherCondition(
                weatherData[weatherData.length - 1]
              ),
            }
          : {};

      // Event statistics
      const eventStats = {
        active_events: uniqueEvents.map((event) => ({
          name: event,
          impact: Math.random() * 20 + 5, // Mock impact percentage
        })),
      };

      // Mock correlation data (should come from backend)
      const correlationData = [
        { factor: "Suhu", correlation: 0.23 },
        { factor: "Kelembaban", correlation: -0.15 },
        { factor: "Curah Hujan", correlation: 0.08 },
        { factor: "Kecepatan Angin", correlation: -0.05 },
        { factor: "Event Ramadan", correlation: 0.35 },
        { factor: "Event Idul Fitri", correlation: 0.42 },
      ];

      setData({
        priceData,
        weatherData,
        correlationData,
        statistics,
        weatherStats,
        eventStats,
      });

      setActiveEvents(uniqueEvents);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
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
        weatherData={data.weatherData}
        correlationData={data.correlationData}
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
