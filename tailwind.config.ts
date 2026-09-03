import type { Config } from 'tailwindcss';

const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./entrypoints/**/*.{html,ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: token('--app-bg'),
          surface: token('--app-surface'),
          raised: token('--app-surface-raised'),
          muted: token('--app-surface-muted'),
          border: token('--app-border'),
          'border-strong': token('--app-border-strong'),
          ink: token('--app-ink'),
          text: token('--app-muted'),
          subtle: token('--app-subtle'),
          accent: token('--app-accent'),
          'accent-strong': token('--app-accent-strong'),
          'accent-soft': token('--app-accent-soft'),
          danger: token('--app-danger'),
          'danger-soft': token('--app-danger-soft'),
          warning: token('--app-warning'),
          'warning-soft': token('--app-warning-soft'),
          info: token('--app-info'),
          'info-soft': token('--app-info-soft'),
          success: token('--app-success'),
          'success-soft': token('--app-success-soft'),
        },
      },
      borderRadius: {
        app: '0.375rem',
        control: '0.375rem',
        overlay: '0.5rem',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'IBM Plex Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        overlay: '0 12px 28px rgb(0 0 0 / 0.14)',
        popover: '0 12px 28px rgb(0 0 0 / 0.14)',
      },
    },
  },
  plugins: [],
} satisfies Config;
