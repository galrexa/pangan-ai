// frontend/src/styles/themeUtils.js
// THEME UTILITIES untuk kemudahan penggunaan

import { useTheme, useMediaQuery } from "@mui/material";

// ===============================
// RESPONSIVE HOOKS
// ===============================

export const useResponsive = () => {
  const theme = useTheme();

  return {
    isMobile: useMediaQuery(theme.breakpoints.down("md")),
    isTablet: useMediaQuery(theme.breakpoints.between("md", "lg")),
    isDesktop: useMediaQuery(theme.breakpoints.up("lg")),
    isSmallScreen: useMediaQuery(theme.breakpoints.down("sm")),
    isLargeScreen: useMediaQuery(theme.breakpoints.up("xl")),
  };
};

// ===============================
// RESPONSIVE SPACING
// ===============================

export const getResponsiveSpacing = (theme) => ({
  xs: theme.responsive.spacing.mobile,
  sm: theme.responsive.spacing.mobile,
  md: theme.responsive.spacing.tablet,
  lg: theme.responsive.spacing.desktop,
  xl: theme.responsive.spacing.wide,
});

// ===============================
// RESPONSIVE TYPOGRAPHY
// ===============================

export const getResponsiveFontSize = (baseSize, theme) => ({
  fontSize: baseSize,
  [theme.breakpoints.up("md")]: {
    fontSize: `calc(${baseSize} * 1.1)`,
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: `calc(${baseSize} * 1.2)`,
  },
});

// ===============================
// VOLATILITY COLORS
// ===============================

export const getVolatilityColor = (value, theme) => {
  if (value <= theme.pangan.volatility.low.threshold) {
    return theme.pangan.volatility.low.color;
  } else if (value <= theme.pangan.volatility.medium.threshold) {
    return theme.pangan.volatility.medium.color;
  } else {
    return theme.pangan.volatility.high.color;
  }
};

// ===============================
// CHART COLORS
// ===============================

export const getChartColors = (theme) => [
  theme.pangan.chartColors.primary,
  theme.pangan.chartColors.secondary,
  theme.pangan.chartColors.tertiary,
  theme.pangan.chartColors.quaternary,
  theme.pangan.chartColors.accent,
];

// ===============================
// RESPONSIVE CARD STYLES
// ===============================

export const getResponsiveCardStyles = (theme) => ({
  p: { xs: 2, sm: 3, md: 4 },
  borderRadius: { xs: 2, md: 3 },
  boxShadow: {
    xs: theme.shadows[1],
    md: theme.shadows[2],
  },
  transition: theme.pangan.animation.normal,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: {
      xs: theme.shadows[3],
      md: theme.shadows[4],
    },
  },
});

// ===============================
// RESPONSIVE BUTTON STYLES
// ===============================

export const getResponsiveButtonStyles = (theme) => ({
  px: { xs: 2, md: 3 },
  py: { xs: 1, md: 1.5 },
  fontSize: { xs: "0.875rem", md: "1rem" },
  borderRadius: theme.responsive.borderRadius.medium,
  transition: theme.pangan.animation.normal,
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
  },
});

// ===============================
// GRADIENT BACKGROUNDS
// ===============================

export const getGradientBackground = (type, theme) => {
  return {
    background: theme.pangan.gradients[type] || theme.pangan.gradients.primary,
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    "@keyframes gradientShift": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  };
};

// ===============================
// MOBILE FIRST GRID
// ===============================

export const getMobileFirstGrid = () => ({
  xs: 12, // Full width on mobile
  sm: 6, // Half width on small tablets
  md: 4, // Third width on large tablets
  lg: 3, // Quarter width on desktop
});

// ===============================
// RESPONSIVE CONTAINER
// ===============================

export const getResponsiveContainer = (theme) => ({
  maxWidth: {
    xs: "100%",
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
  },
  px: {
    xs: theme.responsive.spacing.mobile,
    md: theme.responsive.spacing.tablet,
    lg: theme.responsive.spacing.desktop,
  },
  py: {
    xs: theme.responsive.spacing.mobile,
    md: theme.responsive.spacing.tablet,
  },
});

// ===============================
// ANIMATION HELPERS
// ===============================

export const getHoverAnimation = (theme) => ({
  transition: `all ${theme.pangan.animation.normal} ease-in-out`,
  "&:hover": {
    transform: "translateY(-4px) scale(1.02)",
    boxShadow: theme.shadows[8],
  },
});

export const getFadeInAnimation = (delay = 0) => ({
  "@keyframes fadeIn": {
    from: {
      opacity: 0,
      transform: "translateY(20px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  animation: `fadeIn 0.6s ease-out ${delay}s both`,
});

// ===============================
// GLASSMORPHISM EFFECT
// ===============================

export const getGlassmorphismStyle = (theme) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: theme.responsive.borderRadius.large,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
});

// ===============================
// COMMON COMPONENT STYLES
// ===============================

export const commonStyles = {
  // Header dengan gradient
  gradientHeader: (theme) => ({
    background: theme.pangan.gradients.accent,
    backgroundClip: "text",
    color: "transparent",
    fontWeight: theme.responsive.fontWeight.bold,
  }),

  // Card dengan hover effect
  hoverCard: (theme) => ({
    ...getResponsiveCardStyles(theme),
    cursor: "pointer",
    "&:hover": {
      ...getHoverAnimation(theme)["&:hover"],
    },
  }),

  // Button dengan gradient
  gradientButton: (theme) => ({
    background: theme.pangan.gradients.primary,
    color: "white",
    border: "none",
    "&:hover": {
      background: theme.pangan.gradients.accent,
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[6],
    },
  }),

  // Mobile-friendly navigation
  mobileNav: (theme) => ({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar,
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderTop: `1px solid ${theme.palette.divider}`,
    display: { md: "none" },
  }),

  // Loading state
  loadingState: (theme) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: { xs: "200px", md: "300px" },
    gap: theme.spacing(2),
    color: theme.palette.text.secondary,
  }),

  // Error state
  errorState: (theme) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: { xs: "200px", md: "300px" },
    gap: theme.spacing(2),
    color: theme.palette.error.main,
    textAlign: "center",
    p: theme.spacing(3),
  }),

  // Empty state
  emptyState: (theme) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: { xs: "200px", md: "300px" },
    gap: theme.spacing(2),
    color: theme.palette.text.secondary,
    textAlign: "center",
    p: theme.spacing(3),
  }),
};

// ===============================
// PANGAN-AI SPECIFIC STYLES
// ===============================

export const panganStyles = {
  // Dashboard card untuk metrics
  metricsCard: (theme) => ({
    p: { xs: 2, md: 3 },
    borderRadius: theme.responsive.borderRadius.large,
    background: theme.pangan.gradients.card,
    backdropFilter: "blur(10px)",
    border: `1px solid ${theme.palette.divider}`,
    transition: theme.pangan.animation.normal,
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[6],
    },
  }),

  // Chart container
  chartContainer: (theme) => ({
    width: "100%",
    height: { xs: "300px", sm: "400px", md: "500px" },
    borderRadius: theme.responsive.borderRadius.medium,
    overflow: "hidden",
    border: `1px solid ${theme.palette.divider}`,
    bgcolor: "background.paper",
  }),

  // Prediction card
  predictionCard: (theme) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
    border: `2px solid ${theme.palette.primary.main}30`,
    borderRadius: theme.responsive.borderRadius.extraLarge,
    p: { xs: 2, md: 4 },
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: theme.pangan.gradients.accent,
    },
  }),

  // AI Chat bubble
  aiChatBubble: (theme) => ({
    maxWidth: { xs: "85%", md: "70%" },
    p: { xs: 1.5, md: 2 },
    borderRadius: `${theme.responsive.borderRadius.large}px ${theme.responsive.borderRadius.large}px ${theme.responsive.borderRadius.large}px 4px`,
    background: theme.pangan.gradients.primary,
    color: "white",
    position: "relative",
    boxShadow: theme.shadows[3],
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: -8,
      width: 0,
      height: 0,
      borderStyle: "solid",
      borderWidth: "0 8px 8px 0",
      borderColor: `transparent ${theme.palette.primary.main} transparent transparent`,
    },
  }),

  // User chat bubble
  userChatBubble: (theme) => ({
    maxWidth: { xs: "85%", md: "70%" },
    p: { xs: 1.5, md: 2 },
    borderRadius: `${theme.responsive.borderRadius.large}px ${theme.responsive.borderRadius.large}px 4px ${theme.responsive.borderRadius.large}px`,
    background: theme.palette.grey[100],
    color: theme.palette.text.primary,
    position: "relative",
    boxShadow: theme.shadows[2],
    ml: "auto",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      right: -8,
      width: 0,
      height: 0,
      borderStyle: "solid",
      borderWidth: "0 0 8px 8px",
      borderColor: `transparent transparent ${theme.palette.grey[100]} transparent`,
    },
  }),

  // Filter panel
  filterPanel: (theme) => ({
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: theme.responsive.borderRadius.large,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
    p: { xs: 2, md: 3 },
    mb: { xs: 2, md: 3 },
  }),

  // Volatility indicator
  volatilityIndicator: (value, theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
    px: theme.spacing(1.5),
    py: theme.spacing(0.5),
    borderRadius: theme.responsive.borderRadius.medium,
    fontSize: "0.875rem",
    fontWeight: theme.responsive.fontWeight.medium,
    bgcolor: `${getVolatilityColor(value, theme)}20`,
    color: getVolatilityColor(value, theme),
    border: `1px solid ${getVolatilityColor(value, theme)}40`,
  }),

  // Status chip
  statusChip: (status, theme) => {
    const statusColors = {
      active: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
    };

    return {
      bgcolor: `${statusColors[status] || statusColors.info}20`,
      color: statusColors[status] || statusColors.info,
      border: `1px solid ${statusColors[status] || statusColors.info}40`,
      fontWeight: theme.responsive.fontWeight.medium,
      "& .MuiChip-icon": {
        color: "inherit",
      },
    };
  },
};

// ===============================
// RESPONSIVE BREAKPOINT HELPERS
// ===============================

export const createResponsiveValue = (values) => {
  const { xs, sm, md, lg, xl } = values;
  return {
    xs: xs || values.mobile,
    sm: sm || xs || values.mobile,
    md: md || values.tablet || sm || xs,
    lg: lg || values.desktop || md || values.tablet,
    xl: xl || lg || values.desktop,
  };
};

export const createResponsiveSpacing = (multiplier) => ({
  xs: multiplier * 8, // 8px base
  sm: multiplier * 12, // 12px
  md: multiplier * 16, // 16px
  lg: multiplier * 20, // 20px
  xl: multiplier * 24, // 24px
});

// ===============================
// ANIMATION KEYFRAMES
// ===============================

export const animations = {
  fadeInUp: {
    "@keyframes fadeInUp": {
      from: {
        opacity: 0,
        transform: "translateY(30px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  },

  slideInLeft: {
    "@keyframes slideInLeft": {
      from: {
        opacity: 0,
        transform: "translateX(-30px)",
      },
      to: {
        opacity: 1,
        transform: "translateX(0)",
      },
    },
  },

  scaleIn: {
    "@keyframes scaleIn": {
      from: {
        opacity: 0,
        transform: "scale(0.8)",
      },
      to: {
        opacity: 1,
        transform: "scale(1)",
      },
    },
  },

  pulse: {
    "@keyframes pulse": {
      "0%": {
        boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.7)",
      },
      "70%": {
        boxShadow: "0 0 0 10px rgba(25, 118, 210, 0)",
      },
      "100%": {
        boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)",
      },
    },
  },

  shimmer: {
    "@keyframes shimmer": {
      "0%": {
        backgroundPosition: "-468px 0",
      },
      "100%": {
        backgroundPosition: "468px 0",
      },
    },
  },
};

// ===============================
// THEME CONTEXT HELPERS
// ===============================

export const withTheme = (Component) => {
  return (props) => {
    const theme = useTheme();
    const responsive = useResponsive();

    return <Component {...props} theme={theme} responsive={responsive} />;
  };
};

// ===============================
// CONDITIONAL STYLES
// ===============================

export const conditionalStyles = {
  showOnMobile: (theme) => ({
    display: { xs: "block", md: "none" },
  }),

  hideOnMobile: (theme) => ({
    display: { xs: "none", md: "block" },
  }),

  showOnDesktop: (theme) => ({
    display: { xs: "none", lg: "block" },
  }),

  hideOnDesktop: (theme) => ({
    display: { xs: "block", lg: "none" },
  }),

  mobileOnly: (theme) => ({
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  }),

  desktopOnly: (theme) => ({
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  }),
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

export const getContainerMaxWidth = (size) => {
  const sizes = {
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  };
  return `${sizes[size] || sizes.lg}px`;
};

export const pxToRem = (px) => `${px / 16}rem`;

export const createShadow = (elevation) => {
  const shadows = [
    "none",
    "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
    "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
    "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
    "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
  ];
  return shadows[elevation] || shadows[1];
};
