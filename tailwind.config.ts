import type { Config } from 'tailwindcss';

export default {
  content: ['./entrypoints/**/*.{html,ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#fafafa',
          surface: '#ffffff',
          muted: '#f7f7f7',
          border: '#e5e5e5',
          'border-strong': '#d4d4d4',
          ink: '#171717',
          text: '#525252',
          subtle: '#737373',
        },
      },
      borderRadius: {
        app: '0.5rem',
        control: '0.375rem',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        overlay: '0 12px 28px rgb(0 0 0 / 0.14)',
      },
    },
  },
  plugins: [],
} satisfies Config;
