// frontend/src/components/Chat/ChatInput.js - Enhanced Responsive Chat Input
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Button,
  Chip,
  Collapse,
  Typography,
  Paper,
  Grid,
  Tooltip,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Fade,
} from "@mui/material";
import {
  Send,
  Mic,
  AttachFile,
  AutoAwesome,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  Assessment,
  Lightbulb,
  Warning,
  Clear,
} from "@mui/icons-material";

const ChatInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Tanyakan sesuatu...",
  suggestedQuestions = [],
  maxLength = 500,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const inputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  // Enhanced suggested prompts with categories
  const enhancedSuggestions = [
    {
      category: "Prediksi",
      icon: <TrendingUp />,
      color: "primary",
      questions: [
        "Prediksi harga cabai rawit 7 hari ke depan di Bogor",
        "Trend harga bawang merah minggu ini",
        "Forecast harga cabai merah untuk bulan Ramadan",
      ],
    },
    {
      category: "Analisis",
      icon: <Assessment />,
      color: "secondary",
      questions: [
        "Analisis faktor yang mempengaruhi lonjakan harga cabai",
        "Perbandingan volatilitas antar wilayah Jabar",
        "Dampak cuaca terhadap supply komoditas",
      ],
    },
    {
      category: "Kebijakan",
      icon: <Lightbulb />,
      color: "warning",
      questions: [
        "Rekomendasi intervensi untuk stabilkan harga",
        "Strategi operasi pasar yang optimal",
        "Timing release cadangan strategis",
      ],
    },
    {
      category: "Risiko",
      icon: <Warning />,
      color: "error",
      questions: [
        "Penilaian risiko volatilitas bulan depan",
        "Early warning untuk lonjakan harga",
        "Skenario worst-case dan mitigasinya",
      ],
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
    console.log("Voice input clicked");
  };

  const handleFileAttach = () => {
    // File attachment implementation would go here
    console.log("File attach clicked");
  };

  const clearMessage = () => {
    setMessage("");
    inputRef.current?.focus();
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Enhanced Suggestions Section */}
      <Collapse in={showSuggestions}>
        <Paper
          elevation={2}
          sx={{
            mb: 2,
            p: { xs: 2, sm: 3 },
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AutoAwesome color="primary" />
            Contoh Pertanyaan Cerdas
          </Typography>

          <Grid container spacing={2}>
            {enhancedSuggestions.map((category, categoryIndex) => (
              <Grid item xs={12} sm={6} md={3} key={categoryIndex}>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={category.icon}
                    label={category.category}
                    color={category.color}
                    size="small"
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  />
                  {category.questions.map((question, questionIndex) => (
                    <Fade
                      key={questionIndex}
                      in
                      timeout={300 + questionIndex * 100}
                    >
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleSuggestionClick(question)}
                        sx={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          justifyContent: "flex-start",
                          mb: 0.5,
                          py: 0.5,
                          px: 1,
                          fontSize: "0.75rem",
                          textTransform: "none",
                          color: "text.secondary",
                          border: "1px solid transparent",
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: `${category.color}.50`,
                            borderColor: `${category.color}.200`,
                            color: `${category.color}.main`,
                          },
                        }}
                      >
                        {question}
                      </Button>
                    </Fade>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Collapse>

      {/* Main Input Section */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 1.5 },
          alignItems: "flex-end",
        }}
      >
        {/* Text Input Field */}
        <TextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={isMobile ? 3 : 4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "background.paper",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderWidth: 2,
              },
            },
            "& .MuiInputBase-input": {
              fontSize: { xs: "0.9rem", sm: "1rem" },
              py: { xs: 1.5, sm: 2 },
            },
          }}
          InputProps={{
            startAdornment: !isMobile && (
              <InputAdornment position="start">
                <Tooltip title="Lampirkan File">
                  <IconButton
                    size="small"
                    onClick={handleFileAttach}
                    disabled={isLoading}
                    sx={{ color: "text.secondary" }}
                  >
                    <AttachFile sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {/* Character Count */}
                  {message.length > 0 && (
                    <Typography
                      variant="caption"
                      color={
                        charCount > maxLength * 0.8 ? "error" : "text.secondary"
                      }
                      sx={{ fontSize: "0.7rem", minWidth: "fit-content" }}
                    >
                      {charCount}/{maxLength}
                    </Typography>
                  )}

                  {/* Clear Button */}
                  {message.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={clearMessage}
                      sx={{ color: "text.secondary" }}
                    >
                      <Clear sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}

                  {/* Voice Input */}
                  <Tooltip
                    title={isRecording ? "Stop Recording" : "Voice Input"}
                  >
                    <IconButton
                      size="small"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      sx={{
                        color: isRecording ? "error.main" : "text.secondary",
                        animation: isRecording ? "pulse 1s infinite" : "none",
                        "@keyframes pulse": {
                          "0%": { opacity: 1 },
                          "50%": { opacity: 0.5 },
                          "100%": { opacity: 1 },
                        },
                      }}
                    >
                      <Mic sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </InputAdornment>
            ),
          }}
          helperText={
            charCount > maxLength
              ? `Pesan terlalu panjang (maksimal ${maxLength} karakter)`
              : null
          }
          error={charCount > maxLength}
        />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Send Button */}
          <Tooltip title="Kirim Pesan (Enter)">
            <span>
              <IconButton
                type="submit"
                disabled={!message.trim() || isLoading || charCount > maxLength}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  width: { xs: 44, sm: 48 },
                  height: { xs: 44, sm: 48 },
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "&:disabled": {
                    bgcolor: "grey.300",
                    color: "grey.500",
                  },
                  transition: "all 0.2s ease",
                  transform:
                    message.trim() && !isLoading ? "scale(1.05)" : "scale(1)",
                }}
              >
                {isLoading ? (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: "2px solid currentColor",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                ) : (
                  <Send sx={{ fontSize: { xs: 18, sm: 20 } }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {/* Suggestions Toggle */}
          <Tooltip
            title={showSuggestions ? "Sembunyikan Contoh" : "Tampilkan Contoh"}
          >
            <IconButton
              onClick={() => setShowSuggestions(!showSuggestions)}
              size="small"
              sx={{
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                "&:hover": {
                  bgcolor: "primary.50",
                  borderColor: "primary.main",
                  color: "primary.main",
                },
              }}
            >
              {showSuggestions ? (
                <ExpandLess sx={{ fontSize: 18 }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Mobile Quick Actions */}
      {isMobile && message.length === 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            Quick Actions:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {[
              {
                label: "Prediksi Harga",
                prompt: "Prediksi harga cabai rawit 7 hari ke depan",
              },
              {
                label: "Analisis Pasar",
                prompt: "Analisis kondisi pasar bawang merah",
              },
              {
                label: "Rekomendasi",
                prompt: "Rekomendasi kebijakan stabilisasi harga",
              },
            ].map((action, index) => (
              <Chip
                key={index}
                label={action.label}
                onClick={() => handleSuggestionClick(action.prompt)}
                size="small"
                variant="outlined"
                sx={{
                  "&:hover": {
                    bgcolor: "primary.50",
                    borderColor: "primary.main",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Status Indicators */}
      {(isLoading || isRecording) && (
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "center",
          }}
        >
          {isLoading && (
            <Chip
              label="AI sedang memproses..."
              size="small"
              color="primary"
              icon={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    border: "2px solid currentColor",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              }
            />
          )}

          {isRecording && (
            <Chip
              label="🎤 Recording..."
              size="small"
              color="error"
              sx={{
                animation: "pulse 1s infinite",
              }}
            />
          )}
        </Box>
      )}

      {/* Input Tips */}
      {!isMobile && message.length === 0 && !showSuggestions && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 1,
            display: "block",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          💡 Tips: Tekan Enter untuk kirim, Shift+Enter untuk baris baru, atau
          klik ikon untuk contoh pertanyaan
        </Typography>
      )}
    </Box>
  );
};

export default ChatInput;
