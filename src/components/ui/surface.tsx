import type { HTMLAttributes } from 'react';

import { classes } from './classnames';

export function Surface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classes(
        'grid gap-3 rounded-control border border-app-border bg-app-surface p-3 shadow-none',
        className,
      )}
      {...props}
    />
  );
}
