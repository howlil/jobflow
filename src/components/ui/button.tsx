import type { ButtonHTMLAttributes } from 'react';

import { classes } from './classnames';

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  default:
    'border-app-border-strong bg-app-surface-glass text-app-ink backdrop-blur-xl hover:border-app-ink hover:bg-white',
  primary:
    'border-app-ink bg-app-ink text-white hover:border-black hover:bg-black',
  ghost:
    'border-transparent bg-transparent text-app-text hover:bg-app-muted hover:text-app-ink',
  danger:
    'border-red-200 bg-red-50 text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white',
};

export function Button({
  variant = 'default',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={classes(
        'inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-control border px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_VARIANT_CLASS[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
