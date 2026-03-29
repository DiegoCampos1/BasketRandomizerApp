"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5",
      light: "#6366F1",
      dark: "#3730A3",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F97316",
      light: "#FB923C",
      dark: "#EA580C",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
    },
    error: {
      main: "#EF4444",
    },
    success: {
      main: "#10B981",
    },
    warning: {
      main: "#F59E0B",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: '"Barlow", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
      fontWeight: 700,
      letterSpacing: "0.01em",
    },
    h5: {
      fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    h6: {
      fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          transition: "all 200ms ease-out",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#6366F1",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
          },
        },
        containedSecondary: {
          "&:hover": {
            backgroundColor: "#FB923C",
            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          transition: "box-shadow 200ms ease-out, transform 200ms ease-out",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
