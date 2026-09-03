import type { HTMLAttributes, ReactNode } from 'react';

import { classes } from './classnames';

export function RecordCard({
  action,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { action?: ReactNode }) {
  return (
    <article
      className={classes(
        'relative grid gap-3 rounded-control border border-app-border bg-app-surface p-3 shadow-none',
        className,
      )}
      {...props}
    >
      {action ? <div className="absolute right-3 top-3">{action}</div> : null}
      {children}
    </article>
  );
}

export function RecordHeader({
  title,
  context,
  meta,
  className,
}: {
  title: ReactNode;
  context?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes(
        'grid min-w-0 gap-1 pr-9 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-3',
        className,
      )}
    >
      <div className="grid min-w-0 gap-1">
        <strong className="truncate text-sm font-semibold text-app-ink">
          {title}
        </strong>
        {context ? (
          <span className="truncate text-[13px] font-medium text-app-subtle">
            {context}
          </span>
        ) : null}
      </div>
      {meta ? (
        <span className="text-[13px] font-medium text-app-subtle sm:text-right">
          {meta}
        </span>
      ) : null}
    </div>
  );
}
