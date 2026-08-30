import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

function classes(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

type HelpPopoverProps = {
  title: ReactNode;
  help?: ReactNode;
};

function helpLabel(title: ReactNode): string {
  return typeof title === 'string' ? `About ${title}` : 'About this section';
}

function fallbackHelp(title: ReactNode): ReactNode {
  return typeof title === 'string'
    ? `Manage ${title.toLowerCase()} information used by Job Flow.`
    : 'Learn what information belongs in this section.';
}

function HelpPopover({ title, help }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div
      className="relative inline-flex"
      ref={rootRef}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="grid h-6 w-6 place-items-center rounded-control border border-transparent text-[11px] font-bold text-app-subtle transition hover:border-app-border hover:bg-app-muted hover:text-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2"
        aria-label={helpLabel(title)}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        ?
      </button>
      {open ? (
        <div
          className="absolute left-0 top-8 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-app border border-app-border bg-white p-3 text-left shadow-lg"
          role="dialog"
          aria-label={helpLabel(title)}
        >
          <p className="m-0 text-xs font-normal leading-5 text-app-text">
            {help ?? fallbackHelp(title)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

type WorkspaceSectionProps = Omit<
  HTMLAttributes<HTMLDetailsElement>,
  'open'
> & {
  defaultOpen?: boolean;
};

export function WorkspaceSection({
  className,
  defaultOpen = true,
  ...props
}: WorkspaceSectionProps) {
  return (
    <details
      className={classes(
        'group rounded-app border border-app-border bg-white p-4',
        className,
      )}
      open={defaultOpen}
      {...props}
    />
  );
}

export function WorkspaceSectionHeader({
  title,
  description,
  help,
  eyebrow,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  help?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const helpContent = help ?? description;

  return (
    <summary
      className={classes(
        '-m-4 mb-0 flex cursor-pointer list-none items-start justify-between gap-4 rounded-app px-4 py-3 outline-none transition hover:bg-app-muted/70 focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-inset group-open:mb-4 group-open:rounded-b-none group-open:border-b group-open:border-app-border [&::-webkit-details-marker]:hidden',
        className,
      )}
    >
      <div className="grid min-w-0 gap-1.5">
        {eyebrow ? (
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="m-0 min-w-0 truncate text-lg font-semibold tracking-tight text-app-ink">
            {title}
          </h2>
          <HelpPopover title={title} help={helpContent} />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {action ? (
          <div onClick={(event) => event.stopPropagation()}>{action}</div>
        ) : null}
        <span
          className="grid h-6 w-6 place-items-center text-sm text-app-subtle transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          ⌄
        </span>
      </div>
    </summary>
  );
}

export function WorkspaceSubsection({
  title,
  help,
  action,
  children,
  className,
  defaultOpen = true,
}: {
  title: ReactNode;
  help?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={classes(
        'group rounded-app border border-app-border bg-white p-4',
        className,
      )}
      open={defaultOpen}
    >
      <summary className="-m-4 mb-0 flex cursor-pointer list-none items-center justify-between gap-4 rounded-app px-4 py-3 outline-none transition hover:bg-app-muted/70 focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-inset group-open:mb-4 group-open:rounded-b-none group-open:border-b group-open:border-app-border [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="m-0 min-w-0 truncate text-sm font-semibold text-app-ink">
            {title}
          </h3>
          <HelpPopover title={title} help={help} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {action ? (
            <div onClick={(event) => event.stopPropagation()}>{action}</div>
          ) : null}
          <span
            className="grid h-6 w-6 place-items-center text-sm text-app-subtle transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            ⌄
          </span>
        </div>
      </summary>
      {children}
    </details>
  );
}
