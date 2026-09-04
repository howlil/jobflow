import { browser } from 'wxt/browser';

import {
  parseThemePreference,
  type ThemePreference,
} from '../../domain/theme/theme';

export const THEME_STORAGE_KEY = 'jobflow.theme';

export class ChromeThemeRepository {
  async load(): Promise<ThemePreference> {
    const stored = await browser.storage.local.get(THEME_STORAGE_KEY);
    return parseThemePreference(stored[THEME_STORAGE_KEY]);
  }

  async save(preference: ThemePreference): Promise<void> {
    await browser.storage.local.set({
      [THEME_STORAGE_KEY]: parseThemePreference(preference),
    });
  }
}
