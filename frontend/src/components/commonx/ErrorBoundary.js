// frontend/src/components/common/ErrorBoundary.js - Enhanced Error Boundary
import React from "react";
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material";
import {
  reportError,
  getErrorSeverity,
  ErrorSeverity,
} from "../../utils/errorHandler";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isOnline: navigator.onLine,
      retryCount: 0,
    };

    this.maxRetries = props.maxRetries || 3;
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Report error with context
    reportError(error, `Error Boundary - ${this.props.context || "Unknown"}`, {
      componentStack: errorInfo.componentStack,
      errorBoundaryName: this.props.name || "ErrorBoundary",
      retryCount: this.state.retryCount,
    });
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount >= this.maxRetries) {
      // Max retries reached, suggest different action
      this.handleGoHome();
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount,
    });

    // Call parent retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  getErrorSeverityColor = () => {
    const severity = getErrorSeverity(this.state.error);
    switch (severity) {
      case ErrorSeverity.LOW:
        return "info";
      case ErrorSeverity.MEDIUM:
        return "warning";
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return "error";
      default:
        return "error";
    }
  };

  renderOfflineMessage = () => {
    if (!this.state.isOnline) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WifiOffIcon />
            <Typography>
              Anda sedang offline. Periksa koneksi internet dan coba lagi.
            </Typography>
          </Box>
        </Alert>
      );
    }
    return null;
  };

  renderErrorDetails = () => {
    if (!this.state.showDetails) return null;

    return (
      <Card sx={{ mt: 2, bgcolor: "grey.50" }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Detail Error (untuk developer):
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{
              fontSize: "0.75rem",
              overflow: "auto",
              maxHeight: 200,
              bgcolor: "grey.100",
              p: 1,
              borderRadius: 1,
            }}
          >
            {this.state.error?.stack ||
              this.state.error?.message ||
              "No error details available"}
          </Typography>
          {this.state.errorInfo?.componentStack && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                Component Stack:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontSize: "0.75rem",
                  overflow: "auto",
                  maxHeight: 150,
                  bgcolor: "grey.100",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {this.state.errorInfo.componentStack}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  renderFallbackUI = () => {
    const severity = this.getErrorSeverityColor();
    const remainingRetries = this.maxRetries - this.state.retryCount;
    const canRetry = remainingRetries > 0;

    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          minHeight: this.props.minHeight || "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {this.renderOfflineMessage()}

        <Alert severity={severity} sx={{ mb: 3, textAlign: "left" }}>
          <AlertTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BugReportIcon />
            {this.props.title || "Terjadi Kesalahan"}
          </AlertTitle>

          <Typography variant="body2" sx={{ mb: 2 }}>
            {this.props.fallbackMessage ||
              "Mohon maaf, terjadi kesalahan pada komponen ini. Silakan coba beberapa tindakan berikut:"}
          </Typography>

          {this.state.retryCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Percobaan ke-{this.state.retryCount} dari {this.maxRetries}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {canRetry && (
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                disabled={!this.state.isOnline}
              >
                Coba Lagi{" "}
                {remainingRetries > 1 && `(${remainingRetries} tersisa)`}
              </Button>
            )}

            <Button
              variant="outlined"
              size="small"
              startIcon={<HomeIcon />}
              onClick={this.handleGoHome}
            >
              Kembali ke Beranda
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
            >
              Muat Ulang Halaman
            </Button>
          </Stack>

          {/* Connection status indicator */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            {this.state.isOnline ? (
              <>
                <WifiIcon color="success" />
                <Typography variant="caption" color="success.main">
                  Terhubung ke internet
                </Typography>
              </>
            ) : (
              <>
                <WifiOffIcon color="error" />
                <Typography variant="caption" color="error.main">
                  Tidak ada koneksi internet
                </Typography>
              </>
            )}
          </Box>
        </Alert>

        {/* Error details toggle */}
        {process.env.NODE_ENV === "development" && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Button
                size="small"
                onClick={this.toggleDetails}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: this.state.showDetails
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                }
              >
                {this.state.showDetails ? "Sembunyikan" : "Tampilkan"} Detail
                Error
              </Button>
            </Box>
            {this.renderErrorDetails()}
          </>
        )}

        {/* Additional actions from props */}
        {this.props.additionalActions && (
          <Box sx={{ mt: 2 }}>{this.props.additionalActions}</Box>
        )}
      </Box>
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI from props
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

// ==================== WRAPPER COMPONENTS ====================

// Higher-order component for wrapping any component with error boundary
export const withErrorBoundary = (
  WrappedComponent,
  errorBoundaryProps = {}
) => {
  const ComponentWithErrorBoundary = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return ComponentWithErrorBoundary;
};

// Specific error boundaries for different app sections
export const DashboardErrorBoundary = ({ children }) => (
  <ErrorBoundary
    name="DashboardErrorBoundary"
    context="Dashboard"
    title="Error pada Dashboard"
    fallbackMessage="Terjadi kesalahan saat memuat dashboard. Data mungkin sedang tidak tersedia."
    maxRetries={3}
  >
    {children}
  </ErrorBoundary>
);

export const PredictionErrorBoundary = ({ children }) => (
  <ErrorBoundary
    name="PredictionErrorBoundary"
    context="Prediction"
    title="Error pada Prediksi"
    fallbackMessage="Gagal memuat sistem prediksi. Periksa koneksi dan coba lagi."
    maxRetries={2}
  >
    {children}
  </ErrorBoundary>
);

export const ChatErrorBoundary = ({ children }) => (
  <ErrorBoundary
    name="ChatErrorBoundary"
    context="Chat"
    title="Error pada Chat AI"
    fallbackMessage="Layanan chat AI sedang tidak tersedia. Silakan coba lagi nanti."
    maxRetries={1}
  >
    {children}
  </ErrorBoundary>
);

// ==================== HOOKS ====================

export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

export default ErrorBoundary;
