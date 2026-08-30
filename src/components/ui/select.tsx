import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';

import { classes } from './classnames';
import { CONTROL_CLASS } from './control-styles';
import { FieldFrame } from './field';

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'className'
> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  selectClassName?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    { label, hint, error, className, selectClassName, children, ...props },
    ref,
  ) {
    return (
      <FieldFrame label={label} hint={hint} error={error} className={className}>
        <select
          ref={ref}
          className={classes(CONTROL_CLASS, 'appearance-auto', selectClassName)}
          {...props}
        >
          {children}
        </select>
      </FieldFrame>
    );
  },
);
