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
          'inline-flex min-h-9 items-center gap-2 text-xs font-medium text-app-text',
          className,
        )}
      >
        <input
          ref={ref}
          className="h-[18px] w-[18px] shrink-0 rounded border-app-border-strong accent-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2"
          type="checkbox"
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  },
);
