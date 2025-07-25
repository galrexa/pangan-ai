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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard,
  TrendingUp,
  Chat,
  Assessment,
  CloudQueue,
  Event,
  BarChart,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 70;

const menuItems = [
  {
    path: "/dashboard",
    label: "Historical Dashboard",
    icon: <Dashboard />,
  },
  {
    path: "/prediction",
    label: "Price Prediction",
    icon: <TrendingUp />,
  },
  {
    path: "/chat",
    label: "AI Assistant",
    icon: <Chat />,
  },
];

const Sidebar = ({ open, collapsed, onClose, onToggleCollapse, isMobile }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const drawerWidth = collapsed ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ overflow: "auto", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          mt: 8,
          textAlign: collapsed ? "center" : "left",
          minHeight: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {!collapsed && (
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

        {/* Collapse Toggle Button (Desktop Only) */}
        {!isMobile && (
          <Box
            sx={{
              position: "absolute",
              top: collapsed ? 100 : 120,
              right: collapsed ? 8 : 16,
            }}
          >
            {/* <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
              <IconButton
                onClick={onToggleCollapse}
                size="small"
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Tooltip> */}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ px: collapsed ? 0.5 : 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <Tooltip
                title={collapsed ? item.label : ""}
                placement="right"
                disableHoverListener={!collapsed}
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: collapsed ? 0.5 : 1,
                    backgroundColor: isActive ? "primary.main" : "transparent",
                    color: isActive ? "white" : "text.primary",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "primary.dark"
                        : "action.hover",
                    },
                    minHeight: collapsed ? 48 : 64,
                    justifyContent: collapsed ? "center" : "initial",
                    px: collapsed ? 1 : 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                      color: isActive ? "white" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && (
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
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Feature Status */}
      {/* {!collapsed && (
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
      )} */}

      {/* Collapsed Status Icons */}
      {/* {collapsed && (
        <Box sx={{ px: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Tooltip title="LSTM Model Active" placement="right">
            <Assessment color="success" sx={{ mx: "auto" }} />
          </Tooltip>
          <Tooltip title="Weather Data Online" placement="right">
            <CloudQueue color="primary" sx={{ mx: "auto" }} />
          </Tooltip>
          <Tooltip title="Event Monitoring" placement="right">
            <Event color="secondary" sx={{ mx: "auto" }} />
          </Tooltip>
          <Tooltip title="Price Level Tracking" placement="right">
            <BarChart color="info" sx={{ mx: "auto" }} />
          </Tooltip>
        </Box>
      )} */}

      {/* Footer Info */}
      {!collapsed && (
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
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      sx={{
        width: isMobile ? DRAWER_WIDTH : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? DRAWER_WIDTH : drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
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
