import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Alert,
  Slider,
  FormHelperText,
  Chip,
} from "@mui/material";
import { Psychology, TrendingUp, BusinessCenter } from "@mui/icons-material";
import { COMMODITIES, REGIONS } from "../../utils/constants";

const PredictionForm = ({
  onSubmit,
  loading = false,
  initialValues = {},
  availableRegions = [],
  availableCommodities = [],
}) => {
  const [formData, setFormData] = useState({
    komoditas: "Cabai Rawit Merah",
    wilayah: "Kota Bandung",
    level_harga: "Konsumen", // Fixed to Konsumen
    prediction_days: 7,
    include_weather_forecast: true, // Fixed to true
    confidence_level: 95, // Fixed confidence level
    ...initialValues,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.komoditas) {
      errors.komoditas = "Pilih komoditas";
    }

    if (!formData.wilayah) {
      errors.wilayah = "Pilih wilayah";
    }

    if (formData.prediction_days < 1 || formData.prediction_days > 14) {
      errors.prediction_days = "Periode prediksi harus antara 1-14 hari";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getPredictionPeriod = (days) => {
    if (days <= 3) return { label: "Jangka Pendek", color: "success" };
    if (days <= 7) return { label: "Mingguan", color: "primary" };
    return { label: "Jangka Menengah", color: "warning" };
  };

  const period = getPredictionPeriod(formData.prediction_days);

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <BusinessCenter sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Prediksi Harga Strategis
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Analisis prediksi harga komoditas strategis berbasis AI untuk
            pengambilan keputusan eksekutif
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Executive Dashboard:</strong> Prediksi otomatis
              menggunakan model LSTM dengan data cuaca, analisis pola musiman,
              dan faktor event khusus (Ramadan, Idul Fitri, Natal).
            </Typography>
          </Alert>
        </Box>

        <Grid container spacing={4}>
          {/* Commodity Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.komoditas} size="large">
              <InputLabel sx={{ fontSize: "1.1rem" }}>
                Komoditas Strategis *
              </InputLabel>
              <Select
                value={formData.komoditas}
                onChange={(e) => handleChange("komoditas", e.target.value)}
                label="Komoditas Strategis *"
                sx={{ fontSize: "1.1rem" }}
              >
                {(availableCommodities.length > 0
                  ? availableCommodities
                  : COMMODITIES
                ).map((commodity) => (
                  <MenuItem key={commodity.value} value={commodity.value}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography variant="body1">{commodity.label}</Typography>
                      {commodity.volatility && (
                        <Chip
                          label={`Volatilitas ${commodity.volatility}%`}
                          size="small"
                          color={
                            commodity.volatility > 15 ? "error" : "warning"
                          }
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.komoditas && (
                <FormHelperText sx={{ fontSize: "0.9rem" }}>
                  {formErrors.komoditas}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Region Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.wilayah} size="large">
              <InputLabel sx={{ fontSize: "1.1rem" }}>
                Wilayah Prioritas *
              </InputLabel>
              <Select
                value={formData.wilayah}
                onChange={(e) => handleChange("wilayah", e.target.value)}
                label="Wilayah Prioritas *"
                sx={{ fontSize: "1.1rem" }}
              >
                {(availableRegions.length > 0
                  ? availableRegions
                  : REGIONS.filter((r) => r.value !== "all")
                ).map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    <Typography variant="body1">{region.label}</Typography>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.wilayah && (
                <FormHelperText sx={{ fontSize: "0.9rem" }}>
                  {formErrors.wilayah}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Prediction Period */}
          <Grid item xs={12}>
            <Box sx={{ px: 2 }}>
              <Typography
                gutterBottom
                sx={{ fontWeight: 600, fontSize: "1.1rem", mb: 2 }}
              >
                Periode Analisis: {formData.prediction_days} hari
              </Typography>

              <Slider
                value={formData.prediction_days}
                onChange={(e, value) => handleChange("prediction_days", value)}
                min={1}
                max={14}
                step={1}
                marks={[
                  { value: 1, label: "1 hari" },
                  { value: 3, label: "3 hari" },
                  { value: 7, label: "1 minggu" },
                  { value: 14, label: "2 minggu" },
                ]}
                valueLabelDisplay="auto"
                color="primary"
                sx={{
                  height: 8,
                  "& .MuiSlider-thumb": {
                    height: 20,
                    width: 20,
                  },
                  "& .MuiSlider-track": {
                    height: 8,
                  },
                  "& .MuiSlider-rail": {
                    height: 8,
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Jenis Analisis:
                </Typography>
                <Chip
                  label={period.label}
                  color={period.color}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {formErrors.prediction_days && (
                <FormHelperText error sx={{ fontSize: "0.9rem", mt: 1 }}>
                  {formErrors.prediction_days}
                </FormHelperText>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              setFormData({
                komoditas: "Cabai Rawit Merah",
                wilayah: "Kota Bandung",
                level_harga: "Konsumen",
                prediction_days: 7,
                include_weather_forecast: true,
                confidence_level: 95,
              })
            }
            disabled={loading}
            size="large"
            sx={{ px: 4 }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || Object.keys(formErrors).length > 0}
            startIcon={
              loading ? (
                <TrendingUp
                  sx={{
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              ) : (
                <Psychology />
              )
            }
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            {loading ? "Memproses Analisis..." : "Generate Prediksi Strategis"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PredictionForm;
