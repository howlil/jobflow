import type { ReactNode } from 'react';

type WorkspaceFrameProps = {
  navigation: ReactNode;
  children: ReactNode;
  title: string;
  eyebrow?: string;
  meta?: ReactNode;
};

export function WorkspaceFrame({
  navigation,
  children,
  title,
  eyebrow = 'Career workspace',
  meta = 'Stored locally',
}: WorkspaceFrameProps) {
  return (
    <div className="min-h-screen bg-app-bg text-app-ink md:grid md:grid-cols-[56px_minmax(0,1fr)]">
      <aside
        className="group/sidebar relative z-40 border-b border-app-border bg-app-surface md:sticky md:top-0 md:h-screen md:w-14 md:overflow-visible md:border-b-0 md:border-r"
        aria-label="Job Flow sidebar"
      >
        <div className="bg-app-surface md:h-screen md:w-14 md:overflow-hidden md:border-r md:border-app-border md:transition-[width] md:duration-150 md:hover:w-60 md:focus-within:w-60">
          <div className="flex h-14 w-60 items-center gap-2 border-b border-app-border px-2.5">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-app-ink text-sm font-bold text-app-surface"
              aria-hidden="true"
            >
              J
            </span>
            <div className="min-w-0 opacity-100 transition-opacity md:opacity-0 md:group-hover/sidebar:opacity-100 md:group-focus-within/sidebar:opacity-100">
              <p className="m-0 truncate text-sm font-semibold tracking-tight text-app-ink">
                Job Flow
              </p>
              <p className="m-0 text-[13px] font-medium text-app-subtle">
                Career workspace
              </p>
            </div>
          </div>

          <div className="w-60 px-2 py-2.5 md:h-[calc(100vh-3.5rem)] md:overflow-y-auto">
            {navigation}
          </div>
        </div>
      </aside>

      <div className="min-w-0 bg-app-surface">
        <header className="sticky top-0 z-30 border-b border-app-border bg-app-surface">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4 sm:px-5">
            <div className="min-w-0 py-2">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
                {eyebrow}
              </p>
              <h1 className="m-0 truncate text-base font-semibold tracking-tight text-app-ink">
                {title}
              </h1>
            </div>
            {meta === null ? null : (
              <div className="shrink-0 text-[13px] font-medium text-app-subtle max-sm:hidden">
                {meta}
              </div>
            )}
          </div>
        </header>

        <main className="w-full bg-app-surface">{children}</main>
      </div>
    </div>
  );
}
