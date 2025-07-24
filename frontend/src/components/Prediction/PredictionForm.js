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
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Psychology,
  CloudQueue,
  Event,
  TrendingUp,
  Settings,
} from "@mui/icons-material";
import { COMMODITIES, REGIONS, PRICE_LEVELS } from "../../utils/constants";

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
    level_harga: "Konsumen",
    prediction_days: 7,
    include_weather_forecast: true,
    confidence_level: 95,
    ...initialValues,
  });

  const [formErrors, setFormErrors] = useState({});
  const [advanced, setAdvanced] = useState(false);

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

    if (formData.prediction_days < 1 || formData.prediction_days > 30) {
      errors.prediction_days = "Hari prediksi harus antara 1-30";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getPredictionComplexity = (days) => {
    if (days <= 3) return { level: "Rendah", color: "success" };
    if (days <= 7) return { level: "Sedang", color: "warning" };
    return { level: "Tinggi", color: "error" };
  };

  const complexity = getPredictionComplexity(formData.prediction_days);

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Psychology sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Form Prediksi Harga
            </Typography>
            <Box sx={{ ml: "auto" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advanced}
                    onChange={(e) => setAdvanced(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Settings sx={{ mr: 0.5, fontSize: 18 }} />
                    Advanced
                  </Box>
                }
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Isi form di bawah untuk menghasilkan prediksi harga berbasis model
            LSTM
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Commodity Selection */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!formErrors.komoditas}>
              <InputLabel>Komoditas *</InputLabel>
              <Select
                value={formData.komoditas}
                onChange={(e) => handleChange("komoditas", e.target.value)}
                label="Komoditas *"
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
                      {commodity.label}
                      {commodity.volatility && (
                        <Chip
                          label={`${commodity.volatility}% volatilitas`}
                          size="small"
                          color={
                            commodity.volatility > 15 ? "error" : "warning"
                          }
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.komoditas && (
                <FormHelperText>{formErrors.komoditas}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Region Selection */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!formErrors.wilayah}>
              <InputLabel>Wilayah *</InputLabel>
              <Select
                value={formData.wilayah}
                onChange={(e) => handleChange("wilayah", e.target.value)}
                label="Wilayah *"
              >
                {(availableRegions.length > 0
                  ? availableRegions
                  : REGIONS.filter((r) => r.value !== "all")
                ).map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.wilayah && (
                <FormHelperText>{formErrors.wilayah}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Price Level */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Level Harga</InputLabel>
              <Select
                value={formData.level_harga}
                onChange={(e) => handleChange("level_harga", e.target.value)}
                label="Level Harga"
              >
                {PRICE_LEVELS.filter((level) => level.value !== "all").map(
                  (level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Prediction Days Slider */}
          <Grid item xs={12} md={6}>
            <Typography gutterBottom sx={{ fontWeight: 500 }}>
              Periode Prediksi: {formData.prediction_days} hari
            </Typography>
            <Slider
              value={formData.prediction_days}
              onChange={(e, value) => handleChange("prediction_days", value)}
              min={1}
              max={30}
              step={1}
              marks={[
                { value: 1, label: "1 hari" },
                { value: 7, label: "1 minggu" },
                { value: 14, label: "2 minggu" },
                { value: 30, label: "1 bulan" },
              ]}
              valueLabelDisplay="auto"
              color="primary"
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Kompleksitas:
              </Typography>
              <Chip
                label={complexity.level}
                size="small"
                color={complexity.color}
              />
            </Box>
            {formErrors.prediction_days && (
              <FormHelperText error>
                {formErrors.prediction_days}
              </FormHelperText>
            )}
          </Grid>

          {/* Options */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.include_weather_forecast}
                    onChange={(e) =>
                      handleChange("include_weather_forecast", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CloudQueue sx={{ mr: 0.5, fontSize: 20 }} />
                    Sertakan Prediksi Cuaca
                  </Box>
                }
              />

              {advanced && (
                <Box>
                  <Typography gutterBottom sx={{ fontWeight: 500 }}>
                    Confidence Level: {formData.confidence_level}%
                  </Typography>
                  <Slider
                    value={formData.confidence_level}
                    onChange={(e, value) =>
                      handleChange("confidence_level", value)
                    }
                    min={80}
                    max={99}
                    step={1}
                    valueLabelDisplay="auto"
                    color="secondary"
                  />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Additional Info */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Catatan:</strong> Prediksi menggunakan model LSTM yang
                telah dilatih dengan data historis
                {formData.include_weather_forecast && ", data cuaca, "}
                dan variabel event khusus (Ramadan, Idul Fitri, Natal). Akurasi
                prediksi menurun seiring bertambahnya periode waktu.
              </Typography>
            </Alert>
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
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
          >
            Reset
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || Object.keys(formErrors).length > 0}
            startIcon={
              loading ? <TrendingUp className="spinning" /> : <Psychology />
            }
            sx={{
              "& .spinning": {
                animation: "spin 1s linear infinite",
              },
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            {loading ? "Memproses Prediksi..." : "Generate Prediksi"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PredictionForm;
