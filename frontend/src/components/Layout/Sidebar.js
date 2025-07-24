import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Dashboard,
  TrendingUp,
  Chat,
  Assessment,
  CloudQueue,
  Event,
  BarChart,
} from "@mui/icons-material";

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 70;

const menuItems = [
  {
    path: "/dashboard",
    label: "Historical Dashboard",
    icon: <Dashboard />,
    description: "Data historis & analisis trend",
  },
  {
    path: "/prediction",
    label: "Price Prediction",
    icon: <TrendingUp />,
    description: "Prediksi harga 7 hari ke depan",
  },
  {
    path: "/chat",
    label: "AI Assistant",
    icon: <Chat />,
    description: "Chat dengan AI untuk insights",
  },
];

const Sidebar = ({ open, onClose, isMobile }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const drawerContent = (
    <Box sx={{ overflow: "auto", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          mt: 8,
          textAlign: open ? "left" : "center",
        }}
      >
        {open && (
          <>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Navigation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dashboard & Analytics
            </Typography>
          </>
        )}
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": {
                    backgroundColor: isActive ? "primary.dark" : "action.hover",
                  },
                  minHeight: open ? 64 : 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: isActive ? "white" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {open && (
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 500,
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.75rem",
                      color: isActive
                        ? "rgba(255,255,255,0.7)"
                        : "text.secondary",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Feature Status */}
      {open && (
        <Box sx={{ px: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            System Status
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Chip
              icon={<Assessment />}
              label="LSTM Model Active"
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<CloudQueue />}
              label="Weather Data Online"
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<Event />}
              label="Event Monitoring"
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<BarChart />}
              label="Price Level Tracking"
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      )}

      {/* Footer Info */}
      {open && (
        <Box sx={{ mt: "auto", p: 2, pt: 4 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            PANGAN-AI v1.0
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Deep Learning & AI Generatif
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
