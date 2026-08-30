import type { ButtonHTMLAttributes } from 'react';

import { classes } from './classnames';

export type IconButtonSize = 'xs' | 'sm' | 'md';
export type IconButtonTone = 'default' | 'danger';

const ICON_BUTTON_SIZE_CLASS: Record<IconButtonSize, string> = {
  xs: 'h-8 w-8',
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
};

const ICON_BUTTON_TONE_CLASS: Record<IconButtonTone, string> = {
  default:
    'border-app-border bg-app-surface-glass text-app-ink backdrop-blur-xl hover:border-app-border-strong hover:bg-white',
  danger:
    'border-transparent bg-transparent text-app-subtle hover:border-red-200 hover:bg-red-50 hover:text-red-700',
};

export function IconButton({
  className,
  type = 'button',
  size = 'md',
  tone = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
  tone?: IconButtonTone;
}) {
  return (
    <button
      className={classes(
        'grid shrink-0 place-items-center rounded-control border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        ICON_BUTTON_SIZE_CLASS[size],
        ICON_BUTTON_TONE_CLASS[tone],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
