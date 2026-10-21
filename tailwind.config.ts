import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "#F8FAFC",
          background: "#F8FAFC",
          foreground: "#334155",
          border: "#E5E7EB",
          accent: "#EFF6FF",
          "accent-foreground": "#2563EB",
          primary: "#2563EB",
          "primary-foreground": "#FFFFFF",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          light: "hsl(var(--navy-light))",
        },
        "super-dream": {
          DEFAULT: "#7c3aed",
          hsl: "hsl(var(--super-dream))",
        },
        dream: {
          DEFAULT: "#2563eb",
          hsl: "hsl(var(--dream))",
        },
        standard: {
          DEFAULT: "#16a34a",
          hsl: "hsl(var(--standard))",
        },
        regular: {
          DEFAULT: "#d97706",
          hsl: "hsl(var(--regular))",
        },
        expert: {
          DEFAULT: "hsl(var(--expert))",
        },
        advanced: {
          DEFAULT: "hsl(var(--advanced))",
        },
        pro: {
          DEFAULT: "hsl(var(--pro))",
        },
        beginner: {
          DEFAULT: "hsl(var(--beginner))",
        },
        bloom: {
          CU: "#3b82f6",
          AP: "#22c55e",
          AS: "#eab308",
          EV: "#ef4444",
          CR: "#a855f7",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        glow: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 10px rgba(37, 99, 235, 0.6), 0 0 20px rgba(37, 99, 235, 0.3)",
          },
          "50%": {
            opacity: "0.75",
            boxShadow: "0 0 4px rgba(37, 99, 235, 0.3), 0 0 8px rgba(37, 99, 235, 0.15)",
          },
        },
      },
      animation: {
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
