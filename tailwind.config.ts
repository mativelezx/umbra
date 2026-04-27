import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        umbra: {
          void: '#050510',
          abyss: '#08081A',
          fog: '#0C091A',
          deep: '#0E0E2A',
          shadow: '#16163A',
          mist: '#1E1E4A',
          surface: '#28285A',
          elevated: '#32326A',
        },
        violet: {
          50: '#F5ECFF',
          100: '#E8D5FF',
          200: '#D4B3FF',
          300: '#CEA7FF',
          400: '#B466FF',
          500: '#9B3FEB',
          600: '#7B2FCC',
          700: '#5A1FA6',
          800: '#3D1575',
          900: '#1E0A3A',
        },
        accent: {
          indigo: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        text: {
          1: '#F0ECFF',
          2: '#A8A0C8',
          3: '#8A82AE',
          4: '#7D75A3',
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 0 60px rgba(180, 102, 255, 0.08)',
      },
      backgroundImage: {
        'violet-glow':
          'linear-gradient(135deg, rgba(180,102,255,0.06), rgba(99,102,241,0.03))',
      },
    },
  },
  plugins: [],
};

export default config;
