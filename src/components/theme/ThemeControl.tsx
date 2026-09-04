import { useEffect, useState } from 'react';

import {
  parseThemePreference,
  resolveTheme,
  type ThemePreference,
} from '../../domain/theme/theme';
import { ChromeThemeRepository } from '../../infrastructure/storage/chrome-theme-repository';

const repository = new ChromeThemeRepository();
const DARK_QUERY = '(prefers-color-scheme: dark)';

function applyTheme(preference: ThemePreference): void {
  const systemDark =
    typeof window !== 'undefined' && window.matchMedia !== undefined
      ? window.matchMedia(DARK_QUERY).matches
      : false;
  const resolved = resolveTheme(preference, systemDark);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.theme = preference;
}

export function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    let active = true;
    void repository.load().then((stored) => {
      if (!active) return;
      setPreference(stored);
      applyTheme(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== 'system' || window.matchMedia === undefined) {
      return undefined;
    }

    const query = window.matchMedia(DARK_QUERY);
    const update = () => applyTheme('system');
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [preference]);

  return (
    <label className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-app-subtle">
      <span>Theme</span>
      <select
        className="h-8 rounded-control border border-app-border bg-app-surface px-2 text-[13px] text-app-ink outline-none transition-colors hover:border-app-border-strong focus:border-app-ink focus:ring-2 focus:ring-app-accent-soft"
        aria-label="Theme"
        value={preference}
        onChange={(event) => {
          const next = parseThemePreference(event.target.value);
          setPreference(next);
          void repository.save(next);
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
