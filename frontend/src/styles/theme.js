// frontend/src/styles/theme.js
// ENHANCED RESPONSIVE THEME for PANGAN-AI

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // ===============================
  // RESPONSIVE BREAKPOINTS
  // ===============================
  breakpoints: {
    values: {
      xs: 0, // Mobile phones
      sm: 600, // Small tablets
      md: 960, // Large tablets / Small laptops
      lg: 1280, // Desktops
      xl: 1920, // Large desktops / 4K
    },
  },

  // ===============================
  // COLOR PALETTE
  // ===============================
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Government Blue
      dark: "#1565c0",
      light: "#42a5f5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#388e3c", // Government Green
      dark: "#2e7d32",
      light: "#66bb6a",
      contrastText: "#ffffff",
    },
    error: {
      main: "#d32f2f",
      dark: "#c62828",
      light: "#ef5350",
    },
    warning: {
      main: "#ed6c02",
      dark: "#e65100",
      light: "#ff9800",
    },
    info: {
      main: "#0288d1",
      dark: "#01579b",
      light: "#03dac6",
    },
    success: {
      main: "#2e7d32",
      dark: "#1b5e20",
      light: "#4caf50",
    },
    background: {
      default: "#f8fafc", // Very light gray
      paper: "#ffffff",
    },
    text: {
      primary: "#1a202c", // Dark gray for readability
      secondary: "#4a5568", // Medium gray
      disabled: "#a0aec0",
    },
    divider: "#e2e8f0",

    // ===============================
    // CUSTOM COLORS FOR PANGAN-AI
    // ===============================
    // Accessible via theme.palette.custom
    custom: {
      gradient: {
        primary: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        secondary: "linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)",
        accent: "linear-gradient(45deg, #1976d2, #388e3c)",
        danger: "linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)",
      },
      commodity: {
        cabai: "#d32f2f", // Red for chili
        bawang: "#9c27b0", // Purple for onion
        general: "#1976d2", // Blue for general commodities
      },
      volatility: {
        low: "#4caf50", // Green for low volatility
        medium: "#ff9800", // Orange for medium volatility
        high: "#f44336", // Red for high volatility
      },
      chart: {
        primary: "#1976d2",
        secondary: "#388e3c",
        tertiary: "#f57c00",
        quaternary: "#7b1fa2",
        accent: "#00796b",
      },
    },
  },

  // ===============================
  // RESPONSIVE TYPOGRAPHY
  // ===============================
  typography: {
    fontFamily: [
      '"Roboto"',
      '"Inter"',
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Arial",
      "sans-serif",
    ].join(","),

    // Responsive font sizes
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem", // 40px
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      "@media (min-width:600px)": {
        fontSize: "3rem", // 48px on tablet+
      },
      "@media (min-width:960px)": {
        fontSize: "3.5rem", // 56px on desktop+
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem", // 32px
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      "@media (min-width:600px)": {
        fontSize: "2.5rem", // 40px on tablet+
      },
      "@media (min-width:960px)": {
        fontSize: "3rem", // 48px on desktop+
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem", // 28px
      lineHeight: 1.4,
      "@media (min-width:600px)": {
        fontSize: "2rem", // 32px on tablet+
      },
      "@media (min-width:960px)": {
        fontSize: "2.25rem", // 36px on desktop+
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem", // 24px
      lineHeight: 1.4,
      "@media (min-width:600px)": {
        fontSize: "1.75rem", // 28px on tablet+
      },
      "@media (min-width:960px)": {
        fontSize: "2rem", // 32px on desktop+
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.25rem", // 20px
      lineHeight: 1.5,
      "@media (min-width:600px)": {
        fontSize: "1.5rem", // 24px on tablet+
      },
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.125rem", // 18px
      lineHeight: 1.5,
      "@media (min-width:600px)": {
        fontSize: "1.25rem", // 20px on tablet+
      },
    },
    body1: {
      fontSize: "1rem", // 16px
      lineHeight: 1.6,
      "@media (min-width:960px)": {
        fontSize: "1.125rem", // 18px on desktop+
      },
    },
    body2: {
      fontSize: "0.875rem", // 14px
      lineHeight: 1.6,
      "@media (min-width:960px)": {
        fontSize: "1rem", // 16px on desktop+
      },
    },
    caption: {
      fontSize: "0.75rem", // 12px
      lineHeight: 1.4,
      "@media (min-width:960px)": {
        fontSize: "0.875rem", // 14px on desktop+
      },
    },
    button: {
      fontWeight: 500,
      fontSize: "0.875rem",
      textTransform: "none",
      letterSpacing: "0.02em",
      "@media (min-width:960px)": {
        fontSize: "1rem",
      },
    },
  },

  // ===============================
  // RESPONSIVE SPACING
  // ===============================
  spacing: 8, // Base spacing unit (8px)

  // ===============================
  // ENHANCED SHADOWS
  // ===============================
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
    "0px 3px 6px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.12)",
    "0px 6px 12px rgba(0, 0, 0, 0.15), 0px 4px 8px rgba(0, 0, 0, 0.12)",
    "0px 10px 20px rgba(0, 0, 0, 0.15), 0px 6px 12px rgba(0, 0, 0, 0.12)",
    "0px 15px 30px rgba(0, 0, 0, 0.15), 0px 8px 16px rgba(0, 0, 0, 0.12)",
    "0px 20px 40px rgba(0, 0, 0, 0.15), 0px 10px 20px rgba(0, 0, 0, 0.12)",
    "0px 25px 50px rgba(0, 0, 0, 0.15), 0px 12px 24px rgba(0, 0, 0, 0.12)",
    "0px 30px 60px rgba(0, 0, 0, 0.15), 0px 15px 30px rgba(0, 0, 0, 0.12)",
    // ... continuing with more shadow variations
    ...Array(15)
      .fill(0)
      .map(
        (_, i) =>
          `0px ${(i + 4) * 5}px ${(i + 4) * 10}px rgba(0, 0, 0, 0.15), 0px ${
            (i + 4) * 2
          }px ${(i + 4) * 4}px rgba(0, 0, 0, 0.12)`
      ),
  ],

  // ===============================
  // BORDER RADIUS
  // ===============================
  shape: {
    borderRadius: 8, // Default border radius
  },

  // ===============================
  // Z-INDEX LAYERS
  // ===============================
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },

  // ===============================
  // COMPONENT CUSTOMIZATIONS
  // ===============================
  components: {
    // ===============================
    // BUTTON COMPONENTS
    // ===============================
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
          padding: "8px 16px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.12)",
          },
          // Responsive padding
          "@media (min-width:960px)": {
            padding: "10px 20px",
          },
        },
        sizeLarge: {
          padding: "12px 24px",
          fontSize: "1rem",
          "@media (min-width:960px)": {
            padding: "14px 28px",
            fontSize: "1.125rem",
          },
        },
        sizeSmall: {
          padding: "6px 12px",
          fontSize: "0.8rem",
          "@media (min-width:960px)": {
            padding: "8px 16px",
            fontSize: "0.875rem",
          },
        },
      },
    },

    // ===============================
    // CARD COMPONENTS
    // ===============================
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "all 0.3s ease-in-out",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.12)",
          },
          // Responsive padding
          "@media (max-width:959px)": {
            borderRadius: 8,
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px",
          "&:last-child": {
            paddingBottom: "16px",
          },
          // Responsive padding
          "@media (min-width:600px)": {
            padding: "20px",
            "&:last-child": {
              paddingBottom: "20px",
            },
          },
          "@media (min-width:960px)": {
            padding: "24px",
            "&:last-child": {
              paddingBottom: "24px",
            },
          },
        },
      },
    },

    // ===============================
    // CONTAINER COMPONENT
    // ===============================
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "16px",
          paddingRight: "16px",
          "@media (min-width:600px)": {
            paddingLeft: "24px",
            paddingRight: "24px",
          },
          "@media (min-width:960px)": {
            paddingLeft: "32px",
            paddingRight: "32px",
          },
        },
      },
    },

    // ===============================
    // PAPER COMPONENT
    // ===============================
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "@media (min-width:960px)": {
            borderRadius: 12,
          },
        },
        elevation1: {
          boxShadow:
            "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
        },
      },
    },

    // ===============================
    // CHIP COMPONENT
    // ===============================
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          // Responsive font size
          fontSize: "0.75rem",
          "@media (min-width:960px)": {
            fontSize: "0.875rem",
          },
        },
        sizeSmall: {
          fontSize: "0.6875rem",
          "@media (min-width:960px)": {
            fontSize: "0.75rem",
          },
        },
      },
    },

    // ===============================
    // FORM COMPONENTS
    // ===============================
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
            },
            "&.Mui-focused": {
              boxShadow: "0px 4px 8px rgba(25, 118, 210, 0.15)",
            },
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    // ===============================
    // APPBAR COMPONENT
    // ===============================
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(8px)",
        },
      },
    },

    // ===============================
    // TOOLBAR RESPONSIVE
    // ===============================
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "56px",
          "@media (min-width:600px)": {
            minHeight: "64px",
          },
          "@media (min-width:960px)": {
            minHeight: "68px",
          },
        },
      },
    },

    // ===============================
    // DIALOG RESPONSIVE
    // ===============================
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          margin: "16px",
          "@media (min-width:600px)": {
            margin: "32px",
            borderRadius: 16,
          },
        },
      },
    },

    // ===============================
    // FAB RESPONSIVE
    // ===============================
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },

    // ===============================
    // ICON BUTTON RESPONSIVE
    // ===============================
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            transform: "scale(1.05)",
          },
        },
      },
    },

    // ===============================
    // AVATAR COMPONENT
    // ===============================
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: "2px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },

    // ===============================
    // LOADING COMPONENTS
    // ===============================
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          animationDuration: "1.2s",
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          "@media (min-width:960px)": {
            height: 10,
          },
        },
      },
    },

    // ===============================
    // ACCORDION RESPONSIVE
    // ===============================
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "8px !important",
          "&:before": {
            display: "none",
          },
          margin: "8px 0 !important",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
        },
      },
    },

    // ===============================
    // DRAWER RESPONSIVE
    // ===============================
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: "16px 0 0 16px",
          "@media (max-width:599px)": {
            width: "280px",
          },
          "@media (min-width:600px)": {
            width: "320px",
          },
        },
      },
    },
  },

  // ===============================
  // CUSTOM MIXINS FOR RESPONSIVE
  // ===============================
  mixins: {
    toolbar: {
      minHeight: 56,
      "@media (min-width:600px)": {
        minHeight: 64,
      },
      "@media (min-width:960px)": {
        minHeight: 68,
      },
    },
  },
});

// ===============================
// CUSTOM THEME EXTENSIONS
// ===============================

// Add custom responsive utilities
theme.responsive = {
  // Mobile-first media queries
  up: (breakpoint) => theme.breakpoints.up(breakpoint),
  down: (breakpoint) => theme.breakpoints.down(breakpoint),
  only: (breakpoint) => theme.breakpoints.only(breakpoint),
  between: (start, end) => theme.breakpoints.between(start, end),

  // Custom responsive values
  spacing: {
    mobile: theme.spacing(2), // 16px
    tablet: theme.spacing(3), // 24px
    desktop: theme.spacing(4), // 32px
    wide: theme.spacing(6), // 48px
  },

  // Responsive font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },

  // Responsive border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    extraLarge: 16,
    round: "50%",
  },
};

// Add PANGAN-AI specific utilities
theme.pangan = {
  // Chart colors for commodities
  chartColors: {
    primary: "#1976d2",
    secondary: "#388e3c",
    tertiary: "#f57c00",
    quaternary: "#7b1fa2",
    accent: "#00796b",
  },

  // Volatility indicators
  volatility: {
    low: { color: "#4caf50", threshold: 5 },
    medium: { color: "#ff9800", threshold: 15 },
    high: { color: "#f44336", threshold: Infinity },
  },

  // Animation durations
  animation: {
    fast: "0.15s",
    normal: "0.3s",
    slow: "0.5s",
    verySlow: "0.8s",
  },

  // Custom gradients
  gradients: {
    primary: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
    secondary: "linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)",
    accent: "linear-gradient(45deg, #1976d2, #388e3c)",
    card: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  },
};

export default theme;
