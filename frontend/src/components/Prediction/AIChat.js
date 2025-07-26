// frontend/src/components/Prediction/AIChat.js
// FIXED VERSION - Compatible dengan backend API

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Send,
  SmartToy,
  Person,
  Refresh,
  Chat,
  AutoAwesome,
  TrendingUp,
  Warning,
  Lightbulb,
  CheckCircle,
} from "@mui/icons-material";
import apiService from "../../services/api";

const AIChat = ({ formData, predictionData }) => {
  // ============= STATE MANAGEMENT =============
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatContext, setChatContext] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  const [conversationId] = useState(
    `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const messagesEndRef = useRef(null);

  // ============= INITIALIZATION =============
  useEffect(() => {
    checkAIStatus();
    if (formData && predictionData) {
      initializeChat();
    }
  }, [formData, predictionData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============= AI STATUS CHECK =============
  const checkAIStatus = async () => {
    try {
      const status = await apiService.getAIStatus();
      setAiStatus(status);

      if (!status.success) {
        console.warn("AI Service not fully available:", status);
      }
    } catch (err) {
      console.error("AI Status Check Error:", err);
      setAiStatus({ success: false, error: err.message });
    }
  };

  // ============= CHAT INITIALIZATION =============
  const initializeChat = () => {
    const welcomeMessage = generateWelcomeMessage();

    setMessages([
      {
        id: 1,
        type: "ai",
        content: welcomeMessage,
        timestamp: new Date(),
        metadata: {
          confidence: 100,
          sources: ["System", "Welcome Bot"],
        },
      },
    ]);

    // Set simplified chat context
    const context = buildChatContext();
    setChatContext(context);
  };

  const generateWelcomeMessage = () => {
    const commodity = formData?.komoditas || formData?.commodity || "komoditas";
    const region = formData?.wilayah || formData?.region || "wilayah";
    const currentPrice =
      predictionData?.statistics?.current_price ||
      predictionData?.current_price ||
      0;
    const predictionCount = predictionData?.predictions?.length || 0;

    return `🤖 **Selamat datang di PANGAN-AI Assistant!**

Saya siap membantu Anda menganalisis prediksi harga **${commodity}** di **${region}**.

📊 **Data Summary:**
• **Komoditas:** ${commodity}
• **Wilayah:** ${region}
• **Harga Saat Ini:** ${
      currentPrice > 0
        ? `Rp ${currentPrice.toLocaleString("id-ID")}`
        : "Belum tersedia"
    }
• **Periode Prediksi:** ${predictionCount} hari ke depan

🎯 **Yang bisa saya bantu:**
• Analisis trend dan pola harga
• Risk assessment dan faktor risiko
• Rekomendasi strategis untuk kebijakan
• Historical data queries
• Seasonal pattern analysis

💡 **Contoh pertanyaan:**
• "Bagaimana trend harga minggu depan?"
• "Apa risiko utama yang perlu diwaspadai?"
• "Berikan rekomendasi untuk pemerintah"

Silakan tanyakan apa saja! 😊`;
  };

  const buildChatContext = () => {
    // Simplified context - avoid complex nested objects that might cause 422 errors
    return {
      commodity:
        formData?.komoditas || formData?.commodity || "cabai_rawit_merah",
      region: formData?.wilayah || formData?.region || "kota_bandung",
      current_price:
        predictionData?.statistics?.current_price ||
        predictionData?.current_price ||
        0,
      predictions_count: predictionData?.predictions?.length || 0,
      confidence_score: predictionData?.confidence_score || 85,
      trend_direction: predictionData?.trend_analysis?.direction || "STABLE",
      session_id: conversationId,
    };
  };

  // ============= MESSAGE HANDLING =============
  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setError(null);

    try {
      // Simple request format to avoid 422 errors
      const response = await apiService.chatWithAI({
        message: userMessage.content,
        context: chatContext,
        conversation_id: conversationId,
      });

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content:
            response.response || "Maaf, tidak ada respons yang diterima.",
          timestamp: new Date(),
          metadata: {
            confidence: response.metadata?.confidence || null,
            sources: response.metadata?.sources || [],
            provider: response.metadata?.provider || "AI",
          },
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || "AI response failed");
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      handleChatError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatError = (err) => {
    setError(err.message);

    let errorContent =
      "Maaf, terjadi kesalahan saat memproses pertanyaan Anda.";

    if (err.message.includes("422")) {
      errorContent = `🔧 **Request Format Error**

Sepertinya ada masalah dengan format request. Ini biasanya terjadi karena:

• Backend API belum siap menerima request chat
• Format data yang dikirim tidak sesuai ekspektasi
• Validation error pada input

**Solusi sementara:**
• Coba pertanyaan yang lebih sederhana
• Refresh halaman dan coba lagi
• Hubungi developer untuk cek backend API

**Error detail:** ${err.message}`;
    } else if (
      err.message.includes("network") ||
      err.message.includes("fetch")
    ) {
      errorContent = `🌐 **Koneksi Bermasalah**

Tidak dapat terhubung ke server AI.

**Periksa:**
• Koneksi internet Anda
• Status backend server (http://localhost:8000)
• Firewall atau proxy settings

**Error detail:** ${err.message}`;
    }

    const errorMessage = {
      id: Date.now() + 1,
      type: "ai",
      content: errorContent,
      timestamp: new Date(),
      isError: true,
    };

    setMessages((prev) => [...prev, errorMessage]);
  };

  // ============= UTILITY FUNCTIONS =============
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetChat = () => {
    setMessages([]);
    setInputValue("");
    setError(null);
    initializeChat();
  };

  // ============= QUICK SUGGESTIONS =============
  const generateQuickSuggestions = () => [
    {
      id: 1,
      text: "Trend harga",
      icon: <TrendingUp />,
      prompt: "Bagaimana trend harga dan apa faktor yang mempengaruhinya?",
    },
    {
      id: 2,
      text: "Risk assessment",
      icon: <Warning />,
      prompt: "Apa saja risiko utama yang perlu diwaspadai?",
    },
    {
      id: 3,
      text: "Rekomendasi",
      icon: <CheckCircle />,
      prompt: "Berikan rekomendasi strategis untuk pemerintah",
    },
    {
      id: 4,
      text: "Pattern analysis",
      icon: <Lightbulb />,
      prompt: "Analisis pola harga dan seasonal factors",
    },
  ];

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.prompt);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // ============= RENDER FUNCTIONS =============
  const renderMessage = (message) => {
    const isAI = message.type === "ai";

    return (
      <Box
        key={message.id}
        sx={{
          display: "flex",
          justifyContent: isAI ? "flex-start" : "flex-end",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isAI ? "row" : "row-reverse",
            alignItems: "flex-start",
            maxWidth: "85%",
          }}
        >
          <Avatar
            sx={{
              bgcolor: isAI
                ? message.isError
                  ? "error.main"
                  : "primary.main"
                : "secondary.main",
              mx: 1,
              width: 36,
              height: 36,
            }}
          >
            {isAI ? <SmartToy /> : <Person />}
          </Avatar>

          <Paper
            sx={{
              p: 2.5,
              bgcolor: isAI
                ? message.isError
                  ? "error.light"
                  : "grey.100"
                : "primary.main",
              color: isAI
                ? message.isError
                  ? "error.contrastText"
                  : "text.primary"
                : "white",
              borderRadius: 3,
              maxWidth: "100%",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
              }}
            >
              {message.content}
            </Typography>

            {message.metadata && (
              <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {message.metadata.confidence && (
                  <Chip
                    label={`Confidence: ${message.metadata.confidence}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}

                {message.metadata.provider && (
                  <Chip
                    label={message.metadata.provider}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            )}

            {message.metadata?.sources &&
              message.metadata.sources.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Sources:</strong>{" "}
                    {Array.isArray(message.metadata.sources)
                      ? message.metadata.sources.join(", ")
                      : message.metadata.sources}
                  </Typography>
                </Box>
              )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 1,
                textAlign: isAI ? "left" : "right",
              }}
            >
              {message.timestamp.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  };

  const renderSuggestions = () => {
    const suggestions = generateQuickSuggestions();

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          💡 **Quick Questions:**
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion.id}
              label={suggestion.text}
              icon={suggestion.icon}
              variant="outlined"
              clickable
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                mb: 1,
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                },
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  // ============= MAIN RENDER =============
  return (
    <Card elevation={3}>
      <CardContent>
        {/* HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{ bgcolor: "primary.main", mr: 2, width: 40, height: 40 }}
          >
            <Chat />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              AI Chat Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Powered by PANGAN-AI • Tanya apa saja tentang prediksi harga
            </Typography>
          </Box>

          <Tooltip title="Reset Chat">
            <IconButton onClick={resetChat} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* ERROR ALERT */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* AI STATUS ALERT */}
        {aiStatus && !aiStatus.success && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            AI Service: {aiStatus.error || "Service tidak tersedia"}
          </Alert>
        )}

        {/* MESSAGES AREA */}
        <Paper
          variant="outlined"
          sx={{
            height: 400,
            overflow: "auto",
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                flexDirection: "column",
              }}
            >
              <AutoAwesome color="primary" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                AI Assistant Ready
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
              >
                Generate prediksi terlebih dahulu untuk memulai chat dengan AI
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map(renderMessage)}

              {/* SUGGESTIONS - Show after welcome message */}
              {messages.length === 1 &&
                messages[0].type === "ai" &&
                renderSuggestions()}

              {/* LOADING INDICATOR */}
              {loading && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      mr: 1,
                      width: 36,
                      height: 36,
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Paper sx={{ p: 2.5, bgcolor: "grey.100", borderRadius: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CircularProgress size={20} sx={{ mr: 1.5 }} />
                      <Typography variant="body2">
                        AI sedang menganalisis...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </Paper>

        {/* INPUT AREA */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pertanyaan Anda... (contoh: 'Bagaimana trend harga?' atau 'Apa risiko utama?')"
              disabled={loading || !chatContext}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || loading || !chatContext}
              sx={{
                minWidth: 60,
                height: 56,
                borderRadius: 2,
              }}
            >
              <Send />
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Tekan Enter untuk kirim, Shift+Enter untuk baris baru
          </Typography>
        </Box>

        {/* CONTEXT STATUS */}
        {!chatContext && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Menunggu Data Prediksi
            </Typography>
            <Typography variant="body2">
              Silakan generate prediksi terlebih dahulu untuk mengaktifkan AI
              Chat.
            </Typography>
          </Alert>
        )}

        {/* CONNECTION STATUS */}
        {chatContext && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={conversationId.slice(-6)}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={aiStatus?.success ? "AI Connected" : "AI Limited"}
              size="small"
              color={aiStatus?.success ? "success" : "warning"}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {messages.length} messages
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIChat;
