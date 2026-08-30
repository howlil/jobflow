import type { HTMLAttributes } from 'react';

import { classes } from './classnames';

export function ActionRow({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classes('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}
