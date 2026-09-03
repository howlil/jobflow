import { useEffect, useState, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

type WorkspaceFrameProps = {
  navigation: ReactNode;
  children: ReactNode;
  title: string;
  eyebrow?: string;
  meta?: ReactNode;
};

const SIDEBAR_COLLAPSED_WIDTH = 56;
const SIDEBAR_EXPANDED_WIDTH = 240;
const DESKTOP_QUERY = '(min-width: 768px)';

function useDesktopLayout(): boolean {
  const [desktop, setDesktop] = useState(() => {
    if (typeof window === 'undefined' || window.matchMedia === undefined) {
      return true;
    }
    return window.matchMedia(DESKTOP_QUERY).matches;
  });

  useEffect(() => {
    if (window.matchMedia === undefined) return undefined;
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return desktop;
}

export function WorkspaceFrame({
  navigation,
  children,
  title,
  eyebrow = 'Career workspace',
  meta = 'Stored locally',
}: WorkspaceFrameProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const desktop = useDesktopLayout();
  const reduceMotion = useReducedMotion();

  const sidebarTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 520, damping: 42, mass: 0.72 };

  return (
    <div className="min-h-screen bg-app-bg text-app-ink md:grid md:grid-cols-[56px_minmax(0,1fr)]">
      {desktop ? (
        <aside
          className="group/sidebar relative z-40 h-screen w-14 overflow-visible border-r border-app-border bg-app-surface md:sticky md:top-0"
          aria-label="Job Flow sidebar"
          data-expanded={sidebarExpanded}
        >
          <motion.div
            className="absolute inset-y-0 left-0 overflow-hidden border-r border-app-border bg-app-surface"
            animate={{
              width: sidebarExpanded
                ? SIDEBAR_EXPANDED_WIDTH
                : SIDEBAR_COLLAPSED_WIDTH,
            }}
            initial={false}
            transition={sidebarTransition}
          >
            <div className="flex h-14 w-60 items-center gap-2 border-b border-app-border px-2.5">
              {sidebarExpanded ? (
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-app-ink text-sm font-bold text-app-surface"
                  aria-hidden="true"
                >
                  J
                </span>
              ) : (
                <button
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-transparent bg-transparent text-app-text transition-colors hover:border-app-border hover:text-app-ink focus-visible:border-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                  type="button"
                  aria-label="Expand sidebar"
                  aria-expanded={false}
                  onClick={() => setSidebarExpanded(true)}
                >
                  <PanelLeftOpen
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.8}
                  />
                </button>
              )}

              <AnimatePresence initial={false}>
                {sidebarExpanded ? (
                  <motion.div
                    className="min-w-0 flex-1"
                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      reduceMotion ? { opacity: 0 } : { opacity: 0, x: -4 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.14, ease: 'easeOut' }
                    }
                  >
                    <p className="m-0 truncate text-sm font-semibold tracking-tight text-app-ink">
                      Job Flow
                    </p>
                    <p className="m-0 text-[13px] font-medium text-app-subtle">
                      Career workspace
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {sidebarExpanded ? (
                <button
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-transparent bg-transparent text-app-text transition-colors hover:border-app-border hover:text-app-ink focus-visible:border-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft"
                  type="button"
                  aria-label="Collapse sidebar"
                  aria-expanded={true}
                  onClick={() => setSidebarExpanded(false)}
                >
                  <PanelLeftClose
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.8}
                  />
                </button>
              ) : null}
            </div>

            <div className="h-[calc(100vh-3.5rem)] w-60 overflow-y-auto px-2 py-2.5">
              {navigation}
            </div>
          </motion.div>
        </aside>
      ) : (
        <aside
          className="border-b border-app-border bg-app-surface px-4 py-3"
          aria-label="Job Flow sidebar"
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-app-ink text-sm font-bold text-app-surface"
              aria-hidden="true"
            >
              J
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-semibold tracking-tight text-app-ink">
                Job Flow
              </p>
              <p className="m-0 text-[13px] font-medium text-app-subtle">
                Career workspace
              </p>
            </div>
          </div>
          {navigation}
        </aside>
      )}

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
