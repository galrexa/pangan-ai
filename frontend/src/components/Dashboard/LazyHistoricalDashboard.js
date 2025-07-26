// File: frontend/src/components/Dashboard/LazyHistoricalDashboard.js
// REDESIGNED VERSION - Aligned with theme.js
/* eslint-disable no-unused-vars */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Snackbar, Alert, Typography, Container, Box } from "@mui/material";

import theme from "../../styles/theme";
import FilterPanel from "./FilterPanel";
import StatisticsCards from "./StatisticsCards";
import ChartContainer from "./ChartContainer";
import SeasonalEventsInfo from "./SeasonalEventsInfo";
import apiService from "../../services/api";

const LazyHistoricalDashboard = () => {
  const initialLoadDone = useRef(false);
  const currentRequestRef = useRef(null);

  const DATASET_MAX_DATE = "2025-05-31";

  const getInitialFilters = () => {
    const maxDate = new Date(DATASET_MAX_DATE);
    const startDate = new Date(maxDate);
    startDate.setDate(startDate.getDate() - 30);

    return {
      komoditas: "all",
      wilayah: "all",
      date_range: 30,
      start_date: startDate.toISOString().split("T")[0],
      end_date: DATASET_MAX_DATE,
      include_weather: false,
      include_events: true,
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
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

  // Volatility calculation (unchanged)
  const calculateVolatility = useCallback((prices) => {
    if (!prices || prices.length < 2) return 0;
    const validPrices = prices.filter((price) => price > 0 && !isNaN(price));
    if (validPrices.length < 2) return 0;
    const mean =
      validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
    const variance =
      validPrices.reduce((sum, price) => Math.pow(price - mean, 2), 0) /
      validPrices.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / mean) * 100;
    const boundedVolatility = Math.min(25, Math.max(1, coefficientOfVariation));
    return Math.round(boundedVolatility * 100) / 100;
  }, []);

  // Advanced stats calculation (unchanged)
  const calculateAdvancedStats = useCallback((prices) => {
    if (!prices || prices.length < 2) return {};
    const validPrices = prices.filter((price) => price > 0 && !isNaN(price));
    if (validPrices.length < 2) return {};
    const sortedPrices = [...validPrices].sort((a, b) => a - b);
    const medianIndex = Math.floor(validPrices.length * 0.5);
    const median = sortedPrices[medianIndex];
    const firstHalf = validPrices.slice(0, Math.floor(validPrices.length / 2));
    const secondHalf = validPrices.slice(Math.floor(validPrices.length / 2));
    const firstHalfAvg =
      firstHalf.reduce((sum, price) => sum + price, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length;
    const trendDirection =
      secondHalfAvg > firstHalfAvg ? "increasing" : "decreasing";
    const trendStrength =
      Math.abs((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    return {
      median,
      trendDirection,
      trendStrength,
      dataQuality: validPrices.length / prices.length,
    };
  }, []);

  // Memoized data processing (unchanged)
  const processedData = useMemo(() => {
    if (!data.priceData.length) return { priceData: [], statistics: {} };
    const prices = data.priceData.map((d) => d.price).filter((p) => p > 0);
    const volatility = calculateVolatility(prices);
    const advancedStats = calculateAdvancedStats(prices);
    const priceChange =
      prices.length > 1
        ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
        : 0;
    return {
      priceData: data.priceData,
      statistics: {
        current_price: prices[prices.length - 1] || 0,
        previous_price: prices[prices.length - 2] || 0,
        avg_price:
          prices.length > 0
            ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
            : 0,
        min_price: prices.length > 0 ? Math.min(...prices) : 0,
        max_price: prices.length > 0 ? Math.max(...prices) : 0,
        price_volatility: volatility,
        price_change_percent: Math.round(priceChange * 100) / 100,
        data_points: prices.length,
        date_range: `${filters.start_date} - ${filters.end_date}`,
        median_price: advancedStats.median || 0,
        trend_direction: advancedStats.trendDirection || "stable",
        trend_strength:
          Math.round((advancedStats.trendStrength || 0) * 100) / 100,
        data_quality: Math.round((advancedStats.dataQuality || 0) * 100),
      },
    };
  }, [
    data.priceData,
    filters.start_date,
    filters.end_date,
    calculateVolatility,
    calculateAdvancedStats,
  ]);

  // Debounced API call (unchanged)
  const debouncedLoadData = useCallback((currentFilters) => {
    const loadData = debounce(async (filters) => {
      if (currentRequestRef.current) {
        currentRequestRef.current = null;
      }
      setLoading(true);
      setError(null);
      try {
        const requestId = Date.now();
        currentRequestRef.current = requestId;
        const startDate = new Date(filters.start_date);
        const endDate = new Date(filters.end_date);
        const daysDiff = Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );
        let wilayahParam = filters.wilayah;
        if (Array.isArray(wilayahParam)) {
          if (wilayahParam.includes("all") || wilayahParam.length === 0) {
            wilayahParam = "all";
          } else {
            wilayahParam = wilayahParam.join(",");
          }
        }
        const apiParams = {
          komoditas: filters.komoditas,
          wilayah: wilayahParam,
          start_date: filters.start_date,
          end_date: filters.end_date,
          include_weather: false,
          include_events: true,
          limit: 5000,
        };
        const response = await apiService.getHistoricalData(apiParams);
        if (currentRequestRef.current !== requestId) {
          return;
        }
        const apiData = response.data;
        const rawData = apiData.data || apiData;
        if (!Array.isArray(rawData)) {
          throw new Error("Data format tidak valid dari server");
        }
        const processDataLazy = (dataArray, chunkSize = 50) => {
          return new Promise((resolve) => {
            let processedCount = 0;
            const result = [];
            const processChunk = () => {
              if (currentRequestRef.current !== requestId) {
                return;
              }
              const chunk = dataArray.slice(
                processedCount,
                processedCount + chunkSize
              );
              chunk.forEach((item) => {
                result.push({
                  date: item.tanggal,
                  price: item.harga || 0,
                  region: item.wilayah || "Unknown",
                  commodity: item.komoditas || "Unknown",
                  weather: null,
                });
              });
              processedCount += chunkSize;
              if (processedCount >= dataArray.length) {
                resolve(result);
              } else {
                setTimeout(processChunk, 0);
              }
            };
            processChunk();
          });
        };
        const priceData = await processDataLazy(rawData);
        if (currentRequestRef.current !== requestId) {
          return;
        }
        const events = apiData.events || [];
        const eventNames = events
          .map((e) => e.name || e.event_name)
          .filter(Boolean);
        setActiveEvents(eventNames);
        setData({
          priceData,
          weatherData: [],
          correlationData: [],
          statistics: {},
          weatherStats: {},
          eventStats: { active_events: eventNames },
        });
      } catch (err) {
        console.error("❌ Load data error:", err);
        setError(`Gagal memuat data: ${err.message}`);
        setData({
          priceData: [],
          weatherData: [],
          correlationData: [],
          statistics: {},
          weatherStats: {},
          eventStats: { active_events: [] },
        });
      } finally {
        if (currentRequestRef.current) {
          setLoading(false);
          currentRequestRef.current = null;
        }
      }
    }, 800);
    loadData(currentFilters);
  }, []);

  // Initial data load (unchanged)
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      debouncedLoadData(filters);
    }
  }, [debouncedLoadData, filters]);

  // Handle filters change (unchanged)
  const handleFiltersChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      debouncedLoadData(newFilters);
    },
    [debouncedLoadData]
  );

  // Apply filters (unchanged)
  const handleApplyFilters = useCallback(() => {
    debouncedLoadData(filters);
  }, [filters, debouncedLoadData]);

  return (
    <Container
      maxWidth="xl"
      sx={{
        // Apply theme's container padding
        ...theme.components.MuiContainer.styleOverrides.root,
        // Add custom gradient background
        background: theme.pangan.gradients.card,
        // Use theme's border radius
        borderRadius: theme.shape.borderRadius,
        // Add shadow for depth
        boxShadow: theme.shadows[3],
        // Responsive padding
        py: {
          xs: theme.responsive.spacing.mobile,
          sm: theme.responsive.spacing.tablet,
          md: theme.responsive.spacing.desktop,
        },
      }}
    >
      <Box
        sx={{
          mb: {
            xs: theme.spacing(3),
            md: theme.spacing(4),
          },
          // Apply subtle animation
          transition: `all ${theme.pangan.animation.normal} ease-in-out`,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            // Use theme's typography
            ...theme.typography.h4,
            // Use primary color
            color: theme.palette.primary.main,
            // Add hover effect
            "&:hover": {
              color: theme.palette.primary.dark,
              transition: `color ${theme.pangan.animation.fast}`,
            },
          }}
        >
          Historical Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            // Use theme's typography
            ...theme.typography.body1,
            // Use secondary text color
            color: theme.palette.text.secondary,
            mt: theme.spacing(1),
          }}
        >
          Analisis data historis harga pangan dengan perhitungan volatility yang
          enhanced (Data sampai {DATASET_MAX_DATE})
        </Typography>
      </Box>

      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        onApplyFilters={handleApplyFilters}
        activeEvents={activeEvents}
        sx={{
          // Use theme's card styles
          ...theme.components.MuiCard.styleOverrides.root,
          // Add custom commodity color for border
          borderColor: theme.palette.custom.commodity.general,
          mb: theme.responsive.spacing.desktop,
        }}
      />

      <StatisticsCards
        statistics={processedData.statistics}
        weatherStats={data.weatherStats}
        eventStats={data.eventStats}
        loading={loading}
        priceData={data.priceData}
        filters={filters}
        sx={{
          // Responsive grid layout
          display: "grid",
          gap: theme.responsive.spacing.mobile,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
          },
          mb: theme.responsive.spacing.desktop,
        }}
      />

      <ChartContainer
        priceData={processedData.priceData}
        activeEvents={activeEvents}
        loading={loading}
        error={error}
        filters={filters}
        sx={{
          // Use theme's paper styles
          ...theme.components.MuiPaper.styleOverrides.root,
          // Add custom chart colors
          background: theme.pangan.gradients.card,
          p: {
            xs: theme.responsive.spacing.mobile,
            md: theme.responsive.spacing.desktop,
          },
          mb: theme.responsive.spacing.desktop,
        }}
      />

      <SeasonalEventsInfo
        priceData={data.priceData}
        filters={filters}
        title="Analisis Event Seasonal"
        sx={{
          // Use theme's card styles
          ...theme.components.MuiCard.styleOverrides.root,
          // Add volatility-based border color
          borderColor:
            processedData.statistics.price_volatility >
            theme.pangan.volatility.medium.threshold
              ? theme.pangan.volatility.high.color
              : processedData.statistics.price_volatility >
                theme.pangan.volatility.low.threshold
              ? theme.pangan.volatility.medium.color
              : theme.pangan.volatility.low.color,
        }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        sx={{
          // Use theme's z-index
          zIndex: theme.zIndex.snackbar,
        }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{
            // Use theme's error color
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            borderRadius: theme.responsive.borderRadius.medium,
            // Add shadow
            boxShadow: theme.shadows[2],
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Debounce utility (unchanged)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default LazyHistoricalDashboard;
