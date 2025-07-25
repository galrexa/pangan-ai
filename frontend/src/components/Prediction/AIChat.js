import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Fade,
} from "@mui/material";
import {
  Send,
  Chat as ChatIcon,
  Clear,
  HelpOutline,
  Refresh,
} from "@mui/icons-material";
import apiService from "../../services/api";
import { ChatErrorBoundary } from "../common/ErrorBoundary";

const AIChat = ({ formData, predictionData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId] = useState(
    `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build context from formData and predictionData
  const buildContext = () => {
    return {
      current_commodity: formData?.komoditas || "cabai_rawit_merah",
      current_region: formData?.wilayah || "kota_bandung",
      last_prediction: predictionData
        ? {
            commodity: predictionData.commodity || formData?.komoditas,
            region: predictionData.region || formData?.wilayah,
            current_price: predictionData.statistics?.current_price || 100000,
            predictions:
              predictionData.predictions?.map((p) => p.predicted_price) || [],
            trend_analysis: predictionData.trend_analysis || {
              direction: "STABLE",
              total_change_pct: 0,
            },
            risk_assessment: predictionData.risk_assessment || {
              level: "MEDIUM",
            },
          }
        : null,
      session_start: new Date().toISOString(),
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const chatRequest = await apiService.chatWithAI({
        message: input,
        context: buildContext(),
        conversation_id: conversationId,
      });

      const aiResponse = {
        role: "ai",
        content: chatRequest.response || "No response received.",
        success: chatRequest.success,
        timestamp: new Date(),
        metadata: chatRequest.metadata,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setError(null);
    } catch (err) {
      setError("Gagal mendapatkan respons dari AI. Silakan coba lagi.");
      const errorMessage = {
        role: "error",
        content: "Maaf, saya mengalami masalah saat memproses pertanyaan Anda.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleHelp = () => {
    const helpMessage = {
      role: "system",
      content: `
        **Panduan Chat:**
        - **Pertanyaan Harga:** "Bagaimana tren harga cabai minggu ini?"
        - **Rekomendasi Kebijakan:** "Apa strategi stabilisasi harga bawang?"
        - **Analisis Pasar:** "Faktor apa yang memengaruhi harga pangan?"
        - **Perintah:**
          - /reset: Bersihkan chat
          - /help: Tampilkan panduan ini
      `,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, helpMessage]);
  };

  return (
    <ChatErrorBoundary>
      <Fade in timeout={1000}>
        <Card
          sx={{
            height: "100%",
            maxHeight: "600px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <ChatIcon />
              </Avatar>
            }
            title={
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Asisten AI Pangan
              </Typography>
            }
            subheader="Tanya tentang tren harga, rekomendasi kebijakan, atau analisis pasar"
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Panduan">
                  <IconButton onClick={handleHelp}>
                    <HelpOutline />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bersihkan Chat">
                  <IconButton onClick={handleClearChat}>
                    <Clear />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          <Divider />
          <CardContent sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {messages.length === 0 && !error && (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Mulai bertanya tentang harga pangan atau kebijakan pasar!
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<HelpOutline />}
                  onClick={handleHelp}
                  sx={{ mt: 2 }}
                >
                  Lihat Panduan
                </Button>
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <List>
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      flexDirection:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        bgcolor:
                          msg.role === "user"
                            ? "primary.light"
                            : msg.role === "error"
                            ? "error.light"
                            : "grey.100",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {msg.content}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(msg.timestamp).toLocaleString("id-ID")}{" "}
                            {msg.metadata &&
                              `(Tokens: ${msg.metadata.input_length} → ${msg.metadata.output_length})`}
                          </Typography>
                        }
                      />
                      {msg.success === false && (
                        <Chip
                          label="Gagal"
                          color="error"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </ListItem>
                  {index < messages.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </CardContent>
          <Divider />
          <Box sx={{ p: 2, bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan Anda..."
                disabled={loading}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "white" }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                Kirim
              </Button>
            </Box>
          </Box>
        </Card>
      </Fade>
    </ChatErrorBoundary>
  );
};

export default AIChat;
