/**
 * Design tokens — single source of truth for the visual system.
 * See mobile/DESIGN_BRIEF.md for usage rules. Components never hardcode hex.
 */

export const colors = {
  bg: {
    base: "#0A0A0F",
    raised: "#14141B",
    elevated: "#1C1C26",
    sunken: "#070709",
    scrim: "rgba(4,4,8,0.70)",
  },
  border: {
    hairline: "#23232E",
    strong: "#33333F",
    focus: "#FF6B2C",
  },
  text: {
    primary: "#F7F7FA",
    secondary: "#A8A8B8",
    tertiary: "#6E6E80",
    disabled: "#4A4A58",
    onBrand: "#1A0B02",
  },
  brand: {
    300: "#FFA266",
    400: "#FF8A4D",
    500: "#FF6B2C",
    600: "#E85A1F",
    700: "#C24A17",
    tint: "rgba(255,107,44,0.10)",
    glow: "rgba(255,107,44,0.35)",
  },
  accent: {
    400: "#818CF8",
    500: "#6366F1",
    tint: "rgba(99,102,241,0.12)",
  },
  team: {
    red: "#F4524D",
    redTint: "rgba(244,82,77,0.12)",
    redGlow: "rgba(244,82,77,0.40)",
    onyx: "#E8EAF2",
    onyxTint: "rgba(232,234,242,0.07)",
    onyxGlow: "rgba(232,234,242,0.35)",
  },
  success: "#34D399",
  successTint: "rgba(52,211,153,0.12)",
  warning: "#FBBF24",
  warningTint: "rgba(251,191,36,0.12)",
  error: "#F87171",
  errorTint: "rgba(248,113,113,0.12)",
  star: {
    gold: "#FFC53D",
    empty: "#3A3A46",
  },
} as const;

export const gradients = {
  brand: ["#FF6B2C", "#FF8A4D"] as const,
  carbon: ["#2A2D38", "#16161E"] as const,
};

export const fonts = {
  condensedBold: "BarlowCondensed_700Bold",
  condensedSemiBold: "BarlowCondensed_600SemiBold",
  regular: "Barlow_400Regular",
  medium: "Barlow_500Medium",
  semiBold: "Barlow_600SemiBold",
  bold: "Barlow_700Bold",
} as const;

/** Type scale. Display/stat/title styles use the condensed family. */
export const type = {
  displayXl: { fontFamily: fonts.condensedBold, fontSize: 40, lineHeight: 44, letterSpacing: 0.5 },
  display: { fontFamily: fonts.condensedBold, fontSize: 32, lineHeight: 36, letterSpacing: 0.5 },
  stat: { fontFamily: fonts.condensedBold, fontSize: 36, lineHeight: 40 },
  title1: { fontFamily: fonts.condensedBold, fontSize: 24, lineHeight: 30, letterSpacing: 0.25 },
  title2: { fontFamily: fonts.condensedSemiBold, fontSize: 20, lineHeight: 26, letterSpacing: 0.25 },
  headline: { fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.semiBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  /** Horizontal screen padding */
  gutter: 20,
} as const;

export const radius = {
  pill: 999,
  input: 12,
  card: 16,
  sheet: 24,
  thumb: 10,
} as const;
