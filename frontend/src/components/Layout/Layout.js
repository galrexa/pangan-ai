import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
    setSidebarCollapsed(false);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Calculate main content margin based on sidebar state
  const getMainMarginLeft = () => {
    if (isMobile) return 0;
    if (!sidebarOpen) return 0;
    return sidebarCollapsed ? "70px" : "280px";
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Navbar */}
      <Navbar
        onMenuClick={handleSidebarToggle}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: getMainMarginLeft(),
          transition: theme.transitions.create(["margin-left"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: "100vh",
          width: "100%", // Remove the calc() that was causing the issue
        }}
      >
        {/* Content Area - Optimized Padding */}
        <Box
          className="main-content-area"
          sx={{
            mt: { xs: 7, sm: 8 }, // Account for navbar height
            flex: 1,
            width: "100%",
            px: { xs: 1, sm: 2, md: 3 }, // Reduced padding significantly
            py: { xs: 1, sm: 2 }, // Reduced vertical padding
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        <Footer />
      </Box>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: theme.zIndex.drawer - 1,
          }}
        />
      )}
    </Box>
  );
};

export default Layout;
