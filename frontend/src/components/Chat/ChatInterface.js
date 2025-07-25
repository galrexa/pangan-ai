// frontend/src/components/Chat/ChatInterface.js - Enhanced Government-Style Chat
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Fade,
  Slide,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import {
  Psychology,
  SmartToy,
  TrendingUp,
  Warning,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Lightbulb,
  Assessment,
  Speed,
  Security,
  PersonOutlined,
  Send,
  Mic,
  AttachFile,
  MoreVert,
} from "@mui/icons-material";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import apiService from "../../services/api";

const ChatInterface = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [aiStatus, setAiStatus] = useState({
    online: true,
    model: "Claude-3.5",
    responseTime: "~2s",
    accuracy: "94%",
  });
  // State to hold the latest prediction data for context in chat
  const [lastPredictionData, setLastPredictionData] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to fetch AI service status
  useEffect(() => {
    const fetchAiStatus = async () => {
      try {
        const status = await apiService.getAIStatus(); // Assuming getAIStatus exists in apiService
        if (status.success) {
          setAiStatus({
            online: true,
            model: status.provider || "AI Model", // Use actual provider from backend
            responseTime: "~" + (status.avg_response_time || "2s"),
            accuracy: status.model_accuracy
              ? `${(status.model_accuracy * 100).toFixed(0)}%`
              : "N/A",
          });
        } else {
          setAiStatus((prev) => ({ ...prev, online: false }));
        }
      } catch (error) {
        console.error("Error fetching AI status:", error);
        setAiStatus((prev) => ({ ...prev, online: false }));
      }
    };
    fetchAiStatus();
  }, []); // Run once on component mount

  // Enhanced Quick Action Cards
  const quickActions = [
    {
      id: "price_prediction",
      title: "Prediksi Harga",
      description: "Dapatkan prediksi harga 7 hari ke depan",
      icon: <TrendingUp />,
      color: "primary",
      prompt:
        "Berikan prediksi harga cabai rawit merah untuk 7 hari ke depan di Kabupaten Bogor",
      category: "prediction",
    },
    {
      id: "market_analysis",
      title: "Analisis Pasar",
      description: "Analisis kondisi pasar terkini",
      icon: <Assessment />,
      color: "secondary",
      prompt:
        "Analisis kondisi pasar bawang merah saat ini dan faktor-faktor yang mempengaruhi",
      category: "analysis",
    },
    {
      id: "policy_recommendation",
      title: "Rekomendasi Kebijakan",
      description: "Saran intervensi berdasarkan data",
      icon: <Lightbulb />,
      color: "warning",
      prompt:
        "Berikan rekomendasi kebijakan untuk mengatasi lonjakan harga cabai merah",
      category: "policy",
    },
    {
      id: "risk_assessment",
      title: "Penilaian Risiko",
      description: "Evaluasi risiko volatilitas harga",
      icon: <Warning />,
      color: "error",
      prompt:
        "Lakukan penilaian risiko untuk fluktuasi harga komoditas strategis bulan ini",
      category: "risk",
    },
  ];

  const handleQuickAction = async (action) => {
    const userMessage = {
      id: Date.now(),
      message: action.prompt,
      isUser: true,
      timestamp: new Date().toISOString(),
      category: action.category,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      // Build context from lastPredictionData if available
      const chatContext = lastPredictionData
        ? {
            current_commodity: lastPredictionData.commodity,
            current_region: lastPredictionData.region,
            last_prediction: {
              commodity: lastPredictionData.commodity,
              region: lastPredictionData.region,
              current_price: lastPredictionData.current_price,
              predictions:
                lastPredictionData.predictions?.map((p) => p.predicted_price) ||
                [],
              trend_analysis: lastPredictionData.trend_analysis,
              risk_assessment: lastPredictionData.risk_assessment,
            },
          }
        : null;

      const aiResponse = await apiService.chatWithAI({
        message: action.prompt,
        context: chatContext,
        conversation_id: "quick_action_chat", // Unique ID for quick action conversations
      });

      if (aiResponse.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            message: aiResponse.response,
            isUser: false,
            timestamp: new Date().toISOString(),
            metadata: aiResponse.metadata,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            message:
              aiResponse.error ||
              "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.",
            isUser: false,
            timestamp: new Date().toISOString(),
            metadata: { provider: "error" },
          },
        ]);
      }
    } catch (error) {
      console.error("Error in AI chat (quick action):", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          message:
            "Maaf, terjadi masalah koneksi dengan AI service. Silakan coba lagi nanti.",
          isUser: false,
          timestamp: new Date().toISOString(),
          metadata: { provider: "connection_error" },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    const userMessage = {
      id: Date.now(),
      message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build context from lastPredictionData if available
      const chatContext = lastPredictionData
        ? {
            current_commodity: lastPredictionData.commodity,
            current_region: lastPredictionData.region,
            last_prediction: {
              commodity: lastPredictionData.commodity,
              region: lastPredictionData.region,
              current_price: lastPredictionData.current_price,
              predictions:
                lastPredictionData.predictions?.map((p) => p.predicted_price) ||
                [],
              trend_analysis: lastPredictionData.trend_analysis,
              risk_assessment: lastPredictionData.risk_assessment,
            },
          }
        : null;

      const aiResponse = await apiService.chatWithAI({
        message: message,
        context: chatContext,
        conversation_id: "main_chat", // A consistent ID for the main chat
      });

      if (aiResponse.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            message: aiResponse.response,
            isUser: false,
            timestamp: new Date().toISOString(),
            metadata: aiResponse.metadata,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            message:
              aiResponse.error ||
              "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.",
            isUser: false,
            timestamp: new Date().toISOString(),
            metadata: { provider: "error" },
          },
        ]);
      }
    } catch (error) {
      console.error("Error in AI chat (send message):", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          message:
            "Maaf, terjadi masalah koneksi dengan AI service. Silakan coba lagi nanti.",
          isUser: false,
          timestamp: new Date().toISOString(),
          metadata: { provider: "connection_error" },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    mr: 2,
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                  }}
                >
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    PANGAN-AI Assistant
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                  >
                    AI Decision Support untuk Kebijakan Harga Pangan
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* AI Status Indicator */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: aiStatus.online ? "success.50" : "error.50",
                  border: "1px solid",
                  borderColor: aiStatus.online ? "success.200" : "error.200",
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {aiStatus.online ? (
                      <CheckCircle color="success" sx={{ fontSize: 16 }} />
                    ) : (
                      <Warning color="error" sx={{ fontSize: 16 }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      AI Status: {aiStatus.online ? "Online" : "Offline"}
                    </Typography>
                    {aiStatus.online && (
                      <Chip
                        label={aiStatus.model}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {aiStatus.online ? aiStatus.responseTime : "N/A"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Quick Actions Sidebar */}
        <Grid item xs={12} lg={4}>
          <Slide direction="right" in timeout={1000}>
            <Box>
              {/* Quick Actions Header */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Psychology sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  sx={{ ml: "auto" }}
                >
                  {showQuickActions ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              {/* Quick Action Cards */}
              <Collapse in={showQuickActions}>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} lg={12} key={action.id}>
                      <Fade in timeout={1200 + index * 200}>
                        <Card
                          elevation={0}
                          sx={{
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            border: "1px solid",
                            borderColor: "divider",
                            "&:hover": {
                              borderColor: `${action.color}.main`,
                              transform: "translateY(-2px)",
                              boxShadow: 4,
                            },
                          }}
                          onClick={() => handleQuickAction(action)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: `${action.color}.main`,
                                  width: 36,
                                  height: 36,
                                }}
                              >
                                {React.cloneElement(action.icon, {
                                  sx: { fontSize: 20 },
                                })}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600, mb: 0.5 }}
                                >
                                  {action.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {action.description}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Collapse>

              {/* System Info */}
              <Card
                elevation={0}
                sx={{
                  mt: 3,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    💡 Tips Penggunaan
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    • Sebutkan komoditas dan wilayah yang spesifik
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    • Gunakan bahasa natural untuk bertanya
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • Tanyakan "what-if scenario" untuk simulasi
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Slide>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} lg={8}>
          <Slide direction="left" in timeout={1000}>
            <Paper
              elevation={2}
              sx={{
                height: { xs: "60vh", md: "70vh" },
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "primary.50",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SmartToy color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Chat dengan AI
                    </Typography>
                    <Chip
                      label="Beta"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  p: { xs: 1, sm: 2 },
                  bgcolor: "grey.25",
                }}
              >
                {messages.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "primary.100",
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                        mb: 2,
                      }}
                    >
                      <SmartToy sx={{ fontSize: { xs: 30, md: 40 } }} />
                    </Avatar>
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Selamat Datang di PANGAN-AI
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 400 }}
                    >
                      Saya siap membantu analisis data harga pangan dan
                      memberikan rekomendasi kebijakan berbasis AI. Mulai dengan
                      quick actions di sebelah kiri atau ajukan pertanyaan
                      langsung.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatBubble
                        key={message.id}
                        message={message.message}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                        metadata={message.metadata}
                        onCopy={() => console.log("Copy clicked")}
                        onFeedback={(type) => console.log("Feedback:", type)}
                      />
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 3,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "secondary.main",
                            width: 36,
                            height: 36,
                          }}
                        >
                          <SmartToy sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Paper
                          elevation={1}
                          sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: "18px 18px 18px 4px",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              {Array.from({ length: 3 }).map((_, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: "primary.main",
                                    animation:
                                      "pulse 1.4s ease-in-out infinite",
                                    animationDelay: `${index * 0.2}s`,
                                    "@keyframes pulse": {
                                      "0%, 80%, 100%": {
                                        opacity: 0.3,
                                        transform: "scale(0.8)",
                                      },
                                      "40%": {
                                        opacity: 1,
                                        transform: "scale(1)",
                                      },
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              AI sedang menganalisis...
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>

              {/* Input Area */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderTop: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="Tanyakan tentang prediksi harga, analisis pasar, atau rekomendasi kebijakan..."
                  suggestedQuestions={[
                    "Bagaimana trend harga cabai bulan ini?",
                    "Rekomendasi untuk mengatasi volatilitas bawang merah?",
                    "Analisis dampak cuaca terhadap harga komoditas",
                  ]}
                />
              </Box>
            </Paper>
          </Slide>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatInterface;
