import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';

import { classes } from '../ui/classnames';

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
        className="grid h-9 w-9 place-items-center rounded-control border border-transparent bg-transparent text-app-subtle transition-colors hover:border-app-border hover:text-app-ink focus-visible:border-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
        aria-label={helpLabel(title)}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <CircleHelp aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-10 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-overlay border border-app-border bg-app-surface p-3 text-left shadow-overlay"
          role="dialog"
          aria-label={helpLabel(title)}
        >
          <p className="m-0 text-[13px] font-normal leading-5 text-app-text">
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
        'group border-b border-app-border bg-app-surface px-4 pb-4 sm:px-5 sm:pb-5',
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
        '-mx-4 mb-0 flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 border-b border-transparent px-4 py-2.5 outline-none transition-colors hover:bg-transparent focus-visible:ring-2 focus-visible:ring-app-accent-soft focus-visible:ring-inset group-open:mb-4 group-open:border-app-border sm:-mx-5 sm:px-5 sm:group-open:mb-5 [&::-webkit-details-marker]:hidden',
        className,
      )}
    >
      <div className="grid min-w-0 gap-1">
        {eyebrow ? (
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="m-0 min-w-0 truncate text-[15px] font-semibold tracking-tight text-app-ink">
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
          className="grid h-9 w-9 place-items-center text-app-subtle transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <ChevronDown size={16} strokeWidth={1.8} />
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
        'group border-t border-app-border bg-app-surface pt-4 first:border-t-0 first:pt-0',
        className,
      )}
      open={defaultOpen}
    >
      <summary className="mb-0 flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-app-accent-soft group-open:mb-3 [&::-webkit-details-marker]:hidden">
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
            className="grid h-9 w-9 place-items-center text-app-subtle transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            <ChevronDown size={16} strokeWidth={1.8} />
          </span>
        </div>
      </summary>
      {children}
    </details>
  );
}
