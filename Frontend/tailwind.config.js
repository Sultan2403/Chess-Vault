/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        vault: {
          surface: withOpacity("--color-vault-surface"),
          "surface-dim": withOpacity("--color-vault-surface-dim"),
          "surface-bright": withOpacity("--color-vault-surface-bright"),
          "surface-container-lowest": withOpacity("--color-vault-surface-container-lowest"),
          "surface-container-low": withOpacity("--color-vault-surface-container-low"),
          "surface-container": withOpacity("--color-vault-surface-container"),
          "surface-container-high": withOpacity("--color-vault-surface-container-high"),
          "surface-container-highest": withOpacity("--color-vault-surface-container-highest"),
          "surface-variant": withOpacity("--color-vault-surface-variant"),
          "surface-soft": withOpacity("--color-vault-surface-soft"),

          "on-surface": withOpacity("--color-vault-on-surface"),
          "on-surface-variant": withOpacity("--color-vault-on-surface-variant"),
          "inverse-surface": withOpacity("--color-vault-inverse-surface"),
          "inverse-on-surface": withOpacity("--color-vault-inverse-on-surface"),
          outline: withOpacity("--color-vault-outline"),
          "outline-variant": withOpacity("--color-vault-outline-variant"),

          "surface-tint": withOpacity("--color-vault-surface-tint"),
          primary: withOpacity("--color-vault-primary"),
          "on-primary": withOpacity("--color-vault-on-primary"),
          "primary-container": withOpacity("--color-vault-primary-container"),
          "on-primary-container": withOpacity("--color-vault-on-primary-container"),
          "inverse-primary": withOpacity("--color-vault-inverse-primary"),

          secondary: withOpacity("--color-vault-secondary"),
          "on-secondary": withOpacity("--color-vault-on-secondary"),
          "secondary-container": withOpacity("--color-vault-secondary-container"),
          "on-secondary-container": withOpacity("--color-vault-on-secondary-container"),

          tertiary: withOpacity("--color-vault-tertiary"),
          "on-tertiary": withOpacity("--color-vault-on-tertiary"),
          "tertiary-container": withOpacity("--color-vault-tertiary-container"),
          "on-tertiary-container": withOpacity("--color-vault-on-tertiary-container"),

          error: withOpacity("--color-vault-error"),
          "on-error": withOpacity("--color-vault-on-error"),
          "error-container": withOpacity("--color-vault-error-container"),
          "on-error-container": withOpacity("--color-vault-on-error-container"),

          "primary-fixed": withOpacity("--color-vault-primary-fixed"),
          "primary-fixed-dim": withOpacity("--color-vault-primary-fixed-dim"),
          "on-primary-fixed": withOpacity("--color-vault-on-primary-fixed"),
          "on-primary-fixed-variant": withOpacity("--color-vault-on-primary-fixed-variant"),

          "secondary-fixed": withOpacity("--color-vault-secondary-fixed"),
          "secondary-fixed-dim": withOpacity("--color-vault-secondary-fixed-dim"),
          "on-secondary-fixed": withOpacity("--color-vault-on-secondary-fixed"),
          "on-secondary-fixed-variant": withOpacity("--color-vault-on-secondary-fixed-variant"),

          "tertiary-fixed": withOpacity("--color-vault-tertiary-fixed"),
          "tertiary-fixed-dim": withOpacity("--color-vault-tertiary-fixed-dim"),
          "on-tertiary-fixed": withOpacity("--color-vault-on-tertiary-fixed"),
          "on-tertiary-fixed-variant": withOpacity("--color-vault-on-tertiary-fixed-variant"),

          background: withOpacity("--color-vault-background"),
          "on-background": withOpacity("--color-vault-on-background"),

          // Archival / Semantic accents & states
          bronze: withOpacity("--color-vault-bronze"),
          "bronze-hover": withOpacity("--color-vault-bronze-hover"),
          "archival-bronze": withOpacity("--color-vault-archival-bronze"),
          "archival-bronze-hover": withOpacity("--color-vault-archival-bronze-hover"),
          ochre: withOpacity("--color-vault-ochre"),
          "ochre-hover": withOpacity("--color-vault-ochre-hover"),
          win: withOpacity("--color-vault-win"),
          loss: withOpacity("--color-vault-loss"),
          draw: withOpacity("--color-vault-draw"),

          // Surfaces & Dividers
          "canvas-base": withOpacity("--color-vault-canvas-base"),
          "surface-layer-1": withOpacity("--color-vault-surface-layer-1"),
          "surface-layer-2": withOpacity("--color-vault-surface-layer-2"),
          "border-base": withOpacity("--color-vault-border-base"),
          "border-interactive": withOpacity("--color-vault-border-interactive"),
          line: withOpacity("--color-vault-line"),

          // Typography Tones
          "text-primary": withOpacity("--color-vault-text-primary"),
          "text-secondary": withOpacity("--color-vault-text-secondary"),
          "text-muted": withOpacity("--color-vault-text-muted"),

          // Chessboard tokens
          "board-dark": withOpacity("--color-vault-board-dark"),
          "board-light": withOpacity("--color-vault-board-light"),
        },
      },
      fontFamily: {
        display: ["Newsreader", "Georgia", "serif"],
        body: ['"Hanken Grotesk"', "sans-serif"],
        sans: ['"Hanken Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        notation: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "400" }],
        "display-lg-mobile": ["34px", { lineHeight: "42px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "display-md": ["36px", { lineHeight: "44px", letterSpacing: "-0.015em", fontWeight: "400" }],
        "display-md-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "headline-lg": ["26px", { lineHeight: "34px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "headline-md": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "headline-sm": ["16px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "26px", letterSpacing: "0em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "22px", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", letterSpacing: "0.005em", fontWeight: "400" }],
        "notation-md": ["14px", { lineHeight: "22px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "notation-sm": ["12px", { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "400" }],
        "label-caps": ["11px", { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        vault: "0.25rem",
      },
      spacing: {
        gutter: "1.5rem",
        margin: "2.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.75rem",
        "space-xl": "3rem",
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};
