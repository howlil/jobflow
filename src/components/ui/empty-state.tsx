import type { HTMLAttributes } from 'react';

import { classes } from './classnames';

export function EmptyState({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classes(
        'flex min-h-10 items-center justify-between gap-3 border-y border-app-border py-2 text-xs text-app-text',
        className,
      )}
      {...props}
    />
  );
}
