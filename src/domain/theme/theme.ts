export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export function parseThemePreference(value: unknown): ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference)
    ? (value as ThemePreference)
    : 'system';
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  return preference === 'system'
    ? systemPrefersDark
      ? 'dark'
      : 'light'
    : preference;
}
