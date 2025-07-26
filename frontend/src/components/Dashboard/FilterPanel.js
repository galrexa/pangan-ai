// File: frontend/src/components/Dashboard/FilterPanel.js
// FIXED VERSION - Perbaikan auto-apply dan state sync

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
  Chip,
  //TextField,
  Alert,
  Collapse,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  FilterList,
  Event,
  //TrendingUp,
  Refresh,
  DateRange,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import dayjs from "dayjs";

const FilterPanel = ({
  filters,
  onFiltersChange,
  loading,
  onApplyFilters,
  activeEvents = [],
}) => {
  // DATASET MAXIMUM DATE - sesuai data terakhir di CSV
  const DATASET_MAX_DATE = "2025-05-31";
  const maxDate = dayjs(DATASET_MAX_DATE);

  const [localFilters, setLocalFilters] = useState(filters);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [dateError, setDateError] = useState("");

  const commodities = [
    { value: "all", label: "Semua Komoditas" },
    { value: "Cabai Rawit Merah", label: "Cabai Rawit Merah" },
  ];

  const regions = [
    { value: "all", label: "Semua Wilayah" },
    { value: "Kabupaten Bogor", label: "Kabupaten Bogor" },
    { value: "Kabupaten Cirebon", label: "Kabupaten Cirebon" },
    { value: "Kota Bandung", label: "Kota Bandung" },
    { value: "Kabupaten Majalengka", label: "Kabupaten Majalengka" },
  ];

  // Enhanced date ranges dengan 1 tahun
  const dateRanges = [
    { value: 7, label: "7 Hari Terakhir" },
    { value: 30, label: "30 Hari Terakhir" },
    { value: 90, label: "3 Bulan Terakhir" },
    { value: 180, label: "6 Bulan Terakhir" },
    { value: 365, label: "1 Tahun Terakhir" },
    { value: "custom", label: "Pilih Tanggal Custom" },
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (start.isAfter(end)) {
      return "Tanggal mulai tidak boleh lebih besar dari tanggal akhir";
    }

    if (end.isAfter(maxDate)) {
      return `Tanggal akhir tidak boleh lebih dari ${DATASET_MAX_DATE}`;
    }

    const daysDiff = end.diff(start, "day");
    if (daysDiff > 365) {
      return "Rentang tanggal maksimal 1 tahun (365 hari)";
    }

    return "";
  };

  // FIXED: Simplified filter change handler
  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);

    // Clear date error when filters change
    if (field === "start_date" || field === "end_date") {
      setDateError("");
    }

    // FIXED: Direct call to parent with new filters
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (value) => {
    if (value === "custom") {
      setShowCustomDate(true);
      const endDate = maxDate;
      const startDate = maxDate.subtract(30, "day");

      const newFilters = {
        ...localFilters,
        date_range: "custom",
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
      };

      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    } else {
      setShowCustomDate(false);

      const days = parseInt(value);
      const endDate = maxDate;
      const startDate = maxDate.subtract(days, "day");

      const newFilters = {
        ...localFilters,
        date_range: days,
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
      };

      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    }
    setDateError("");
  };

  const handleCustomDateChange = (field, newValue) => {
    if (!newValue) return;

    const newFilters = {
      ...localFilters,
      [field]: newValue.format("YYYY-MM-DD"),
    };

    setLocalFilters(newFilters);

    const error = validateDateRange(newFilters.start_date, newFilters.end_date);
    setDateError(error);

    if (!error) {
      onFiltersChange(newFilters);
    }
  };

  // FIXED: Multiple select handler untuk wilayah
  const handleMultipleRegionChange = (event) => {
    const value = event.target.value;
    let selectedRegions = typeof value === "string" ? value.split(",") : value;

    // FIXED: Handle "Semua Wilayah" selection logic
    if (selectedRegions.includes("all")) {
      // If "all" is clicked
      const wasAllSelected =
        Array.isArray(localFilters.wilayah) &&
        localFilters.wilayah.includes("all");

      if (wasAllSelected) {
        // If "all" was already selected, deselect it and select first specific region
        selectedRegions = [regions[1].value]; // Select first non-"all" option
      } else {
        // If "all" is newly selected, select only "all"
        selectedRegions = ["all"];
      }
    } else {
      // If specific regions are selected, ensure "all" is not included
      selectedRegions = selectedRegions.filter((region) => region !== "all");

      // If no regions selected, default to "all"
      if (selectedRegions.length === 0) {
        selectedRegions = ["all"];
      }
    }

    handleFilterChange("wilayah", selectedRegions);
  };

  const handleReset = () => {
    const defaultFilters = {
      komoditas: "all",
      wilayah: ["all"], // Array for multiple select
      date_range: 30,
      include_weather: false,
      include_events: true,
    };

    setLocalFilters(defaultFilters);
    setShowCustomDate(false);
    setDateError("");
    handleDateRangeChange(30);
  };

  // Helper untuk render selected regions
  const renderSelectedRegions = (selected) => {
    if (!Array.isArray(selected)) return "Semua Wilayah";
    if (selected.includes("all")) return "Semua Wilayah";
    if (selected.length === 0) return "Pilih Wilayah";
    if (selected.length === 1) {
      const region = regions.find((r) => r.value === selected[0]);
      return region ? region.label : selected[0];
    }
    return `${selected.length} wilayah dipilih`;
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

            {/* Dataset Info */}
            <Box sx={{ ml: 2 }}>
              <Chip
                icon={<DateRange />}
                label={`Data s/d ${DATASET_MAX_DATE}`}
                size="small"
                color="info"
                variant="outlined"
              />
            </Box>

            {/* Active Events Display */}
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

          <Grid container spacing={3} alignItems="center">
            {/* Commodity Selection */}
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
                  {commodities.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* MULTIPLE Region Selection */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Wilayah</InputLabel>
                <Select
                  multiple
                  value={
                    Array.isArray(localFilters.wilayah)
                      ? localFilters.wilayah
                      : ["all"]
                  }
                  onChange={handleMultipleRegionChange}
                  input={<OutlinedInput label="Wilayah" />}
                  renderValue={renderSelectedRegions}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {regions.map((region) => {
                    const isSelected = Array.isArray(localFilters.wilayah)
                      ? localFilters.wilayah.includes(region.value)
                      : localFilters.wilayah === region.value;

                    return (
                      <MenuItem key={region.value} value={region.value}>
                        <Checkbox checked={isSelected} />
                        <ListItemText primary={region.label} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range Selection */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Periode Data</InputLabel>
                <Select
                  value={localFilters.date_range || 30}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  label="Periode Data"
                  endAdornment={
                    showCustomDate ? <ExpandLess /> : <ExpandMore />
                  }
                >
                  {dateRanges.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Manual Apply Button (Optional) */}
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
                startIcon={<Refresh />}
                fullWidth
              >
                Reset Filter
              </Button>
            </Grid>
          </Grid>

          {/* Custom Date Range Section */}
          <Collapse in={showCustomDate}>
            <Box
              sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "primary.main" }}
              >
                📅 Pilih Tanggal Custom (Maksimal 1 Tahun)
              </Typography>

              {dateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {dateError}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Tanggal Mulai"
                    value={dayjs(localFilters.start_date)}
                    onChange={(newValue) =>
                      handleCustomDateChange("start_date", newValue)
                    }
                    maxDate={dayjs(localFilters.end_date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!dateError,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Tanggal Akhir"
                    value={dayjs(localFilters.end_date)}
                    onChange={(newValue) =>
                      handleCustomDateChange("end_date", newValue)
                    }
                    minDate={dayjs(localFilters.start_date)}
                    maxDate={maxDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!dateError,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          {/* Filter Status - Debug Info */}
          {/* {process.env.NODE_ENV === "development" && (
            <Box
              sx={{
                mt: 2,
                p: 1,
                backgroundColor: "info.light",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="info.dark">
                🔍 Debug - Current Filters: Komoditas: {localFilters.komoditas}{" "}
                | Wilayah:{" "}
                {Array.isArray(localFilters.wilayah)
                  ? localFilters.wilayah.join(", ")
                  : localFilters.wilayah}{" "}
                | Periode: {localFilters.start_date} to {localFilters.end_date}
              </Typography>
            </Box>
          )} */}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default FilterPanel;
