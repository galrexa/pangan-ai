import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./App.css"; // ← TAMBAHKAN INI
import theme from "./styles/theme";
import Layout from "./components/Layout/Layout";
import HistoricalDashboard from "./components/Dashboard/HistoricalDashboard";
import LazyHistoricalDashboard from "./components/Dashboard/LazyHistoricalDashboard";
import PredictionDashboard from "./components/Prediction/PredictionDashboard";
import ChatInterface from "./components/Chat/ChatInterface";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<LazyHistoricalDashboard />} />
            <Route path="/prediction" element={<PredictionDashboard />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
