/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // NOVAFALL:IRIS palette
        bg: '#101113',
        surface: '#16171B',
        panel: '#605A8C',
        primary: {
          DEFAULT: '#67E8F9',
          deep: '#33CFE6',
        },
        accent: {
          DEFAULT: '#605A8C',
          bright: '#8B82C4',
        },
        line: '#27272A',
        ink: '#FFFFFF',
        muted: '#A1A1AA',
      },
      fontFamily: {
        display: ['Rajdhani', 'Archivo', 'sans-serif'],
        sans: ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      borderRadius: {
        card: '8px',
        control: '8px',
      },
      transitionTimingFunction: {
        out2: 'cubic-bezier(0.23, 1, 0.32, 1)',
        inout2: 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 500ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
