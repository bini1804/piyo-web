import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFFDF5",
          100: "#FFF9E0",
          200: "#FFF1B8",
          300: "#FFE88A",
          400: "#F4CB4B",
          500: "#E5B830",
          600: "#C99A1A",
          700: "#A07712",
          800: "#7A5B0E",
          900: "#54400A",
        },
        piyo: {
          bg: "#FAFAF8",
          surface: "#FFFFFF",
          surfaceHover: "#F7F7F5",
          border: "#E8E6E1",
          borderLight: "#F0EEE9",
          text: "#1A1A18",
          textSecondary: "#6B6960",
          textTertiary: "#9C9A91",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Pretendard", "system-ui", "sans-serif"],
        /** Claude 스타일 워드마크용 세리프 (layout에서 --font-piyo-wordmark 주입) */
        piyoMark: [
          "var(--font-piyo-wordmark)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        cardHover: "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
        modal: "0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
