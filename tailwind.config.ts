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
          void: '#F7F7F4',
          abyss: '#FFFFFF',
          fog: '#F0F0EB',
          deep: '#EAEAE4',
          shadow: '#E6E6E0',
          mist: '#DEDED8',
          surface: '#D2D2CB',
          elevated: '#C2C2BA',
        },
        // Legacy consumer names retained to keep this visual migration scoped.
        // These values are now graphite accents; new surfaces use text/surface roles.
        violet: {
          50: '#F7F7F4',
          100: '#333333',
          200: '#3A3A38',
          300: '#454543',
          400: '#4B4B47',
          500: '#555550',
          600: '#62625C',
          700: '#70706A',
          800: '#393936',
          900: '#242424',
        },
        accent: {
          indigo: '#46566C',
          cyan: '#28636A',
          emerald: '#34624D',
          amber: '#805720',
          rose: '#A13D3D',
        },
        text: {
          1: '#242424',
          2: '#53534F',
          3: '#62625C',
          4: '#696962',
        },
      },
      fontFamily: {
        display: ['var(--font-bricolage)', 'sans-serif'],
        heading: ['var(--font-bricolage)', 'sans-serif'],
        body: ['var(--font-bricolage)', 'sans-serif'],
        mono: ['var(--font-bricolage)', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.45' }],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '16px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 8px 24px rgba(36, 36, 36, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
