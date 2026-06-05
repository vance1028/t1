/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'tunnel-dark': '#0f1923',
        'tunnel-panel': '#1a2332',
        'tunnel-border': '#2a3a4a',
        accent: '#00d4ff',
        'accent-dim': '#0099cc',
        'alarm-1': '#f0b429',
        'alarm-2': '#ff6b35',
        'alarm-3': '#e53e3e',
        safe: '#38b2ac',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'alarm-pulse': 'alarm-pulse 1s infinite',
        'glow-accent': 'glow-accent 2s ease-in-out infinite',
      },
      keyframes: {
        'alarm-pulse': {
          '0%, 100%': { borderColor: '#e53e3e' },
          '50%': { borderColor: 'transparent' },
        },
        'glow-accent': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
