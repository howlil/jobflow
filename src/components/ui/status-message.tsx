import type { HTMLAttributes } from 'react';

import { classes } from './classnames';

export function StatusMessage({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
}) {
  const toneClass = {
    neutral: 'border-app-border bg-app-muted text-app-text',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    danger: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }[tone];
  return (
    <p
      className={classes(
        'm-0 w-full rounded-control border px-3 py-2.5 text-xs leading-5',
        toneClass,
        className,
      )}
      {...props}
    />
  );
}
