import type { Config } from 'tailwindcss';

export default {
  content: ['./entrypoints/**/*.{html,ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#fafafa',
          surface: '#ffffff',
          'surface-glass': 'rgb(255 255 255 / 0.82)',
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
        overlay: '0 10px 24px rgb(0 0 0 / 0.13)',
        topbar: '0 1px 12px rgb(23 23 23 / 0.045)',
        section:
          '0 1px 0 rgb(255 255 255 / 0.72) inset, 0 6px 18px rgb(23 23 23 / 0.035)',
        record:
          '0 1px 0 rgb(255 255 255 / 0.78) inset, 0 4px 14px rgb(23 23 23 / 0.04)',
        popover: '0 12px 28px rgb(23 23 23 / 0.11)',
      },
    },
  },
  plugins: [],
} satisfies Config;
