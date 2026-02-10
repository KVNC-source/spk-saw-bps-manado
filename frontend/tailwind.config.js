/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      /* ===============================
         TYPOGRAPHY
      =============================== */
      fontFamily: {
        jakarta: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },

      /* ===============================
         COLORS (BPS / GOV TOKENS)
      =============================== */
      colors: {
        gov: {
          blue: "#0f4c81",
        },
        text: {
          main: "#1f2937",
          muted: "#475569",
        },

        glass: {
          bg: "rgba(255,255,255,0.72)",
          border: "rgba(255,255,255,0.45)",
        },

        success: {
          bg: "rgba(34,197,94,0.15)",
          text: "#166534",
        },

        warning: {
          bg: "rgba(245,158,11,0.15)",
          text: "#92400e",
        },

        muted: {
          bg: "rgba(107,114,128,0.15)",
          text: "#374151",
        },
      },

      /* ===============================
         BACKGROUNDS
      =============================== */
      backgroundImage: {
        "app-gradient": "linear-gradient(180deg, #f4f7fb 0%, #e8eef6 100%)",
      },

      /* ===============================
         EFFECTS
      =============================== */
      boxShadow: {
        neo: "8px 8px 20px rgba(15,23,42,0.08), -8px -8px 20px rgba(255,255,255,0.9)",
      },

      backdropBlur: {
        glass: "14px",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
