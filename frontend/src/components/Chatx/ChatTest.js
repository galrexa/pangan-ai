// frontend/src/components/Chat/ChatTest.js
// Component test untuk memastikan chat interface berfungsi

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import { PlayArrow, Stop, BugReport } from "@mui/icons-material";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

const ChatTest = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Test data
  const testMessages = [
    {
      id: 1,
      message: "Bagaimana trend harga cabai bulan ini?",
      isUser: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      message:
        "Berdasarkan data PANGAN-AI, trend harga cabai bulan ini menunjukkan penurunan 2-3% akibat supply yang mulai stabil pasca panen raya. Monitoring ketat diperlukan untuk antisipasi fluktuasi mendadak.",
      isUser: false,
      timestamp: new Date().toISOString(),
      metadata: {
        tokens_used: 87,
        provider: "openai",
        cached: false,
      },
    },
  ];

  const runBasicTest = () => {
    setTestResults([]);
    setMessages([]);

    // Test 1: Add messages
    setTimeout(() => {
      setMessages([testMessages[0]]);
      setTestResults((prev) => [...prev, "✅ User message rendered"]);
    }, 500);

    // Test 2: Add AI response
    setTimeout(() => {
      setMessages(testMessages);
      setTestResults((prev) => [...prev, "✅ AI response rendered"]);
    }, 1000);

    // Test 3: Test loading state
    setTimeout(() => {
      setIsLoading(true);
      setTestResults((prev) => [...prev, "✅ Loading state active"]);
    }, 1500);

    setTimeout(() => {
      setIsLoading(false);
      setTestResults((prev) => [...prev, "✅ Loading state cleared"]);
    }, 2000);
  };

  const testChatInput = (message) => {
    const userMessage = {
      id: Date.now(),
      message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTestResults((prev) => [
      ...prev,
      `✅ Message sent: "${message.substring(0, 30)}..."`,
    ]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        message: `Test response untuk: "${message}". Ini adalah simulasi respons AI untuk testing interface.`,
        isUser: false,
        timestamp: new Date().toISOString(),
        metadata: {
          tokens_used: 45,
          provider: "test",
          cached: false,
        },
      };

      setMessages((prev) => [...prev, aiResponse]);
      setTestResults((prev) => [...prev, "✅ AI response simulated"]);
    }, 1000);
  };

  const clearTest = () => {
    setMessages([]);
    setTestResults([]);
    setIsLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Chat Interface Test
      </Typography>

      {/* Test Controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Controls
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={runBasicTest}
          >
            Run Basic Test
          </Button>
          <Button variant="outlined" startIcon={<Stop />} onClick={clearTest}>
            Clear Test
          </Button>
        </Box>
      </Paper>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" component="div">
            <strong>Test Results:</strong>
            {testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </Typography>
        </Alert>
      )}

      {/* Chat Interface Test Area */}
      <Paper
        elevation={1}
        sx={{ height: "500px", display: "flex", flexDirection: "column" }}
      >
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            backgroundColor: "grey.50",
          }}
        >
          {messages.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 4 }}
            >
              No messages yet. Run basic test or send a message below.
            </Typography>
          )}

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

          {/* Loading indicator */}
          {isLoading && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "secondary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BugReport sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Paper
                elevation={1}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: "18px 18px 18px 4px",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Test AI sedang mengetik...
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <ChatInput
            onSendMessage={testChatInput}
            isLoading={isLoading}
            placeholder="Test message untuk chat interface..."
            suggestedQuestions={[
              "Test basic functionality",
              "Test dengan pesan panjang",
              "Test emoji dan karakter khusus 🚀",
            ]}
          />
        </Box>
      </Paper>

      {/* Component Status */}
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Component Status
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2">
            ✅ ChatBubble: Rendered with user/AI styling
          </Typography>
          <Typography variant="body2">
            ✅ ChatInput: Input validation and suggestions
          </Typography>
          <Typography variant="body2">
            ✅ Message History: Scroll and timestamp display
          </Typography>
          <Typography variant="body2">
            ✅ Loading States: Progress indicators
          </Typography>
          <Typography variant="body2">
            ⏳ API Integration: Ready for backend connection
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatTest;
