import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Storage,
  Psychology,
  Timeline,
  Settings,
} from "@mui/icons-material";
import apiService from "../../services/api";

const BackendStatusChecker = ({ onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    checkBackendStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    setLoading(true);

    try {
      console.log("🔍 Checking backend status...");

      // Test various backend endpoints
      const [
        connectionTest,
        healthCheck,
        modelStatus,
        commoditiesTest,
        regionsTest,
      ] = await Promise.allSettled([
        apiService.testConnection(),
        apiService.healthCheck(),
        apiService.getModelStatus(),
        apiService.getAvailableCommodities(),
        apiService.getAvailableRegions(),
      ]);

      const newStatus = {
        overall: "healthy",
        components: {
          api_connection: {
            status: connectionTest.status === "fulfilled" ? "healthy" : "error",
            details:
              connectionTest.status === "fulfilled"
                ? connectionTest.value
                : connectionTest.reason?.message,
          },
          health_endpoint: {
            status: healthCheck.status === "fulfilled" ? "healthy" : "error",
            details:
              healthCheck.status === "fulfilled"
                ? healthCheck.value
                : healthCheck.reason?.message,
          },
          lstm_model: {
            status:
              modelStatus.status === "fulfilled" &&
              modelStatus.value?.model_info?.exists
                ? "healthy"
                : "warning",
            details:
              modelStatus.status === "fulfilled"
                ? modelStatus.value
                : modelStatus.reason?.message,
          },
          data_commodities: {
            status:
              commoditiesTest.status === "fulfilled" ? "healthy" : "warning",
            details:
              commoditiesTest.status === "fulfilled"
                ? `${
                    commoditiesTest.value?.commodities?.length || 0
                  } commodities available`
                : "Using fallback data",
          },
          data_regions: {
            status: regionsTest.status === "fulfilled" ? "healthy" : "warning",
            details:
              regionsTest.status === "fulfilled"
                ? `${regionsTest.value?.regions?.length || 0} regions available`
                : "Using fallback data",
          },
        },
        timestamp: new Date().toISOString(),
      };

      // Determine overall status
      const hasErrors = Object.values(newStatus.components).some(
        (comp) => comp.status === "error"
      );
      const hasWarnings = Object.values(newStatus.components).some(
        (comp) => comp.status === "warning"
      );

      if (hasErrors) {
        newStatus.overall = "error";
      } else if (hasWarnings) {
        newStatus.overall = "warning";
      }

      setStatus(newStatus);
      setLastChecked(new Date());

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      console.log("✅ Backend status check completed:", newStatus);
    } catch (error) {
      console.error("❌ Backend status check failed:", error);

      const errorStatus = {
        overall: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      setStatus(errorStatus);
      setLastChecked(new Date());

      if (onStatusChange) {
        onStatusChange(errorStatus);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return <CheckCircle color="success" />;
      case "warning":
        return <Warning color="warning" />;
      case "error":
        return <Error color="error" />;
      default:
        return <Settings />;
    }
  };

  const getComponentIcon = (component) => {
    switch (component) {
      case "api_connection":
        return <Timeline />;
      case "health_endpoint":
        return <CheckCircle />;
      case "lstm_model":
        return <Psychology />;
      case "data_commodities":
      case "data_regions":
        return <Storage />;
      default:
        return <Settings />;
    }
  };

  if (loading && !status) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 3,
            }}
          >
            <CircularProgress sx={{ mr: 2 }} />
            <Typography variant="h6">Checking Backend Status...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
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
            {getStatusIcon(status?.overall)}
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
              Backend System Status
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={status?.overall?.toUpperCase() || "UNKNOWN"}
              color={getStatusColor(status?.overall)}
              variant="outlined"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              onClick={checkBackendStatus}
              disabled={loading}
            >
              {loading ? "Checking..." : "Refresh"}
            </Button>
          </Box>
        </Box>

        {status?.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>System Error:</strong> {status.error}
            </Typography>
          </Alert>
        )}

        {status?.overall === "error" && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Backend Unavailable:</strong> The system is running in
              fallback mode. Some features may be limited.
            </Typography>
          </Alert>
        )}

        {status?.overall === "warning" && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Partial Service:</strong> Some backend services are
              unavailable. The system will use fallback data where needed.
            </Typography>
          </Alert>
        )}

        {status?.components && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Service Components
            </Typography>

            <List>
              {ns.components).map(
                ([key, component], index) => (
                  <React.Fragment key={key}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>{getComponentIcon(key)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Typography>
                            <Chip
                              label={component.status.toUpperCase()}
                              size="small"
                              color={getStatusColor(component.status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {typeof component.details === "string"
                              ? component.details
                              : JSON.stringify(component.details, null, 2)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < Object.keys(status.components).length - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                )
              )}
            </List>
          </>
        )}

        {lastChecked && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Last checked: {lastChecked.toLocaleString("id-ID")}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendStatusChecker;
