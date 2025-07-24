import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Assessment,
  CloudQueue,
  EventAvailable,
} from "@mui/icons-material";

const Navbar = ({ onMenuClick }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Assessment sx={{ mr: 1, fontSize: 28 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600 }}
          >
            PANGAN-AI
          </Typography>
          <Typography
            variant="body2"
            sx={{
              ml: 1,
              opacity: 0.8,
              display: { xs: "none", sm: "block" },
            }}
          >
            Sistem Prediksi Harga Pangan
          </Typography>
        </Box>

        {/* Status Indicators */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Chip
            icon={<CloudQueue />}
            label="Weather Online"
            size="small"
            color="secondary"
            sx={{ color: "white" }}
          />
          <Chip
            icon={<EventAvailable />}
            label="Event Monitor"
            size="small"
            color="secondary"
            sx={{ color: "white" }}
          />
        </Box>

        {/* KSP Logo/Branding */}
        <Box sx={{ ml: 2, display: { xs: "none", md: "block" } }}>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Kantor Staf Presiden
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
