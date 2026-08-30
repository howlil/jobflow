import type { HTMLAttributes } from 'react';

import { classes } from './classnames';

export function Surface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classes(
        'grid gap-3 rounded-app border border-app-border bg-app-surface-glass p-3 shadow-section backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}
