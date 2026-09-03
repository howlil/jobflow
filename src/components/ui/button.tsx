import type { ButtonHTMLAttributes } from 'react';

import { classes } from './classnames';

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  default:
    'border-app-border bg-transparent text-app-ink hover:border-app-border-strong',
  primary:
    'border-app-ink bg-app-ink text-app-surface hover:border-app-accent-strong hover:bg-app-accent-strong',
  ghost:
    'border-transparent bg-transparent text-app-text hover:border-app-border hover:text-app-ink',
  danger:
    'border-app-danger bg-app-danger text-white hover:brightness-95 focus-visible:border-app-danger',
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
        'inline-flex h-9 min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-control border px-3 text-sm font-medium transition-colors focus-visible:border-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft active:translate-y-px disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50',
        BUTTON_VARIANT_CLASS[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
