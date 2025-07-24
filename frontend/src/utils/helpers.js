import dayjs from "dayjs";
import { DATE_FORMAT, DISPLAY_DATE_FORMAT } from "./constants";

export const formatDate = (date, format = DISPLAY_DATE_FORMAT) => {
  return dayjs(date).format(format);
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value, decimals = 0) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getLastNDays = (n = 30) => {
  const endDate = dayjs();
  const startDate = endDate.subtract(n, "day");
  return {
    startDate: startDate.format(DATE_FORMAT),
    endDate: endDate.format(DATE_FORMAT),
  };
};

// Format weather data
export const formatWeatherData = (data) => {
  return {
    temperature: formatNumber(data.tavg_final, 1) + "°C",
    humidity: formatNumber(data.rh_avg_final, 1) + "%",
    rainfall: formatNumber(data.rr, 1) + " mm",
    windSpeed: formatNumber(data.ff_avg_final, 1) + " m/s",
  };
};

// Check if date has special events
export const getActiveEvents = (data) => {
  const events = [];
  if (data.dum_ramadan) events.push("Ramadan");
  if (data.dum_idulfitri) events.push("Idul Fitri");
  if (data.dum_natal_newyr) events.push("Natal & Tahun Baru");
  return events;
};

// Calculate price statistics
export const calculatePriceStats = (priceData) => {
  if (!priceData || priceData.length === 0) return null;

  const prices = priceData.map((item) =>
    parseFloat(item.harga_imputed || item.harga)
  );
  const sortedPrices = [...prices].sort((a, b) => a - b);

  return {
    count: prices.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    median: sortedPrices[Math.floor(sortedPrices.length / 2)],
    current: prices[prices.length - 1],
    previous: prices[prices.length - 2] || prices[prices.length - 1],
  };
};

// Get price trend indicator
export const getPriceTrend = (current, previous) => {
  const change = calculatePercentageChange(current, previous);
  if (Math.abs(change) < 1) return { trend: "stable", color: "#388e3c" };
  if (change > 0) return { trend: "increase", color: "#d32f2f" };
  return { trend: "decrease", color: "#1976d2" };
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Parse CSV-like data structure
export const parseDataRow = (row) => {
  return {
    date: row.tanggal,
    region: row.wilayah,
    weather: {
      temperature: row.tavg_final,
      humidity: row.rh_avg_final,
      rainfall: row.rr,
      windSpeed: row.ff_avg_final,
    },
    events: {
      ramadan: Boolean(row.dum_ramadan),
      idulFitri: Boolean(row.dum_idulfitri),
      christmasNewYear: Boolean(row.dum_natal_newyr),
    },
    price: {
      commodity: row.komoditas,
      level: row.level_harga,
      value: parseFloat(row.harga_imputed || row.harga),
      isImputed: Boolean(row.harga_imputed),
    },
    location: {
      kabupaten: row.kabupaten,
      code: row.kode_wilayah,
    },
  };
};
