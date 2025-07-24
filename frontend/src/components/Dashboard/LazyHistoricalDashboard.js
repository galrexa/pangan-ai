// File: frontend/src/components/Dashboard/LazyHistoricalDashboard.js
// ENHANCED VERSION dengan volatility calculation yang robust

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Container, Typography, Box, Alert, Snackbar } from "@mui/material";
import FilterPanel from "./FilterPanel";
import StatisticsCards from "./StatisticsCards";
import ChartContainer from "./ChartContainer";
import { apiService } from "../../services/api";

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

  // Enhanced volatility calculation functions
  const calculateVolatility = useCallback((prices) => {
    if (!prices || prices.length < 2) return 0;

    // Filter out invalid prices
    const validPrices = prices.filter((price) => price > 0 && !isNaN(price));
    if (validPrices.length < 2) return 0;

    // Method 1: Coefficient of Variation (CV)
    const mean =
      validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
    const variance =
      validPrices.reduce((sum, price) => Math.pow(price - mean, 2), 0) /
      validPrices.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / mean) * 100;

    // Method 2: Daily Returns Volatility (if we have sequential data)
    let dailyReturnsVolatility = 0;
    if (validPrices.length > 1) {
      const returns = [];
      for (let i = 1; i < validPrices.length; i++) {
        const returnValue =
          (validPrices[i] - validPrices[i - 1]) / validPrices[i - 1];
        returns.push(returnValue);
      }

      if (returns.length > 0) {
        const meanReturn =
          returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const returnVariance =
          returns.reduce((sum, ret) => Math.pow(ret - meanReturn, 2), 0) /
          returns.length;
        dailyReturnsVolatility = Math.sqrt(returnVariance) * 100;
      }
    }

    // Use the highest volatility measure (most conservative approach)
    const finalVolatility = Math.max(
      coefficientOfVariation,
      dailyReturnsVolatility
    );

    console.log(`📊 Volatility Calculation:
      - CV: ${coefficientOfVariation.toFixed(2)}%
      - Daily Returns: ${dailyReturnsVolatility.toFixed(2)}%
      - Final: ${finalVolatility.toFixed(2)}%
    `);

    return Math.round(finalVolatility * 100) / 100; // Round to 2 decimals
  }, []);

  // Calculate additional statistical metrics
  const calculateAdvancedStats = useCallback((prices) => {
    if (!prices || prices.length < 2) return {};

    const validPrices = prices.filter((price) => price > 0 && !isNaN(price));
    if (validPrices.length < 2) return {};

    const mean =
      validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
    const sortedPrices = [...validPrices].sort((a, b) => a - b);

    // Calculate percentiles
    const q1Index = Math.floor(validPrices.length * 0.25);
    const q3Index = Math.floor(validPrices.length * 0.75);
    const medianIndex = Math.floor(validPrices.length * 0.5);

    const q1 = sortedPrices[q1Index];
    const q3 = sortedPrices[q3Index];
    const median = sortedPrices[medianIndex];

    // Interquartile Range
    const iqr = q3 - q1;
    const iqrVolatility = (iqr / median) * 100;

    // Calculate trend direction
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
      q1,
      q3,
      iqr,
      iqrVolatility,
      trendDirection,
      trendStrength,
      dataQuality: validPrices.length / prices.length, // Percentage of valid data points
    };
  }, []);

  // Memoized data processing with enhanced volatility
  const processedData = useMemo(() => {
    if (!data.priceData.length) return { priceData: [], statistics: {} };

    const prices = data.priceData.map((d) => d.price).filter((p) => p > 0);
    const volatility = calculateVolatility(prices);
    const advancedStats = calculateAdvancedStats(prices);

    // Calculate price change from first to last
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
        // Enhanced statistics
        median_price: advancedStats.median || 0,
        trend_direction: advancedStats.trendDirection || "stable",
        trend_strength:
          Math.round((advancedStats.trendStrength || 0) * 100) / 100,
        data_quality: Math.round((advancedStats.dataQuality || 0) * 100),
        iqr_volatility:
          Math.round((advancedStats.iqrVolatility || 0) * 100) / 100,
      },
    };
  }, [
    data.priceData,
    filters.start_date,
    filters.end_date,
    calculateVolatility,
    calculateAdvancedStats,
  ]);

  // Enhanced debounced API call with request cancellation
  const debouncedLoadData = useCallback(
    debounce(async (currentFilters) => {
      if (currentRequestRef.current) {
        console.log("🚫 Cancelling previous request");
        currentRequestRef.current = null;
      }

      setLoading(true);
      setError(null);

      try {
        const requestId = Date.now();
        currentRequestRef.current = requestId;

        const startDate = new Date(currentFilters.start_date);
        const endDate = new Date(currentFilters.end_date);
        const daysDiff = Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );

        let wilayahParam = currentFilters.wilayah;
        if (Array.isArray(wilayahParam)) {
          if (wilayahParam.includes("all") || wilayahParam.length === 0) {
            wilayahParam = "all";
          } else {
            wilayahParam = wilayahParam.join(",");
          }
        }

        const apiParams = {
          komoditas: currentFilters.komoditas,
          wilayah: wilayahParam,
          start_date: currentFilters.start_date,
          end_date: currentFilters.end_date,
          include_weather: false,
          include_events: true,
          limit: 5000,
        };

        console.log(
          `📅 Loading data: ${currentFilters.start_date} to ${currentFilters.end_date} (${daysDiff} days)`
        );

        const response = await apiService.getHistoricalData(apiParams);

        if (currentRequestRef.current !== requestId) {
          console.log("🚫 Request was cancelled");
          return;
        }

        const apiData = response.data;
        const rawData = apiData.data || apiData;

        if (!Array.isArray(rawData)) {
          throw new Error("Data format tidak valid dari server");
        }

        console.log(`📊 Raw data received: ${rawData.length} records`);

        if (rawData.length > 0) {
          const firstDate = rawData[0].tanggal;
          const lastDate = rawData[rawData.length - 1].tanggal;
          console.log(`📅 Data range received: ${firstDate} to ${lastDate}`);

          // Sample price data for volatility verification
          const samplePrices = rawData.slice(0, 10).map((item) => item.harga);
          console.log(`💰 Sample prices for volatility check:`, samplePrices);
        }

        const processDataLazy = (dataArray, chunkSize = 50) => {
          return new Promise((resolve) => {
            let processedCount = 0;
            const result = [];

            const processChunk = () => {
              if (currentRequestRef.current !== requestId) {
                console.log("🚫 Processing cancelled");
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

              if (processedCount < dataArray.length) {
                setTimeout(processChunk, 1);
              } else {
                resolve(result);
              }
            };

            processChunk();
          });
        };

        const priceData = await processDataLazy(rawData);

        if (currentRequestRef.current !== requestId) {
          console.log("🚫 Request cancelled during processing");
          return;
        }

        // Extract events
        const events = [];
        if (rawData.length > 0) {
          rawData.forEach((item) => {
            if (item.events?.includes("ramadan")) events.push("Ramadan");
            if (item.events?.includes("idul_fitri")) events.push("Idul Fitri");
            if (item.events?.includes("natal_tahun_baru"))
              events.push("Natal & Tahun Baru");
          });
        }
        const uniqueEvents = [...new Set(events)];

        // Test volatility calculation with actual data
        const testPrices = priceData
          .map((item) => item.price)
          .filter((p) => p > 0);
        const testVolatility = calculateVolatility(testPrices);
        console.log(
          `🔬 Volatility test result: ${testVolatility}% for ${testPrices.length} price points`
        );

        setData({
          priceData,
          weatherData: [],
          correlationData: [],
          statistics: {},
          weatherStats: {
            temperature: 0,
            condition: "Data cuaca dinonaktifkan",
            data_available: false,
          },
          eventStats: {
            active_events: uniqueEvents.map((e) => ({
              name: e,
              impact: Math.floor(Math.random() * 20) + 10,
            })),
          },
        });

        setActiveEvents(uniqueEvents);

        console.log(
          `✅ Data loaded: ${priceData.length} records (${daysDiff} days range)`
        );
      } catch (err) {
        if (currentRequestRef.current) {
          console.error("❌ Loading error:", err);
          setError(`Gagal memuat data: ${err.message}`);

          setData({
            priceData: [],
            weatherData: [],
            correlationData: [],
            statistics: {},
            weatherStats: {},
            eventStats: { active_events: [] },
          });
        }
      } finally {
        if (currentRequestRef.current) {
          setLoading(false);
          currentRequestRef.current = null;
        }
      }
    }, 800),
    [calculateVolatility]
  );

  // Load initial data ONLY ONCE
  useEffect(() => {
    if (!initialLoadDone.current) {
      console.log("🚀 Initial data load");
      initialLoadDone.current = true;
      debouncedLoadData(filters);
    }
  }, [debouncedLoadData, filters]);

  const handleFiltersChange = (newFilters) => {
    console.log("🔄 Filters changed:", newFilters);
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    console.log("✅ Applying filters:", filters);
    debouncedLoadData(filters);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Historical Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
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
      />

      <StatisticsCards
        statistics={processedData.statistics}
        weatherStats={data.weatherStats}
        eventStats={data.eventStats}
        loading={loading}
      />

      <ChartContainer
        priceData={processedData.priceData}
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

// Debounce utility
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
