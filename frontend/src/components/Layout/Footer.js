import React from "react";
import { Box, Typography, Divider, Chip, Grid } from "@mui/material";
import { Security, Speed, CloudDone } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        py: 1,
        px: 1,
        mt: "auto",
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            PANGAN-AI
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Sistem Prediksi Harga Pangan Berbasis Deep Learning & AI Generatif
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © 2025 Kantor Staf Presiden - Kementerian Sekretariat Negara
          </Typography>
        </Grid>

        {/* <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: { md: "flex-end" },
            }}
          >
            <Chip
              icon={<Speed />}
              label="Real-time Processing"
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<Security />}
              label="Secure & Reliable"
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<CloudDone />}
              label="AI-Powered"
              size="small"
              color="success"
              variant="outlined"
            />
          </Box>
        </Grid> */}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Typography variant="caption" color="text.secondary">
            Data Source: Badan Pangan Nasional (BAPANAS) • Weather: BMKG • AI
            Engine: ChatGPT/Claude API • Model: Hybrid SARIMA-LSTM
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
