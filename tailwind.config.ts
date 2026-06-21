import type { Config } from "tailwindcss";

/**
 * Gate — Design System « Éditorial Archive »
 *
 * Registre d'état civil ancien revisité :
 *  - Fond crème (papier) / encre profonde
 *  - Serif déclaré pour les titres (Fraunces), grotesque pour le corps (Inter)
 *  - Accent unique : bordeaux d'encre (sceau)
 *  - Filets fins, numéros de section, grain papier
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
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

        /* ── Palette « Daylight » — light premium ──────────
           Noms historiques (paper/ink/seal) conservés mais remappés en CLAIR :
           - paper  = blancs / gris très clairs (fonds)
           - ink    = texte sombre / bordures
           - seal   = accent magenta (signature)
           - saffron / indigo = pôles du dégradé signature (touche indo, ~10%) */
        paper: {
          DEFAULT: "#FFFFFF", // blanc pur (fond principal)
          warm:    "#F7F8FA", // gris très clair (sections alternées)
          deep:    "#EEF1F5", // zones appuyées
        },
        ink: {
          DEFAULT: "#0E1320", // presque noir bleuté (texte principal)
          soft:    "#3F4654", // texte secondaire
          faint:   "#7A828F", // méta / légendes
          line:    "#E6E9EF", // filets / bordures (subtil sur clair)
        },
        /* Accents = vraies couleurs de Pondichéry :
           le JAUNE OCRE des murs coloniaux (signature), le BLEU des portes/mer,
           le TERRACOTTA. Light premium = blanc dominant, ces teintes en ~10%. */
        // Accent signature : jaune ocre « Pondichéry »
        seal: {
          DEFAULT: "#E8A33D",   // ocre safran (murs de la ville)
          bright:  "#F4B65A",
          tint:    "rgba(232,163,61,0.12)",
        },
        // Safran chaud (dégradé / chaleur)
        saffron: {
          DEFAULT: "#E8A33D",
          bright:  "#F4B65A",
          deep:    "#B9781E",
          tint:    "rgba(232,163,61,0.12)",
        },
        // Bleu Pondichéry (portes, mer, héritage français)
        indigo: {
          DEFAULT: "#2B6CB0",
          bright:  "#3B82C4",
          deep:    "#1E4E8C",
          tint:    "rgba(43,108,176,0.10)",
        },
        // Terracotta (toits, accents chauds)
        patina: {
          DEFAULT: "#C2563B",
          tint:    "rgba(194,86,59,0.10)",
        },
      },
      fontFamily: {
        // Corps : grotesque neutre et lisible
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        // Titres : serif déclaré, caractère éditorial
        serif:   ["var(--font-fraunces)", "Georgia", "serif"],
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        // Méta / labels / chiffres : mono d'archive
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Ombres papier — douces, chaudes, jamais bleutées
        paper:       "0 1px 2px rgba(26,23,20,0.04), 0 1px 1px rgba(26,23,20,0.03)",
        "paper-md":  "0 6px 24px -8px rgba(26,23,20,0.12), 0 2px 6px rgba(26,23,20,0.05)",
        "paper-lg":  "0 18px 50px -16px rgba(26,23,20,0.18), 0 6px 16px rgba(26,23,20,0.06)",
        seal:        "0 4px 18px -4px rgba(122,46,46,0.35)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-scale": {
          "0%":   { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(110%)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "draw": {
          to: { strokeDashoffset: "0" },
        },
        "seal-in": {
          "0%":   { opacity: "0", transform: "scale(1.4) rotate(-8deg)" },
          "60%":  { opacity: "1" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.24s ease-out",
        "accordion-up":    "accordion-up 0.24s ease-out",
        "fade-in":         "fade-in 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-scale":   "fade-in-scale 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up":        "slide-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right":  "slide-in-right 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "float":           "float 5s ease-in-out infinite",
        "spin-slow":       "spin-slow 14s linear infinite",
        "seal-in":         "seal-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        "gradient-pan":    "gradient-pan 14s ease infinite",
        "shimmer":         "shimmer 2.4s linear infinite",
      },
      backgroundImage: {
        // Grain papier discret (overlay)
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        // Dégradé signature indo-français (safran → bordeaux → indigo)
        "gradient-indo": "linear-gradient(120deg, #D98324 0%, #7A2E2E 50%, #2E4A6B 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
