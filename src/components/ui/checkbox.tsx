import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { classes } from './classnames';

type CheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className'
> & {
  label: ReactNode;
  className?: string;
};

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  function CheckboxField({ label, className, ...props }, ref) {
    return (
      <label
        className={classes(
          'inline-flex min-h-9 items-center gap-2 text-[13px] font-medium text-app-text',
          className,
        )}
      >
        <input
          ref={ref}
          className="h-[18px] w-[18px] shrink-0 rounded-control border-app-border-strong accent-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
          type="checkbox"
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  },
);
