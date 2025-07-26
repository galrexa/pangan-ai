// frontend/src/components/Chat/ChatBubble.js
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  PersonOutlined,
  SmartToy,
  ContentCopy,
  ThumbUp,
  ThumbDown,
  Schedule,
} from "@mui/icons-material";

const ChatBubble = ({
  message,
  isUser = false,
  timestamp,
  metadata = {},
  onCopy,
  onFeedback,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    if (onCopy) onCopy();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        mb: 3,
        gap: 1.5,
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          bgcolor: isUser ? "primary.main" : "secondary.main",
          width: 36,
          height: 36,
        }}
      >
        {isUser ? <PersonOutlined /> : <SmartToy />}
      </Avatar>

      {/* Message Content */}
      <Box
        sx={{
          maxWidth: "70%",
          minWidth: "200px",
        }}
      >
        {/* Message Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
            justifyContent: isUser ? "flex-end" : "flex-start",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isUser ? "primary.main" : "secondary.main",
            }}
          >
            {isUser ? "Anda" : "PANGAN-AI Assistant"}
          </Typography>

          {timestamp && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Schedule sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(timestamp)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Message Bubble */}
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: isUser ? "primary.main" : "background.paper",
            color: isUser ? "primary.contrastText" : "text.primary",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            border: isUser ? "none" : "1px solid",
            borderColor: isUser ? "transparent" : "divider",
            position: "relative",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message}
          </Typography>

          {/* Metadata for AI responses */}
          {!isUser && metadata && (
            <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {metadata.tokens_used && (
                <Chip
                  size="small"
                  label={`${metadata.tokens_used} tokens`}
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}

              {metadata.provider && (
                <Chip
                  size="small"
                  label={metadata.provider}
                  color="secondary"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}

              {metadata.cached && (
                <Chip
                  size="small"
                  label="cached"
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Action Buttons for AI responses */}
        {!isUser && (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              mt: 1,
              justifyContent: "flex-start",
            }}
          >
            <Tooltip title="Copy message">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ color: "text.secondary" }}
              >
                <ContentCopy sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Helpful response">
              <IconButton
                size="small"
                onClick={() => onFeedback && onFeedback("positive")}
                sx={{ color: "text.secondary" }}
              >
                <ThumbUp sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Not helpful">
              <IconButton
                size="small"
                onClick={() => onFeedback && onFeedback("negative")}
                sx={{ color: "text.secondary" }}
              >
                <ThumbDown sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatBubble;
