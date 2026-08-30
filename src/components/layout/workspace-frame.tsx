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
    <div className="min-h-screen bg-app-bg text-app-ink md:grid md:grid-cols-[208px_minmax(0,1fr)]">
      <aside
        className="border-b border-app-border bg-app-surface-glass shadow-section backdrop-blur-xl md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r"
        aria-label="Job Flow sidebar"
      >
        <div className="flex h-12 items-center gap-2 border-b border-app-border px-3">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-control bg-app-ink text-xs font-bold text-white"
            aria-hidden="true"
          >
            J
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-[13px] font-semibold tracking-tight text-app-ink">
              Job Flow
            </p>
            <p className="m-0 text-[10px] font-medium text-app-subtle">
              Career workspace
            </p>
          </div>
        </div>

        <div className="px-2.5 py-2.5 md:h-[calc(100vh-3rem)] md:overflow-y-auto md:py-3">
          {navigation}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-app-border bg-app-surface-glass shadow-topbar backdrop-blur-xl">
          <div className="flex min-h-12 items-center justify-between gap-3 px-4 sm:px-5 lg:px-6 2xl:px-8">
            <div className="min-w-0 py-1.5">
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
                {eyebrow}
              </p>
              <h1 className="m-0 truncate text-base font-semibold tracking-tight text-app-ink">
                {title}
              </h1>
            </div>
            {meta === null ? null : (
              <div className="shrink-0 text-[11px] font-medium text-app-subtle max-sm:hidden">
                {meta}
              </div>
            )}
          </div>
        </header>

        <main className="w-full px-4 py-4 sm:px-5 lg:px-6 lg:py-5 2xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
