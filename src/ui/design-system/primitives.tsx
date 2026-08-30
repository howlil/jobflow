import {
  forwardRef,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

function classes(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

const CONTROL_CLASS =
  'min-h-10 w-full rounded-control border border-app-border bg-white px-3 py-2 text-[13px] text-app-ink outline-none transition placeholder:text-app-subtle hover:border-app-border-strong focus:border-app-ink focus:ring-2 focus:ring-app-border disabled:cursor-not-allowed disabled:bg-app-muted disabled:text-app-subtle';

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  default:
    'border-app-border-strong bg-white text-app-ink hover:border-app-ink hover:bg-app-muted',
  primary:
    'border-app-ink bg-app-ink text-white hover:border-black hover:bg-black',
  ghost:
    'border-transparent bg-transparent text-app-text hover:bg-app-muted hover:text-app-ink',
  danger:
    'border-red-200 bg-red-50 text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white',
};

export function Button({
  variant = 'default',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={classes(
        'inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-control border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_VARIANT_CLASS[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export type IconButtonSize = 'xs' | 'sm' | 'md';
export type IconButtonTone = 'default' | 'danger';

const ICON_BUTTON_SIZE_CLASS: Record<IconButtonSize, string> = {
  xs: 'h-8 w-8',
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
};

const ICON_BUTTON_TONE_CLASS: Record<IconButtonTone, string> = {
  default:
    'border-app-border bg-white text-app-ink hover:border-app-border-strong hover:bg-app-muted',
  danger:
    'border-transparent bg-transparent text-app-subtle hover:border-red-200 hover:bg-red-50 hover:text-red-700',
};

export function IconButton({
  className,
  type = 'button',
  size = 'md',
  tone = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
  tone?: IconButtonTone;
}) {
  return (
    <button
      className={classes(
        'grid shrink-0 place-items-center rounded-control border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        ICON_BUTTON_SIZE_CLASS[size],
        ICON_BUTTON_TONE_CLASS[tone],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

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
        'grid min-w-0 content-start gap-2 text-xs font-semibold text-app-text',
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
          'min-h-28 resize-y leading-5',
          textareaClassName,
        )}
        {...props}
      />
    </FieldFrame>
  );
});

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
          'inline-flex min-h-10 items-center gap-2.5 text-xs font-medium text-app-text',
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

export function FieldGrid({
  columns = 2,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { columns?: 2 | 3 }) {
  return (
    <div
      className={classes(
        'grid grid-cols-1 gap-4',
        columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
        className,
      )}
      {...props}
    />
  );
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={classes(
        'grid gap-6 border-b border-app-border pb-8 last:border-b-0 last:pb-0',
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes(
        'flex items-start justify-between gap-4 max-sm:flex-col max-sm:items-stretch',
        className,
      )}
    >
      <div className="grid min-w-0 gap-2">
        {eyebrow ? (
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
            {eyebrow}
          </p>
        ) : null}
        <div className="grid gap-1.5">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-app-ink">
            {title}
          </h2>
          {description ? (
            <p className="m-0 max-w-3xl text-xs leading-5 text-app-text">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Subsection({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={classes(
        'grid gap-4 border-t border-app-border pt-6 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 max-sm:items-start">
        <h3 className="m-0 text-sm font-semibold text-app-ink">{title}</h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function RecordCard({
  action,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { action?: ReactNode }) {
  return (
    <article
      className={classes(
        'relative grid gap-4 rounded-app border border-app-border bg-white p-4 shadow-sm',
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
        'grid min-w-0 gap-1 pr-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-4',
        className,
      )}
    >
      <div className="grid min-w-0 gap-1">
        <strong className="truncate text-sm font-semibold text-app-ink">
          {title}
        </strong>
        {context ? (
          <span className="truncate text-[11px] font-medium text-app-subtle">
            {context}
          </span>
        ) : null}
      </div>
      {meta ? (
        <span className="text-[11px] font-medium text-app-subtle sm:text-right">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

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

export function Chip({
  strong = false,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { strong?: boolean }) {
  return (
    <span
      className={classes(
        'inline-flex min-h-6 items-center gap-1 rounded-control border border-app-border bg-app-muted px-2 py-0.5 text-[11px] font-medium leading-5 text-app-text',
        strong &&
          'border-app-border-strong bg-white font-semibold text-app-ink',
        className,
      )}
      {...props}
    />
  );
}

export function StatusMessage({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
}) {
  const toneClass = {
    neutral: 'border-app-border bg-app-muted text-app-text',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    danger: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }[tone];
  return (
    <p
      className={classes(
        'm-0 w-full rounded-control border px-3 py-2.5 text-xs leading-5',
        toneClass,
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classes(
        'flex min-h-12 items-center justify-between gap-4 border-y border-app-border py-3 text-xs text-app-text',
        className,
      )}
      {...props}
    />
  );
}

type FilePickerProps = {
  label: ReactNode;
  accept?: string;
  disabled?: boolean;
  onFile: (file: File) => void | Promise<void>;
  className?: string;
  inputLabel?: string;
};

export function FilePicker({
  label,
  accept,
  disabled = false,
  onFile,
  className,
  inputLabel = 'Choose file',
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
        style={{ clip: 'rect(0, 0, 0, 0)', margin: -1 }}
        type="file"
        accept={accept}
        aria-label={inputLabel}
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file !== undefined) void onFile(file);
          event.target.value = '';
        }}
      />
      <Button
        className={className}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
    </>
  );
}
