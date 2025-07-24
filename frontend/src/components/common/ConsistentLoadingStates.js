// frontend/src/components/common/ConsistentLoadingStates.js - Enhanced Loading Consistency
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Grid,
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  TrendingUp,
  Assessment,
  Chat,
  CloudQueue,
  BarChart,
  Speed,
  Timeline,
} from "@mui/icons-material";
import { useResponsive } from "./ResponsiveComponents";

// ==================== GOVERNMENT-STYLE LOADING COMPONENTS ====================

export const GovernmentLoader = ({
  size = 48,
  message = "Memuat...",
  showMessage = true,
  icon: IconComponent = Assessment,
  color = "primary",
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: { xs: 150, sm: 200 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: showMessage ? 2 : 0,
        }}
      >
        <CircularProgress
          size={size}
          thickness={3}
          sx={{
            color: theme.palette[color].main,
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconComponent
            sx={{
              fontSize: size * 0.4,
              color: theme.palette[color].main,
              opacity: 0.7,
            }}
          />
        </Box>
      </Box>

      {showMessage && (
        <Typography
          variant={isMobile ? "body2" : "body1"}
          color="text.secondary"
          textAlign="center"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export const GovernmentProgressBar = ({
  value = null,
  message = "Memproses data...",
  steps = null,
  currentStep = 0,
  showPercentage = true,
}) => {
  const { isMobile } = useResponsive();

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      <Typography
        variant={isMobile ? "body2" : "body1"}
        color="text.secondary"
        sx={{ mb: 2, fontWeight: 500 }}
      >
        {message}
      </Typography>

      <LinearProgress
        variant={value !== null ? "determinate" : "indeterminate"}
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(25, 118, 210, 0.1)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: "linear-gradient(90deg, #1976d2 0%, #388e3c 100%)",
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        {steps && (
          <Typography variant="caption" color="text.secondary">
            Langkah {currentStep + 1} dari {steps.length}
          </Typography>
        )}
        {showPercentage && value !== null && (
          <Typography variant="caption" color="primary.main" fontWeight={600}>
            {Math.round(value)}%
          </Typography>
        )}
      </Box>

      {steps && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {steps[currentStep] || "Memproses..."}
        </Typography>
      )}
    </Box>
  );
};

// ==================== GOVERNMENT SKELETON LOADERS ====================

export const GovernmentCardSkeleton = ({
  showIcon = true,
  showStats = true,
  lines = 3,
}) => (
  <Card className="government-card">
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {showIcon && (
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{ mr: 2, bgcolor: "rgba(25, 118, 210, 0.1)" }}
          />
        )}
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width="60%"
            height={28}
            sx={{ bgcolor: "rgba(25, 118, 210, 0.1)" }}
          />
          <Skeleton
            variant="text"
            width="40%"
            height={20}
            sx={{ bgcolor: "rgba(25, 118, 210, 0.05)" }}
          />
        </Box>
      </Box>

      {showStats && (
        <Box sx={{ mb: 2 }}>
          <Skeleton
            variant="text"
            width="80%"
            height={36}
            sx={{ bgcolor: "rgba(25, 118, 210, 0.1)" }}
          />
        </Box>
      )}

      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? "70%" : "100%"}
          height={20}
          sx={{
            mb: 0.5,
            bgcolor: "rgba(25, 118, 210, 0.05)",
          }}
        />
      ))}
    </CardContent>
  </Card>
);

export const GovernmentChartSkeleton = ({
  title = "Memuat grafik...",
  height = 400,
}) => {
  const { isMobile } = useResponsive();

  return (
    <Card className="government-card">
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            sx={{ mr: 2, bgcolor: "rgba(25, 118, 210, 0.1)" }}
          />
          <Skeleton
            variant="text"
            width="40%"
            height={32}
            sx={{ bgcolor: "rgba(25, 118, 210, 0.1)" }}
          />
        </Box>

        <Skeleton
          variant="rectangular"
          width="100%"
          height={isMobile ? height * 0.7 : height}
          sx={{
            borderRadius: 2,
            bgcolor: "rgba(25, 118, 210, 0.05)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 2,
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={80}
              height={20}
              sx={{ bgcolor: "rgba(25, 118, 210, 0.05)" }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export const GovernmentTableSkeleton = ({
  rows = 5,
  columns = 4,
  showHeader = true,
}) => (
  <Card className="government-card">
    <CardContent sx={{ p: 0 }}>
      {showHeader && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(25, 118, 210, 0.05)",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                width={`${100 / columns}%`}
                height={24}
                sx={{ bgcolor: "rgba(25, 118, 210, 0.1)" }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ p: 2 }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: "flex",
              gap: 2,
              mb: 1,
              "&:last-child": { mb: 0 },
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={`${100 / columns}%`}
                height={24}
                sx={{ bgcolor: "rgba(25, 118, 210, 0.05)" }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
);

// ==================== SPECIALIZED GOVERNMENT LOADERS ====================

export const DashboardLoadingState = () => {
  const { isMobile } = useResponsive();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton
          variant="text"
          width="50%"
          height={isMobile ? 32 : 40}
          sx={{ mb: 1, bgcolor: "rgba(25, 118, 210, 0.1)" }}
        />
        <Skeleton
          variant="text"
          width="30%"
          height={20}
          sx={{ bgcolor: "rgba(25, 118, 210, 0.05)" }}
        />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <GovernmentCardSkeleton showStats />
          </Grid>
        ))}
      </Grid>

      {/* Main Chart */}
      <GovernmentChartSkeleton height={400} />
    </Box>
  );
};

export const PredictionLoadingState = ({
  steps = [
    "Memuat data historis",
    "Menjalankan model LSTM",
    "Menganalisis trend",
    "Menyiapkan prediksi",
    "Menghasilkan insight AI",
  ],
  currentStep = 0,
  progress = null,
}) => {
  const { isMobile } = useResponsive();

  return (
    <Card className="government-card">
      <CardContent
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: "center",
          minHeight: { xs: 300, sm: 400 },
        }}
      >
        <Box sx={{ mb: 3 }}>
          <TrendingUp
            sx={{
              fontSize: { xs: 48, sm: 64 },
              color: "primary.main",
              mb: 2,
            }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ fontWeight: 600, color: "primary.main", mb: 1 }}
          >
            Membuat Prediksi Harga
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 400, mx: "auto" }}
          >
            Sistem sedang menganalisis data historis dan menjalankan model deep
            learning untuk prediksi akurat
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          {progress !== null ? (
            <GovernmentProgressBar value={progress} message="" showPercentage />
          ) : (
            <GovernmentLoader
              size={60}
              message=""
              showMessage={false}
              icon={Timeline}
            />
          )}
        </Box>

        <Box sx={{ maxWidth: 400, mx: "auto" }}>
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                opacity: index <= currentStep ? 1 : 0.3,
                transition: "opacity 0.3s ease",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor:
                    index < currentStep
                      ? "success.main"
                      : index === currentStep
                      ? "primary.main"
                      : "grey.300",
                  mr: 2,
                  transition: "background-color 0.3s ease",
                }}
              />
              <Typography
                variant="body2"
                color={index <= currentStep ? "text.primary" : "text.secondary"}
                textAlign="left"
              >
                {step}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, display: "block" }}
        >
          Estimasi waktu: 15-30 detik
        </Typography>
      </CardContent>
    </Card>
  );
};

export const ChatLoadingState = ({
  message = "AI sedang menganalisis...",
  showTyping = true,
}) => (
  <Box
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
      bgcolor: "rgba(25, 118, 210, 0.02)",
      borderRadius: 2,
      border: "1px solid",
      borderColor: "rgba(25, 118, 210, 0.1)",
    }}
  >
    <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
      <Chat sx={{ fontSize: 18 }} />
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {message}
      </Typography>
      {showTyping && (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "primary.main",
                animation: "typing 1.4s ease-in-out infinite",
                animationDelay: `${index * 0.2}s`,
                "@keyframes typing": {
                  "0%, 80%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                  "40%": { opacity: 1, transform: "scale(1)" },
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  </Box>
);

// ==================== STATUS INDICATORS ====================

export const SystemStatusLoader = () => {
  const statusItems = [
    { icon: Assessment, label: "Model LSTM", status: "loading" },
    { icon: CloudQueue, label: "Data Cuaca", status: "ready" },
    { icon: BarChart, label: "Harga Pangan", status: "ready" },
    { icon: Speed, label: "AI Engine", status: "loading" },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Status Sistem
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {statusItems.map((item, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <item.icon sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.label}
            </Typography>
            {item.status === "loading" ? (
              <CircularProgress size={16} thickness={4} />
            ) : (
              <Chip
                label="Siap"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ==================== EXPORTS ====================

export default {
  GovernmentLoader,
  GovernmentProgressBar,
  GovernmentCardSkeleton,
  GovernmentChartSkeleton,
  GovernmentTableSkeleton,
  DashboardLoadingState,
  PredictionLoadingState,
  ChatLoadingState,
  SystemStatusLoader,
};
