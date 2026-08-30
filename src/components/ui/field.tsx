import {
  forwardRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { classes } from './classnames';
import { CONTROL_CLASS } from './control-styles';

type FieldFrameProps = LabelHTMLAttributes<HTMLLabelElement> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function FieldFrame({
  label,
  hint,
  error,
  children,
  className,
  ...props
}: FieldFrameProps) {
  return (
    <label
      className={classes(
        'grid min-w-0 content-start gap-1.5 text-xs font-semibold text-app-text',
        className,
      )}
      {...props}
    >
      <span>{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] font-medium leading-4 text-red-700">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[11px] font-normal leading-4 text-app-subtle">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className'
> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  inputClassName?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, hint, error, className, inputClassName, ...props },
    ref,
  ) {
    return (
      <FieldFrame label={label} hint={hint} error={error} className={className}>
        <input
          ref={ref}
          className={classes(CONTROL_CLASS, inputClassName)}
          {...props}
        />
      </FieldFrame>
    );
  },
);

type TextareaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  textareaClassName?: string;
};

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  { label, hint, error, className, textareaClassName, ...props },
  ref,
) {
  return (
    <FieldFrame label={label} hint={hint} error={error} className={className}>
      <textarea
        ref={ref}
        className={classes(
          CONTROL_CLASS,
          'min-h-24 resize-y leading-5',
          textareaClassName,
        )}
        {...props}
      />
    </FieldFrame>
  );
});
