import type { HTMLAttributes } from 'react';

import { classes } from './classnames';

export function Chip({
  strong = false,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { strong?: boolean }) {
  return (
    <span
      className={classes(
        'inline-flex min-h-6 items-center gap-1 rounded-control border border-app-border bg-app-muted px-2 py-0.5 text-[11px] font-medium leading-5 text-app-text',
        strong &&
          'border-app-border-strong bg-app-surface-glass font-semibold text-app-ink backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}
