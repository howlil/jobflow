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
    <div className="min-h-screen bg-app-bg text-app-ink md:grid md:grid-cols-[224px_minmax(0,1fr)]">
      <aside
        className="border-b border-app-border bg-white md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r"
        aria-label="Job Flow sidebar"
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-app-border px-4">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-app-ink text-sm font-bold text-white"
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

        <div className="px-3 py-3 md:h-[calc(100vh-3.5rem)] md:overflow-y-auto md:py-4">
          {navigation}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-app-border bg-white/95 backdrop-blur-md">
          <div className="flex min-h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0 py-2">
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
                {eyebrow}
              </p>
              <h1 className="m-0 truncate text-base font-semibold tracking-tight text-app-ink sm:text-lg">
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

        <main className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
