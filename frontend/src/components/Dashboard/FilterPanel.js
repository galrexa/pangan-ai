import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Chip,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  FilterList,
  Refresh,
  CloudQueue,
  Event,
  TrendingUp,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { COMMODITIES, REGIONS, PRICE_LEVELS } from "../../utils/constants";
import { getLastNDays } from "../../utils/helpers";

const FilterPanel = ({
  filters,
  onFiltersChange,
  loading,
  onApplyFilters,
  activeEvents = [],
  weatherEnabled = true,
  onWeatherToggle,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const { startDate, endDate } = getLastNDays(30);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleReset = () => {
    const defaultFilters = {
      komoditas: "all",
      wilayah: "all",
      level_harga: "all",
      start_date: startDate,
      end_date: endDate,
      include_weather: true,
      include_events: true,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <FilterList sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filter Data Historis
            </Typography>

            {/* Active Events Indicators */}
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              {activeEvents.map((event) => (
                <Chip
                  key={event}
                  icon={<Event />}
                  label={event}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Commodity Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Komoditas</InputLabel>
                <Select
                  value={localFilters.komoditas || "all"}
                  onChange={(e) =>
                    handleFilterChange("komoditas", e.target.value)
                  }
                  label="Komoditas"
                >
                  <MenuItem value="all">Semua Komoditas</MenuItem>
                  {COMMODITIES.map((commodity) => (
                    <MenuItem key={commodity.value} value={commodity.value}>
                      {commodity.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Region Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Wilayah</InputLabel>
                <Select
                  value={localFilters.wilayah || "all"}
                  onChange={(e) =>
                    handleFilterChange("wilayah", e.target.value)
                  }
                  label="Wilayah"
                >
                  {REGIONS.map((region) => (
                    <MenuItem key={region.value} value={region.value}>
                      {region.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Price Level Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Level Harga</InputLabel>
                <Select
                  value={localFilters.level_harga || "all"}
                  onChange={(e) =>
                    handleFilterChange("level_harga", e.target.value)
                  }
                  label="Level Harga"
                >
                  {PRICE_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Quick Date Ranges */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Range Cepat</InputLabel>
                <Select
                  value=""
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    const { startDate: start, endDate: end } =
                      getLastNDays(days);
                    handleFilterChange("start_date", start);
                    handleFilterChange("end_date", end);
                  }}
                  label="Range Cepat"
                  displayEmpty
                >
                  <MenuItem value="">Pilih Range...</MenuItem>
                  <MenuItem value={7}>7 Hari Terakhir</MenuItem>
                  <MenuItem value={30}>30 Hari Terakhir</MenuItem>
                  <MenuItem value={90}>3 Bulan Terakhir</MenuItem>
                  <MenuItem value={365}>1 Tahun Terakhir</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Tanggal Mulai"
                value={dayjs(localFilters.start_date)}
                onChange={(newValue) =>
                  handleFilterChange(
                    "start_date",
                    newValue.format("YYYY-MM-DD")
                  )
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={dayjs(localFilters.end_date)}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Tanggal Selesai"
                value={dayjs(localFilters.end_date)}
                onChange={(newValue) =>
                  handleFilterChange("end_date", newValue.format("YYYY-MM-DD"))
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={dayjs(localFilters.start_date)}
                maxDate={dayjs()}
              />
            </Grid>

            {/* Weather Data Toggle */}
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localFilters.include_weather || false}
                    onChange={(e) => {
                      handleFilterChange("include_weather", e.target.checked);
                      onWeatherToggle?.(e.target.checked);
                    }}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CloudQueue sx={{ mr: 0.5, fontSize: 20 }} />
                    Data Cuaca
                  </Box>
                }
              />
            </Grid>

            {/* Events Toggle */}
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localFilters.include_events || false}
                    onChange={(e) =>
                      handleFilterChange("include_events", e.target.checked)
                    }
                    color="secondary"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Event sx={{ mr: 0.5, fontSize: 20 }} />
                    Event Khusus
                  </Box>
                }
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}
          >
            <Button variant="outlined" onClick={handleReset} disabled={loading}>
              Reset Filter
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={loading}
              startIcon={
                loading ? <Refresh className="spinning" /> : <TrendingUp />
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
              {loading ? "Memuat Data..." : "Terapkan Filter"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default FilterPanel;
