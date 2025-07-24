// frontend/src/utils/errorHandler.js - Comprehensive Error Handling
import { toast } from "react-toastify";

// ==================== ERROR TYPES ====================

export const ErrorTypes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  API_ERROR: "API_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

// ==================== ERROR CLASSIFICATION ====================

export const getErrorType = (error) => {
  // Network-related errors
  if (!error.response) {
    if (
      error.code === "ECONNABORTED" ||
      error.customType === ErrorTypes.TIMEOUT_ERROR
    ) {
      return ErrorTypes.TIMEOUT_ERROR;
    }
    return ErrorTypes.NETWORK_ERROR;
  }

  const status = error.response.status;

  // HTTP status code mapping
  switch (true) {
    case status === 400:
      return ErrorTypes.VALIDATION_ERROR;
    case status === 401:
      return ErrorTypes.AUTHENTICATION_ERROR;
    case status === 403:
      return ErrorTypes.PERMISSION_ERROR;
    case status === 404:
      return ErrorTypes.NOT_FOUND_ERROR;
    case status === 422:
      return ErrorTypes.VALIDATION_ERROR;
    case status >= 500:
      return ErrorTypes.SERVER_ERROR;
    case status >= 400 && status < 500:
      return ErrorTypes.API_ERROR;
    default:
      return ErrorTypes.UNKNOWN_ERROR;
  }
};

// ==================== ERROR MESSAGES ====================

export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);

  // Use custom user message if available
  if (error.userMessage) {
    return error.userMessage;
  }

  // Use server-provided message if available
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // Use formatted message if available
  if (error.formattedMessage) {
    return error.formattedMessage;
  }

  // Default messages based on error type
  switch (errorType) {
    case ErrorTypes.NETWORK_ERROR:
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.";

    case ErrorTypes.TIMEOUT_ERROR:
      return "Permintaan timeout. Server membutuhkan waktu lebih lama dari biasanya. Silakan coba lagi.";

    case ErrorTypes.VALIDATION_ERROR:
      return "Data yang dimasukkan tidak valid. Periksa kembali form Anda.";

    case ErrorTypes.AUTHENTICATION_ERROR:
      return "Sesi Anda telah berakhir. Silakan login kembali.";

    case ErrorTypes.PERMISSION_ERROR:
      return "Anda tidak memiliki akses untuk melakukan tindakan ini.";

    case ErrorTypes.NOT_FOUND_ERROR:
      return "Data yang diminta tidak ditemukan.";

    case ErrorTypes.SERVER_ERROR:
      return "Terjadi kesalahan pada server. Tim teknis sedang menangani masalah ini.";

    case ErrorTypes.API_ERROR:
      return "Terjadi kesalahan saat memproses permintaan Anda.";

    default:
      return "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.";
  }
};

// ==================== ERROR SEVERITY LEVELS ====================

export const ErrorSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const getErrorSeverity = (error) => {
  const errorType = getErrorType(error);

  switch (errorType) {
    case ErrorTypes.NETWORK_ERROR:
    case ErrorTypes.TIMEOUT_ERROR:
      return ErrorSeverity.MEDIUM;

    case ErrorTypes.VALIDATION_ERROR:
      return ErrorSeverity.LOW;

    case ErrorTypes.AUTHENTICATION_ERROR:
    case ErrorTypes.PERMISSION_ERROR:
      return ErrorSeverity.HIGH;

    case ErrorTypes.SERVER_ERROR:
      return ErrorSeverity.CRITICAL;

    default:
      return ErrorSeverity.MEDIUM;
  }
};

// ==================== TOAST CONFIGURATION ====================

const getToastConfig = (severity) => {
  const baseConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  switch (severity) {
    case ErrorSeverity.LOW:
      return { ...baseConfig, autoClose: 3000 };

    case ErrorSeverity.MEDIUM:
      return { ...baseConfig, autoClose: 5000 };

    case ErrorSeverity.HIGH:
      return { ...baseConfig, autoClose: 7000 };

    case ErrorSeverity.CRITICAL:
      return { ...baseConfig, autoClose: 10000 };

    default:
      return baseConfig;
  }
};

// ==================== MAIN ERROR HANDLER ====================

export const handleError = (error, customMessage = null, options = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    throwError = false,
    context = null,
  } = options;

  const errorType = getErrorType(error);
  const severity = getErrorSeverity(error);
  const message = customMessage || getErrorMessage(error);

  // Enhanced logging
  if (logToConsole) {
    const logLevel = severity === ErrorSeverity.CRITICAL ? "error" : "warn";
    console[logLevel]("🚨 Application Error:", {
      type: errorType,
      severity: severity,
      message: message,
      context: context,
      originalError: error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  // Show toast notification
  if (showToast) {
    const toastConfig = getToastConfig(severity);

    switch (severity) {
      case ErrorSeverity.LOW:
        toast.info(message, toastConfig);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(message, toastConfig);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(message, toastConfig);
        break;
      default:
        toast.error(message, toastConfig);
    }
  }

  // Create standardized error object
  const standardizedError = {
    type: errorType,
    severity: severity,
    message: message,
    originalMessage: error.message,
    statusCode: error.response?.status,
    timestamp: new Date().toISOString(),
    context: context,
    originalError: error,
  };

  // Optionally throw error for component-level handling
  if (throwError) {
    throw new Error(message);
  }

  return standardizedError;
};

// ==================== SPECIFIC ERROR HANDLERS ====================

export const handleNetworkError = (error, context = null) => {
  return handleError(
    error,
    "Koneksi internet bermasalah. Pastikan Anda terhubung ke internet dan coba lagi.",
    { context: `Network Error - ${context}` }
  );
};

export const handleValidationError = (error, fieldName = null) => {
  const message = fieldName
    ? `Data ${fieldName} tidak valid. Periksa kembali input Anda.`
    : "Data yang dimasukkan tidak valid. Periksa kembali form Anda.";

  return handleError(error, message, {
    context: `Validation Error - ${fieldName || "General"}`,
  });
};

export const handleApiError = (error, operation = null) => {
  const message = operation
    ? `Gagal ${operation}. Silakan coba lagi dalam beberapa saat.`
    : "Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.";

  return handleError(error, message, {
    context: `API Error - ${operation || "Unknown Operation"}`,
  });
};

export const handlePredictionError = (error) => {
  return handleError(
    error,
    "Gagal membuat prediksi harga. Periksa data komoditas dan wilayah, lalu coba lagi.",
    { context: "Prediction Error" }
  );
};

export const handleAIError = (error) => {
  return handleError(
    error,
    "Layanan AI sedang tidak tersedia. Silakan coba lagi dalam beberapa menit.",
    { context: "AI Service Error" }
  );
};

// ==================== ERROR RECOVERY UTILITIES ====================

export const withErrorBoundary = (
  asyncFunction,
  fallbackValue = null,
  context = null
) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      handleError(error, null, { context: `Error Boundary - ${context}` });
      return fallbackValue;
    }
  };
};

export const retryWithExponentialBackoff = async (
  asyncFunction,
  maxRetries = 3,
  baseDelay = 1000,
  context = null
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFunction();
    } catch (error) {
      lastError = error;

      // Don't retry on validation errors or 4xx errors (except 408, 429)
      if (
        error.response?.status >= 400 &&
        error.response?.status < 500 &&
        ![408, 429].includes(error.response.status)
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt >= maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(
        `🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms for ${
          context || "operation"
        }`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Handle final error
  handleError(lastError, null, {
    context: `Retry Failed - ${context}`,
    showToast: true,
  });
  throw lastError;
};

// ==================== ERROR REPORTING ====================

export const reportError = (error, context = null, additionalData = {}) => {
  const errorReport = {
    timestamp: new Date().toISOString(),
    type: getErrorType(error),
    severity: getErrorSeverity(error),
    message: getErrorMessage(error),
    context: context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: additionalData.userId || "anonymous",
    sessionId: additionalData.sessionId || "unknown",
    stackTrace: error.stack,
    additionalData: additionalData,
  };

  // Log to console for debugging
  console.error("📊 Error Report:", errorReport);

  // In production, you could send this to an error tracking service
  // Example: sendToErrorTrackingService(errorReport);

  return errorReport;
};

// ==================== GRACEFUL DEGRADATION HELPERS ====================

export const getOfflineMessage = () => {
  return "Anda sedang offline. Beberapa fitur mungkin tidak tersedia.";
};

export const getFallbackData = (dataType) => {
  const fallbackData = {
    commodities: [
      "Cabai Rawit Merah",
      "Bawang Merah",
      "Beras",
      "Minyak Goreng",
      "Gula Pasir",
    ],
    regions: [
      "DKI Jakarta",
      "Kota Bandung",
      "Kabupaten Bogor",
      "Kota Surabaya",
      "Kota Medan",
    ],
    priceLevels: ["Konsumen", "Pedagang Besar", "Pedagang Eceran"],
  };

  return fallbackData[dataType] || [];
};

export const createFallbackResponse = (message, data = null) => {
  return {
    success: true,
    message: message,
    data: data,
    isFallback: true,
    timestamp: new Date().toISOString(),
  };
};

// ==================== ERROR PREVENTION ====================

export const validateConnection = async () => {
  try {
    // Simple connectivity test
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch("/health", {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return { isOnline: true, latency: Date.now() };
  } catch (error) {
    return {
      isOnline: false,
      error: error.message,
      shouldShowOfflineMode: true,
    };
  }
};

export const debounceError = (() => {
  const errorCounts = new Map();
  const ERROR_THRESHOLD = 3;
  const TIME_WINDOW = 60000; // 1 minute

  return (errorKey, error) => {
    const now = Date.now();
    const errorData = errorCounts.get(errorKey) || {
      count: 0,
      firstOccurrence: now,
    };

    // Reset if outside time window
    if (now - errorData.firstOccurrence > TIME_WINDOW) {
      errorData.count = 1;
      errorData.firstOccurrence = now;
    } else {
      errorData.count++;
    }

    errorCounts.set(errorKey, errorData);

    // Only show error if below threshold
    if (errorData.count <= ERROR_THRESHOLD) {
      return true; // Show error
    } else if (errorData.count === ERROR_THRESHOLD + 1) {
      // Show rate limiting message once
      toast.warning(
        `Terlalu banyak error serupa. Notifikasi error akan dibatasi selama 1 menit.`,
        { autoClose: 5000 }
      );
    }

    return false; // Don't show error
  };
})();

// ==================== COMPONENT ERROR HELPERS ====================

export const createErrorState = (error, context = null) => {
  return {
    hasError: true,
    error: {
      type: getErrorType(error),
      message: getErrorMessage(error),
      severity: getErrorSeverity(error),
      context: context,
      timestamp: new Date().toISOString(),
    },
  };
};

export const clearErrorState = () => {
  return {
    hasError: false,
    error: null,
  };
};

// ==================== CUSTOM HOOKS HELPERS ====================

export const useErrorHandler = () => {
  const handleAsyncError = (error, context = null) => {
    return handleError(error, null, { context });
  };

  const handleAsyncOperation = async (asyncFn, context = null) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleAsyncError(error, context);
      throw error;
    }
  };

  return {
    handleError: handleAsyncError,
    handleAsyncOperation,
    withErrorBoundary: (fn, fallback, ctx) =>
      withErrorBoundary(fn, fallback, ctx),
  };
};

// ==================== INITIALIZATION ====================

export const initializeErrorHandling = () => {
  // Global error handlers
  window.addEventListener("unhandledrejection", (event) => {
    console.error("🚨 Unhandled Promise Rejection:", event.reason);
    handleError(
      event.reason,
      "Terjadi kesalahan sistem yang tidak tertangani.",
      {
        context: "Unhandled Promise Rejection",
        showToast: true,
      }
    );
  });

  window.addEventListener("error", (event) => {
    console.error("🚨 Global Error:", event.error);
    handleError(event.error, "Terjadi kesalahan JavaScript.", {
      context: "Global JavaScript Error",
      showToast: false, // Don't show toast for JS errors to avoid spam
    });
  });

  console.log("✅ Error handling system initialized");
};

// ==================== EXPORTS ====================

export default {
  ErrorTypes,
  ErrorSeverity,
  handleError,
  handleNetworkError,
  handleValidationError,
  handleApiError,
  handlePredictionError,
  handleAIError,
  withErrorBoundary,
  retryWithExponentialBackoff,
  reportError,
  getOfflineMessage,
  getFallbackData,
  createFallbackResponse,
  validateConnection,
  debounceError,
  createErrorState,
  clearErrorState,
  useErrorHandler,
  initializeErrorHandling,
};
