/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F14A52',
          hover: 'rgba(241, 74, 82, 0.05)',
          outline: 'rgba(241, 74, 82, 0.2)',
          disabled: 'rgba(241, 74, 82, 0.4)',
          accent: 'rgba(241, 74, 82, 0.1)',
        },
      },
      fontFamily: {
        'modern': ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', "Noto Sans", 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#F14A52',
            fontWeight: '600',
            letterSpacing: '-0.025em',
          }
        }
      },
      borderWidth: {
        '1': '1px',
      },
      boxShadow: {
        'modern-primary': '0 4px 6px rgba(241, 74, 82, 0.1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography')
  ],
};
