import type { ReactNode } from 'react';

type WorkspaceFrameProps = {
  navigation: ReactNode;
  children: ReactNode;
  meta?: ReactNode;
};

export function WorkspaceFrame({
  navigation,
  children,
  meta = 'Stored locally in this browser',
}: WorkspaceFrameProps) {
  return (
    <div className="min-h-screen bg-app-bg text-app-ink">
      <header className="sticky top-0 z-30 border-b border-app-border bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[52px] w-full max-w-[144rem] items-center justify-between gap-5 px-[clamp(14px,1.1vw,24px)] max-[900px]:px-4">
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight">
            <span
              className="grid h-[26px] w-[26px] place-items-center rounded-md bg-app-ink text-xs font-bold text-white"
              aria-hidden="true"
            >
              F
            </span>
            <span>Fillio</span>
          </div>
          <span className="text-[11px] text-app-subtle">{meta}</span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[144rem] grid-cols-[224px_minmax(0,1fr)] items-start gap-6 px-[clamp(14px,1.1vw,24px)] max-[900px]:grid-cols-[190px_minmax(0,1fr)] max-[900px]:gap-[18px] max-[900px]:px-4 max-[720px]:block">
        {navigation}
        <div className="min-w-0 w-full max-w-[1180px]">{children}</div>
      </div>
    </div>
  );
}
