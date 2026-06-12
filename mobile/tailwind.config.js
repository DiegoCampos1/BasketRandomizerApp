/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0A0A0F",
          raised: "#14141B",
          elevated: "#1C1C26",
          sunken: "#070709",
        },
        border: {
          hairline: "#23232E",
          strong: "#33333F",
        },
        ink: {
          DEFAULT: "#F7F7FA",
          secondary: "#A8A8B8",
          tertiary: "#6E6E80",
          disabled: "#4A4A58",
          onbrand: "#1A0B02",
        },
        brand: {
          300: "#FFA266",
          400: "#FF8A4D",
          500: "#FF6B2C",
          600: "#E85A1F",
          700: "#C24A17",
        },
        accent: {
          400: "#818CF8",
          500: "#6366F1",
        },
        team: {
          red: "#F4524D",
          onyx: "#E8EAF2",
        },
        success: "#34D399",
        warning: "#FBBF24",
        error: "#F87171",
        star: "#FFC53D",
      },
      fontFamily: {
        condensed: ["BarlowCondensed_700Bold"],
        "condensed-semi": ["BarlowCondensed_600SemiBold"],
        sans: ["Barlow_400Regular"],
        medium: ["Barlow_500Medium"],
        semibold: ["Barlow_600SemiBold"],
        bold: ["Barlow_700Bold"],
      },
      borderRadius: {
        input: "12px",
        card: "16px",
        sheet: "24px",
      },
    },
  },
  plugins: [],
};
