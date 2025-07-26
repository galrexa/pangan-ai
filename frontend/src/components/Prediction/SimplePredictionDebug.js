// frontend/src/components/Prediction/SimplePredictionDebug.js
// TEMPORARY DEBUG COMPONENT untuk test data flow

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import apiService from "../../services/api";

const SimplePredictionDebug = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testPrediction = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

    const testPayload = {
      komoditas: "Cabai Rawit Merah",
      wilayah: "Kota Bandung",
      level_harga: "Konsumen",
      prediction_days: 7,
      include_weather_forecast: true,
      start_date: "2025-06-01",
      end_date: "2025-06-07",
    };

    try {
      console.log("🧪 Testing prediction with payload:", testPayload);
      const response = await apiService.generatePrediction(testPayload);
      console.log("🧪 Raw API response:", response);

      setApiResponse({
        success: true,
        rawResponse: response,
        dataStructure: typeof response,
        hasData: !!response.data,
        hasDirectProps: !!response.predictions,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("🧪 Test failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDataStructure = (obj, depth = 0) => {
    if (depth > 2) return "..."; // Prevent deep nesting

    if (typeof obj !== "object" || obj === null) {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      return `Array(${obj.length}) [${obj
        .slice(0, 3)
        .map((item) => typeof item)
        .join(", ")}${obj.length > 3 ? "..." : ""}]`;
    }

    const keys = Object.keys(obj);
    return (
      <Box sx={{ ml: depth * 2 }}>
        {keys.slice(0, 10).map((key) => (
          <Box key={key} sx={{ mb: 0.5 }}>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: "bold" }}
            >
              {key}:
            </Typography>
            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
              {typeof obj[key] === "object"
                ? renderDataStructure(obj[key], depth + 1)
                : `${typeof obj[key]} = ${String(obj[key]).substring(0, 50)}${
                    String(obj[key]).length > 50 ? "..." : ""
                  }`}
            </Typography>
          </Box>
        ))}
        {keys.length > 10 && (
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            ... and {keys.length - 10} more properties
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🧪 Prediction API Debug Tool
        </Typography>

        <Button
          variant="contained"
          onClick={testPrediction}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? "Testing..." : "Test Prediction API"}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Error:</Typography>
            <Typography>{error}</Typography>
          </Alert>
        )}

        {apiResponse && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Response Summary
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="API Success"
                      secondary={apiResponse.success ? "✅ Yes" : "❌ No"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Response Type"
                      secondary={apiResponse.dataStructure}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Has .data Property"
                      secondary={apiResponse.hasData ? "✅ Yes" : "❌ No"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Has Direct Properties"
                      secondary={
                        apiResponse.hasDirectProps ? "✅ Yes" : "❌ No"
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Timestamp"
                      secondary={apiResponse.timestamp}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, maxHeight: 400, overflow: "auto" }}>
                <Typography variant="h6" gutterBottom>
                  🔍 Data Structure
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {renderDataStructure(apiResponse.rawResponse)}
              </Paper>
            </Grid>

            {/* Quick Test Visualization */}
            {apiResponse.rawResponse && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    🎯 Quick Data Extract Test
                  </Typography>

                  {/* Test different data access patterns */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      Testing data access patterns:
                    </Typography>

                    {/* Pattern 1: response.data.predictions */}
                    <Typography variant="body2">
                      <strong>response.data.predictions:</strong>{" "}
                      {apiResponse.rawResponse?.data?.predictions
                        ? `✅ Found ${apiResponse.rawResponse.data.predictions.length} items`
                        : "❌ Not found"}
                    </Typography>

                    {/* Pattern 2: response.predictions */}
                    <Typography variant="body2">
                      <strong>response.predictions:</strong>{" "}
                      {apiResponse.rawResponse?.predictions
                        ? `✅ Found ${apiResponse.rawResponse.predictions.length} items`
                        : "❌ Not found"}
                    </Typography>

                    {/* Pattern 3: response.success */}
                    <Typography variant="body2">
                      <strong>response.success:</strong>{" "}
                      {apiResponse.rawResponse?.success
                        ? "✅ True"
                        : "❌ False/undefined"}
                    </Typography>
                  </Box>

                  {/* Show predictions if found */}
                  {(apiResponse.rawResponse?.predictions ||
                    apiResponse.rawResponse?.data?.predictions) && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        📈 Predictions Preview:
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: "grey.100",
                          p: 1,
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                        }}
                      >
                        {JSON.stringify(
                          (
                            apiResponse.rawResponse.predictions ||
                            apiResponse.rawResponse.data.predictions
                          ).slice(0, 3),
                          null,
                          2
                        )}
                        {(apiResponse.rawResponse.predictions?.length ||
                          apiResponse.rawResponse.data?.predictions?.length) >
                          3 && <div>... and more</div>}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default SimplePredictionDebug;
