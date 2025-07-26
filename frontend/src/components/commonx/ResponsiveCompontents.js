// frontend/src/components/common/ResponsiveComponents.js - Enhanced Responsive Design System
import React from "react";
import {
  useTheme,
  useMediaQuery,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  Divider,
} from "@mui/material";

// ==================== RESPONSIVE HOOKS ====================

export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeMobile = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeMobile,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
};

export const useResponsiveValue = (mobileValue, tabletValue, desktopValue) => {
  const { isMobile, isTablet } = useResponsive();
  
  if (isMobile) return mobileValue;
  if (isTablet) return tabletValue || mobileValue;
  return desktopValue || tabletValue || mobileValue;
};

export const useResponsiveSpacing = () => {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    container: isMobile ? 2 : isTablet ? 3 : 4,
    card: isMobile ? 2 : 3,
    section: isMobile ? 3 : isTablet ? 4 : 5,
    element: isMobile ? 1 : 2,
  };
};

// ==================== RESPONSIVE LAYOUT COMPONENTS ====================

export const ResponsiveContainer = ({ 
  children, 
  maxWidth = "xl",
  disableGutters = false,
  sx = {},
  ...props 
}) => {
  const spacing = useResponsiveSpacing();
  
  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        py: spacing.container,
        px: disableGutters ? 0 : { xs: 2, sm: 3, md: 4 },
        ...sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

export const ResponsiveGrid = ({ 
  children, 
  spacing = null, 
  sx = {},
  ...props 
}) => {
  const responsiveSpacing = useResponsiveSpacing();
  const gridSpacing = spacing || responsiveSpacing.element;
  
  return (
    <Grid
      container
      spacing={gridSpacing}
      sx={{
        width: '100%',
        margin: 0,
        ...sx
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

export const ResponsiveCard = ({ 
  children, 
  elevation = null,
  variant = "elevation",
  sx = {},
  ...props 
}) => {
  const { isMobile } = useResponsive();
  const spacing = useResponsiveSpacing();
  const cardElevation = elevation ?? (isMobile ? 1 : 2);
  
  return (
    <Card
      elevation={cardElevation}
      variant={variant}
      sx={{
        borderRadius: { xs: 2, md: 3 },
        overflow: 'hidden',
        ...sx
      }}
      {...props}
    >
      <CardContent sx={{ p: spacing.card, '&:last-child': { pb: spacing.card } }}>
        {children}
      </CardContent>
    </Card>
  );
};

export const ResponsiveStack = ({ 
  children, 
  direction = { xs: 'column', md: 'row' },
  spacing = null,
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  sx = {},
  ...props 
}) => {
  const responsiveSpacing = useResponsiveSpacing();
  const stackSpacing = spacing || responsiveSpacing.element;
  
  return (
    <Stack
      direction={direction}
      spacing={stackSpacing}
      alignItems={alignItems}
      justifyContent={justifyContent}
      sx={{
        width: '100%',
        ...sx
      }}
      {...props}
    >
      {children}
    </Stack>
  );
};

// ==================== RESPONSIVE TYPOGRAPHY ====================

export const ResponsiveTitle = ({ 
  children, 
  variant = { xs: 'h5', md: 'h4' },
  sx = {},
  ...props 
}) => {
  return (
    <Typography
      variant="h4"
      sx={{
        fontSize: {
          xs: '1.5rem',   // h5 equivalent
          sm: '1.75rem',  // h4 equivalent
          md: '2rem',     // h4 equivalent
          lg: '2.125rem', // h3 equivalent
        },
        fontWeight: 600,
        lineHeight: 1.2,
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export const ResponsiveSubtitle = ({ 
  children, 
  sx = {},
  ...props 
}) => {
  return (
    <Typography
      variant="subtitle1"
      sx={{
        fontSize: {
          xs: '0.875rem',  // body2 equivalent
          sm: '1rem',      // body1 equivalent
          md: '1.125rem',  // subtitle1 equivalent
        },
        lineHeight: 1.5,
        color: 'text.secondary',
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export const ResponsiveBody = ({ 
  children, 
  variant = 'body1',
  sx = {},
  ...props 
}) => {
  return (
    <Typography
      variant={variant}
      sx={{
        fontSize: {
          xs: '0.875rem',  // Smaller on mobile
          sm: '1rem',      // Standard on tablet+
        },
        lineHeight: 1.6,
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

// ==================== RESPONSIVE SECTIONS ====================

export const ResponsiveSection = ({ 
  children, 
  title,
  subtitle,
  divider = false,
  sx = {},
  ...props 
}) => {
  const spacing = useResponsiveSpacing();
  
  return (
    <Box
      sx={{
        mb: spacing.section,
        ...sx
      }}
      {...props}
    >
      {title && (
        <Box sx={{ mb: spacing.element }}>
          <ResponsiveTitle>{title}</ResponsiveTitle>
          {subtitle && (
            <ResponsiveSubtitle sx={{ mt: 0.5 }}>
              {subtitle}
            </ResponsiveSubtitle>
          )}
        </Box>
      )}
      
      {children}
      
      {divider && <Divider sx={{ mt: spacing.section }} />}
    </Box>
  );
};

export const ResponsiveDashboardLayout = ({ 
  header,
  sidebar,
  content,
  footer,
  sidebarWidth = { xs: '100%', md: '280px' },
  sx = {},
}) => {
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...sx }}>
        {header}
        {sidebar}
        <Box sx={{ flex: 1, p: 2 }}>
          {content}
        </Box>
        {footer}
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', ...sx }}>
      <Box sx={{ width: sidebarWidth, flexShrink: 0 }}>
        {sidebar}
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {header}
        <Box sx={{ flex: 1, p: 3 }}>
          {content}
        </Box>
        {footer}
      </Box>
    </Box>
  );
};

// ==================== RESPONSIVE UTILITIES ====================

export const ResponsiveHidden = ({ 
  children, 
  breakpoint = 'md',
  direction = 'down', // 'up' or 'down'
}) => {
  const theme = useTheme();
  const shouldHide = useMediaQuery(
    direction === 'down' 
      ? theme.breakpoints.down(breakpoint)
      : theme.breakpoints.up(breakpoint)
  );
  
  if (shouldHide) return null;
  return children;
};

export const ResponsiveShow = ({