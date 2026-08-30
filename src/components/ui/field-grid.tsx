import type { HTMLAttributes } from 'react';

import { classes } from './classnames';

export function FieldGrid({
  columns = 2,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { columns?: 2 | 3 }) {
  return (
    <div
      className={classes(
        'grid grid-cols-1 gap-3',
        columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
        className,
      )}
      {...props}
    />
  );
}
