import { describe, expect, it } from 'vitest';

import { parseThemePreference, resolveTheme } from './theme';

describe('theme preference', () => {
  it('falls back to system for unknown stored values', () => {
    expect(parseThemePreference('sepia')).toBe('system');
    expect(parseThemePreference(undefined)).toBe('system');
  });

  it('resolves explicit and system themes deterministically', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});
