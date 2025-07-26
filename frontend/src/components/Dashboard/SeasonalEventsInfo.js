// File: frontend/src/components/Dashboard/SeasonalEventsInfo.js
// Seasonal Events Information Component - Complete Version

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Event,
  ExpandMore,
  Visibility,
  VisibilityOff,
  TrendingUp,
  TrendingFlat,
} from "@mui/icons-material";

const SeasonalEventsInfo = ({
  priceData = [],
  filters = {},
  title = "Informasi Event Seasonal",
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Analyze events from price data
  const eventAnalysis = useMemo(() => {
    if (!priceData.length) return null;

    const eventsData = {
      ramadan: { periods: [], totalDays: 0, avgImpact: 0 },
      idulFitri: { periods: [], totalDays: 0, avgImpact: 0 },
      christmasNewYear: { periods: [], totalDays: 0, avgImpact: 0 },
    };

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Ags",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    // Process each data point
    priceData.forEach((item, index) => {
      const date = new Date(item.date);
      const month = monthNames[date.getMonth()];
      const day = date.getDate();

      // Detect Ramadan period (approximate - Mar to May)
      if (date.getMonth() >= 2 && date.getMonth() <= 4) {
        eventsData.ramadan.periods.push({
          date: `${day} ${month}`,
          price: item.price,
          impact:
            index > 0
              ? ((item.price - priceData[index - 1].price) /
                  priceData[index - 1].price) *
                100
              : 0,
        });
      }

      // Detect Idul Fitri (usually end of Ramadan - Apr to Jun)
      if (date.getMonth() >= 3 && date.getMonth() <= 5) {
        eventsData.idulFitri.periods.push({
          date: `${day} ${month}`,
          price: item.price,
          impact:
            index > 0
              ? ((item.price - priceData[index - 1].price) /
                  priceData[index - 1].price) *
                100
              : 0,
        });
      }

      // Detect Christmas & New Year (Nov to Jan)
      if (date.getMonth() >= 10 || date.getMonth() <= 0) {
        eventsData.christmasNewYear.periods.push({
          date: `${day} ${month}`,
          price: item.price,
          impact:
            index > 0
              ? ((item.price - priceData[index - 1].price) /
                  priceData[index - 1].price) *
                100
              : 0,
        });
      }
    });

    // Calculate statistics for each event
    Object.keys(eventsData).forEach((eventKey) => {
      const event = eventsData[eventKey];
      event.totalDays = event.periods.length;
      if (event.periods.length > 0) {
        event.avgImpact =
          event.periods.reduce((sum, p) => sum + p.impact, 0) /
          event.periods.length;
        event.maxPrice = Math.max(...event.periods.map((p) => p.price));
        event.minPrice = Math.min(...event.periods.map((p) => p.price));
        event.avgPrice =
          event.periods.reduce((sum, p) => sum + p.price, 0) /
          event.periods.length;

        // Calculate volatility during event
        const prices = event.periods.map((p) => p.price);
        const mean = event.avgPrice;
        const variance =
          prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
          prices.length;
        event.volatility = (Math.sqrt(variance) / mean) * 100;
      }
    });

    console.log("🎭 Event Analysis Result:", eventsData);
    return eventsData;
  }, [priceData]);

  const eventInfo = [
    {
      key: "ramadan",
      name: "Ramadan",
      icon: "🌙",
      period: "Maret - Mei",
      description:
        "Bulan puasa umat Islam. Biasanya meningkatkan demand untuk komoditas pangan tertentu seperti kurma, beras, dan bumbu dapur.",
      color: "warning",
      expectedImpact: "Peningkatan 10-25% untuk komoditas utama",
    },
    {
      key: "idulFitri",
      name: "Idul Fitri",
      icon: "🎉",
      period: "April - Juni",
      description:
        "Hari raya Idul Fitri. Peningkatan signifikan dalam konsumsi daging, beras, gula, dan komoditas untuk masakan lebaran.",
      color: "success",
      expectedImpact: "Peningkatan 15-30% untuk komoditas strategis",
    },
    {
      key: "christmasNewYear",
      name: "Natal & Tahun Baru",
      icon: "🎄",
      period: "November - Januari",
      description:
        "Periode liburan akhir tahun. Meningkatkan konsumsi dan harga komoditas untuk celebration foods dan gathering.",
      color: "error",
      expectedImpact: "Peningkatan 8-20% tergantung komoditas",
    },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getImpactSeverity = (impact) => {
    const absImpact = Math.abs(impact);
    if (absImpact > 15)
      return { label: "Tinggi", color: "error", icon: <TrendingUp /> };
    if (absImpact > 8)
      return { label: "Sedang", color: "warning", icon: <TrendingUp /> };
    if (absImpact > 3)
      return { label: "Rendah", color: "info", icon: <TrendingFlat /> };
    return { label: "Minimal", color: "success", icon: <TrendingFlat /> };
  };

  if (!eventAnalysis) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Event sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            Tidak ada data untuk analisis event seasonal. Silakan pilih periode
            data dan wilayah.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Event sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowDetails(!showDetails)}
            size="small"
            color="primary"
          >
            {showDetails ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {eventInfo.map((event) => {
            const analysis = eventAnalysis[event.key];
            const severity = getImpactSeverity(analysis.avgImpact || 0);

            return (
              <Grid item xs={12} md={4} key={event.key}>
                <Card
                  variant="outlined"
                  sx={{ height: "100%", backgroundColor: "grey.50" }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="h4" sx={{ mr: 1 }}>
                        {event.icon}
                      </Typography>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {event.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.period}
                        </Typography>
                      </Box>
                    </Box>

                    {analysis.totalDays > 0 ? (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Impact:
                          </Typography>
                          <Chip
                            size="small"
                            label={`${analysis.avgImpact.toFixed(1)}%`}
                            color={severity.color}
                            icon={severity.icon}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Data: {analysis.totalDays} hari dalam periode
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Harga rata-rata: {formatCurrency(analysis.avgPrice)}
                        </Typography>

                        {analysis.volatility && (
                          <Typography variant="body2" color="text.secondary">
                            Volatilitas: {analysis.volatility.toFixed(1)}%
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Tidak ada data untuk periode ini
                        </Typography>
                        <Typography variant="caption" color="primary.main">
                          {event.expectedImpact}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Detailed Information */}
        <Collapse in={showDetails}>
          <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
            📊 Detail Analisis Event Seasonal
          </Typography>

          {eventInfo.map((event) => {
            const analysis = eventAnalysis[event.key];

            return (
              <Accordion key={event.key} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6">{event.icon}</Typography>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {event.name} ({event.period})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.totalDays} hari data • Impact:{" "}
                        {analysis.avgImpact?.toFixed(1) || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>

                  {analysis.totalDays > 0 ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, color: "primary.main" }}
                        >
                          📈 Statistik Harga
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          <Typography variant="body2">
                            • Rata-rata: {formatCurrency(analysis.avgPrice)}
                          </Typography>
                          <Typography variant="body2">
                            • Tertinggi: {formatCurrency(analysis.maxPrice)}
                          </Typography>
                          <Typography variant="body2">
                            • Terendah: {formatCurrency(analysis.minPrice)}
                          </Typography>
                          <Typography variant="body2">
                            • Impact rata-rata: {analysis.avgImpact.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2">
                            • Volatilitas periode:{" "}
                            {analysis.volatility?.toFixed(2) || 0}%
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, color: "primary.main" }}
                        >
                          🎯 Rekomendasi
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          {analysis.avgImpact > 15 ? (
                            <Alert severity="warning" size="small">
                              <strong>Impact Tinggi:</strong> Event ini memiliki
                              pengaruh signifikan. Persiapkan strategi inventory
                              dan pricing yang ketat.
                            </Alert>
                          ) : analysis.avgImpact > 8 ? (
                            <Alert severity="info" size="small">
                              <strong>Impact Sedang:</strong> Monitor harga
                              lebih ketat selama periode ini. Pertimbangkan
                              adjustment inventory.
                            </Alert>
                          ) : analysis.avgImpact > 0 ? (
                            <Alert severity="success" size="small">
                              <strong>Impact Rendah:</strong> Event ini tidak
                              berpengaruh signifikan. Lanjutkan operasi normal.
                            </Alert>
                          ) : (
                            <Alert severity="info" size="small">
                              <strong>Data Terbatas:</strong> Impact tidak dapat
                              diukur akurat. Gunakan data historis sebagai
                              referensi.
                            </Alert>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      Tidak ada data untuk periode event ini dalam dataset yang
                      dipilih. Berikut ekspektasi umum: {event.expectedImpact}
                    </Alert>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}

          {/* Additional Insights */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: "primary.light",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 600, color: "primary.dark" }}
            >
              📈 Insights Berdasarkan Data Aktual
            </Typography>
            {(() => {
              const totalEvents = eventInfo.filter(
                (e) => eventAnalysis[e.key].totalDays > 0
              ).length;
              const avgImpactAll =
                eventInfo.reduce(
                  (sum, e) => sum + (eventAnalysis[e.key].avgImpact || 0),
                  0
                ) / eventInfo.length;
              const highestImpactEvent = eventInfo.reduce((max, e) =>
                (eventAnalysis[e.key].avgImpact || 0) >
                (eventAnalysis[max.key].avgImpact || 0)
                  ? e
                  : max
              );

              return (
                <Box sx={{ color: "primary.dark" }}>
                  <Typography variant="body2">
                    • <strong>{totalEvents} dari 3 event</strong> memiliki data
                    dalam periode yang dipilih
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Impact rata-rata seasonal:</strong>{" "}
                    {avgImpactAll.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Event dengan impact tertinggi:</strong>{" "}
                    {highestImpactEvent.name}(
                    {eventAnalysis[highestImpactEvent.key].avgImpact?.toFixed(
                      1
                    ) || 0}
                    %)
                  </Typography>
                  {filters.wilayah && filters.wilayah !== "all" && (
                    <Typography variant="body2">
                      • <strong>Analisis khusus untuk:</strong>{" "}
                      {Array.isArray(filters.wilayah)
                        ? filters.wilayah.join(", ")
                        : filters.wilayah}
                    </Typography>
                  )}
                </Box>
              );
            })()}
          </Box>
        </Collapse>

        {/* Quick Insights - Always Visible */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "primary.main" }}>
            💡 Insights Cepat - Event Seasonal Indonesia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Ramadan:</strong> Peningkatan konsumsi beras, kurma, daging
            untuk buka puasa dan sahur
            <br />
            <strong>Idul Fitri:</strong> Lonjakan permintaan untuk masakan
            lebaran - daging, santan, bumbu
            <br />
            <strong>Natal & Tahun Baru:</strong> Meningkatkan demand celebration
            foods dan bahan kue
            <br />
            <strong>📊 Tip Analisis:</strong> Gunakan data ini untuk forecasting
            demand dan pricing strategy
          </Typography>
        </Box>

        {/* Filter Information */}
        {(filters.wilayah && filters.wilayah !== "all") ||
        (filters.komoditas && filters.komoditas !== "all") ? (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              backgroundColor: "info.light",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="info.dark">
              📌 <strong>Filter Aktif:</strong>
              {filters.wilayah && filters.wilayah !== "all" && (
                <span>
                  {" "}
                  Wilayah:{" "}
                  {Array.isArray(filters.wilayah)
                    ? filters.wilayah.join(", ")
                    : filters.wilayah}
                </span>
              )}
              {filters.komoditas && filters.komoditas !== "all" && (
                <span> • Komoditas: {filters.komoditas}</span>
              )}
              <br />
              Analisis event seasonal di atas disesuaikan dengan filter yang
              dipilih.
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default SeasonalEventsInfo;
