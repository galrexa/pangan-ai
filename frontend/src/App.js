// frontend/src/App.js - UPDATED with new prediction page

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import theme from "./styles/theme";

import {
  Assessment,
  TrendingUp,
  Chat,
  Home,
  Timeline,
} from "@mui/icons-material";

// Import components
import NewPredictionPage from "./components/Prediction/NewPredictionPage";
import LazyHistoricalDashboard from "./components/Dashboard/LazyHistoricalDashboard";

// Simple Home Component
const HomePage = () => (
  <Container maxWidth="lg" sx={{ py: 2 }}>
    <Box sx={{ textAlign: "center", mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
        🌾 PANGAN-AI
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
        Sistem Prediksi Harga Pangan Berbasis AI
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
        Platform analisis dan prediksi harga komoditas pangan strategis
        menggunakan teknologi Deep Learning dan AI untuk mendukung pengambilan
        keputusan yang tepat.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          component={Link}
          to="/history"
          variant="contained"
          size="large"
          startIcon={<Timeline />}
          sx={{ px: 4 }}
        >
          Monitor Harga
        </Button>
        <Button
          component={Link}
          to="/prediction"
          variant="contained"
          size="large"
          startIcon={<TrendingUp />}
          sx={{ px: 4 }}
        >
          Mulai Prediksi
        </Button>
      </Box>
    </Box>

    {/* Feature Cards */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 3,
        mt: 6,
      }}
    >
      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <TrendingUp sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Prediksi Akurat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Model LSTM dengan tingkat akurasi tinggi untuk prediksi harga 7 hari
          ke depan
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Assessment sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Analisis Mendalam
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analisis trend, volatilitas, dan faktor-faktor yang mempengaruhi harga
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Chat sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          AI Insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rekomendasi dan insight berbasis AI untuk pengambilan keputusan
          strategis
        </Typography>
      </Box>
    </Box>
  </Container>
);

// Navigation Component
const Navigation = () => (
  <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
    <Toolbar>
      <Typography
        variant="h6"
        component="div"
        sx={{ flexGrow: 1, fontWeight: "bold" }}
      >
        🌾 PANGAN-AI
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button color="inherit" component={Link} to="/" startIcon={<Home />}>
          Home
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/history"
          startIcon={<Timeline />}
        >
          Monitor Harga
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/prediction"
          startIcon={<TrendingUp />}
        >
          Prediksi
        </Button>
      </Box>
    </Toolbar>
  </AppBar>
);

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
          <Navigation />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/prediction" element={<NewPredictionPage />} />
            <Route path="/history" element={<LazyHistoricalDashboard />} />
            {/* <Route path="/chat" element={<ChatInterface />} /> */}
          </Routes>

          {/* Footer */}
          <Box sx={{ bgcolor: "primary.main", color: "white", py: 3, mt: 6 }}>
            <Container maxWidth="lg">
              <Typography variant="body2" align="center">
                © 2025 PANGAN-AI - Sistem Prediksi Harga Pangan Berbasis AI
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 1, opacity: 0.8 }}
              >
                Dikembangkan oleh V3 Squad untuk LAN Datathon 2025
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
