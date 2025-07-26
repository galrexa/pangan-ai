// frontend/src/components/common/LoadingComponents.js - Consistent Loading States
import React from "react";
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

// ==================== BASIC LOADING COMPONENTS ====================

export const LoadingSpinner = ({
  size = 40,
  message = "Memuat...",
  showMessage = true,
  color = "primary",
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: 3,
      minHeight: 100,
    }}
  >
    <CircularProgress size={size} color={color} />
    {showMessage && (
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        {message}
      </Typography>
    )}
  </Box>
);

export const LoadingBar = ({
  message = "Memuat data...",
  progress = null,
  showProgress = false,
}) => (
  <Box sx={{ width: "100%", p: 2 }}>
    {message && (
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        {message}
      </Typography>
    )}
    {showProgress && progress !== null ? (
      <LinearProgress variant="determinate" value={progress} />
    ) : (
      <LinearProgress />
    )}
    {showProgress && progress !== null && (
      <Typography variant="caption" sx={{ mt: 0.5, color: "text.secondary" }}>
        {Math.round(progress)}%
      </Typography>
    )}
  </Box>
);

// ==================== SKELETON LOADERS ====================

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box sx={{ p: 2 }}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} sx={{ display: "flex", gap: 2, mb: 1 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={`${100 / columns}%`}
            height={40}
          />
        ))}
      </Box>
    ))}
  </Box>
);

export const ChartSkeleton = ({ height = 300 }) => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={height} />
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
      <Skeleton variant="text" width={80} height={20} />
      <Skeleton variant="text" width={80} height={20} />
      <Skeleton variant="text" width={80} height={20} />
    </Box>
  </Box>
);

export const CardSkeleton = ({ showAvatar = false }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {showAvatar && (
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        )}
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Box>
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="90%" height={20} />
    </CardContent>
  </Card>
);

// ==================== SPECIALIZED LOADING STATES ====================

export const DashboardLoading = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />

    <Grid container spacing={3}>
      {/* Stats Cards */}
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ mr: 1 }}
                />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="40%" height={16} />
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Chart Area */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <ChartSkeleton height={400} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export const PredictionLoading = ({
  message = "Menganalisis data dan membuat prediksi...",
  showSteps = true,
  currentStep = 1,
}) => {
  const steps = [
    "Memuat data historis",
    "Menjalankan model prediksi",
    "Menganalisis hasil",
    "Menyiapkan visualisasi",
  ];

  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <TrendingUpIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />

      <Typography variant="h6" gutterBottom>
        Membuat Prediksi Harga
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>

      <CircularProgress size={60} sx={{ mb: 3 }} />

      {showSteps && (
        <Box sx={{ mt: 3, maxWidth: 400, mx: "auto" }}>
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                opacity: index < currentStep ? 1 : 0.5,
              }}
            >
              <CircularProgress
                size={16}
                sx={{ mr: 2 }}
                color={index < currentStep ? "success" : "primary"}
              />
              <Typography
                variant="body2"
                color={index < currentStep ? "success.main" : "text.secondary"}
              >
                {step}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Proses ini biasanya memakan waktu 10-30 detik
      </Typography>
    </Box>
  );
};

export const ChatLoading = ({
  message = "AI sedang mengetik...",
  showTypingIndicator = true,
}) => (
  <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
    <ChatIcon color="primary" />
    <Box>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      {showTypingIndicator && (
        <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
                animation: "pulse 1.4s ease-in-out infinite",
                animationDelay: `${index * 0.2}s`,
                "@keyframes pulse": {
                  "0%, 80%, 100%": { opacity: 0.3 },
                  "40%": { opacity: 1 },
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  </Box>
);

export const DataLoading = ({
  type = "data",
  message = null,
  showProgress = false,
  progress = 0,
  canCancel = false,
  onCancel = null,
}) => {
  const getIcon = () => {
    switch (type) {
      case "prediction":
        return <TrendingUpIcon />;
      case "chart":
        return <AssessmentIcon />;
      case "chat":
        return <ChatIcon />;
      default:
        return <AssessmentIcon />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "prediction":
        return "Membuat prediksi harga...";
      case "chart":
        return "Memuat grafik...";
      case "chat":
        return "Memproses chat...";
      default:
        return "Memuat data...";
    }
  };

  return (
    <Card sx={{ minHeight: 200 }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 4,
        }}
      >
        <Box sx={{ color: "primary.main", mb: 2 }}>{getIcon()}</Box>

        <Typography variant="h6" gutterBottom>
          {message || getDefaultMessage()}
        </Typography>

        {showProgress ? (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}% selesai
            </Typography>
          </Box>
        ) : (
          <CircularProgress sx={{ mt: 2 }} />
        )}

        {canCancel && onCancel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            sx={{ mt: 3 }}
          >
            Batalkan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// ==================== LOADING WITH TIMEOUT ====================

export const LoadingWithTimeout = ({
  children,
  loading = false,
  timeout = 30000, // 30 seconds
  onTimeout = null,
  timeoutMessage = "Proses memakan waktu lebih lama dari biasanya. Silakan coba lagi.",
  fallbackComponent = null,
}) => {
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  const timeoutRef = React.useRef();

  React.useEffect(() => {
    if (loading) {
      setHasTimedOut(false);
      timeoutRef.current = setTimeout(() => {
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, timeout);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setHasTimedOut(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, timeout, onTimeout]);

  if (hasTimedOut) {
    if (fallbackComponent) {
      return fallbackComponent;
    }

    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Timeout
        </Typography>
        <Typography variant="body2">{timeoutMessage}</Typography>
      </Alert>
    );
  }

  return children;
};

// ==================== LOADING OVERLAY ====================

export const LoadingOverlay = ({
  loading = false,
  message = "Memuat...",
  backdrop = true,
  children,
}) => (
  <Box sx={{ position: "relative" }}>
    {children}
    {loading && (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: backdrop ? "rgba(255, 255, 255, 0.8)" : "transparent",
          backdropFilter: backdrop ? "blur(2px)" : "none",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 3,
            bgcolor: backdrop ? "background.paper" : "transparent",
            borderRadius: backdrop ? 2 : 0,
            boxShadow: backdrop ? 2 : 0,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
      </Box>
    )}
  </Box>
);

// ==================== PROGRESSIVE LOADING ====================

export const ProgressiveLoader = ({
  steps = [],
  currentStep = 0,
  loading = false,
}) => {
  if (!loading || steps.length === 0) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {steps[currentStep]?.title || "Memuat..."}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={(currentStep / (steps.length - 1)) * 100}
        sx={{ mb: 2 }}
      />

      <Typography variant="body2" color="text.secondary">
        {steps[currentStep]?.description || "Memproses data..."}
      </Typography>

      <Box sx={{ mt: 2 }}>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              opacity: index <= currentStep ? 1 : 0.3,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor:
                  index < currentStep
                    ? "success.main"
                    : index === currentStep
                    ? "primary.main"
                    : "grey.300",
                mr: 2,
              }}
            />
            <Typography
              variant="caption"
              color={index <= currentStep ? "text.primary" : "text.secondary"}
            >
              {step.title}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ==================== HOOKS ====================

export const useLoadingState = (initialLoading = false) => {
  const [loading, setLoading] = React.useState(initialLoading);
  const [error, setError] = React.useState(null);

  const startLoading = React.useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = React.useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingError = React.useCallback((error) => {
    setLoading(false);
    setError(error);
  }, []);

  const resetState = React.useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    resetState,
  };
};

export const useProgressiveLoading = (steps = []) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const startProgress = React.useCallback(() => {
    setLoading(true);
    setCurrentStep(0);
  }, []);

  const nextStep = React.useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const completeProgress = React.useCallback(() => {
    setCurrentStep(steps.length - 1);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(0);
    }, 500);
  }, [steps.length]);

  const resetProgress = React.useCallback(() => {
    setLoading(false);
    setCurrentStep(0);
  }, []);

  return {
    currentStep,
    loading,
    progress: steps.length > 0 ? (currentStep / (steps.length - 1)) * 100 : 0,
    startProgress,
    nextStep,
    completeProgress,
    resetProgress,
  };
};

// ==================== LOADING CONTEXT ====================

const LoadingContext = React.createContext();

export const LoadingProvider = ({ children }) => {
  const [globalLoading, setGlobalLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("Memuat...");

  const showGlobalLoading = React.useCallback((message = "Memuat...") => {
    setLoadingMessage(message);
    setGlobalLoading(true);
  }, []);

  const hideGlobalLoading = React.useCallback(() => {
    setGlobalLoading(false);
  }, []);

  const value = {
    globalLoading,
    loadingMessage,
    showGlobalLoading,
    hideGlobalLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {globalLoading && (
        <LoadingOverlay loading={true} message={loadingMessage}>
          <Box sx={{ minHeight: "100vh" }} />
        </LoadingOverlay>
      )}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error("useGlobalLoading must be used within LoadingProvider");
  }
  return context;
};

// ==================== EXPORTS ====================

export default {
  LoadingSpinner,
  LoadingBar,
  TableSkeleton,
  ChartSkeleton,
  CardSkeleton,
  DashboardLoading,
  PredictionLoading,
  ChatLoading,
  DataLoading,
  LoadingWithTimeout,
  LoadingOverlay,
  ProgressiveLoader,
  LoadingProvider,
  useLoadingState,
  useProgressiveLoading,
  useGlobalLoading,
};
