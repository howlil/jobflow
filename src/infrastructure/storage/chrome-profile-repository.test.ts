import { beforeEach, describe, expect, it } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import {
  ChromeProfileRepository,
  PROFILE_STORAGE_KEY,
} from './chrome-profile-repository';

describe('ChromeProfileRepository', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('returns null when storage is empty', async () => {
    const repository = new ChromeProfileRepository();

    await expect(repository.load()).resolves.toBeNull();
  });

  it('round-trips a schema-valid profile', async () => {
    const repository = new ChromeProfileRepository();
    const profile = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
    profile.baseProfile.personal.legalName.first = 'Ulil';

    await repository.save(profile);

    await expect(repository.load()).resolves.toEqual(profile);
  });

  it('migrates a legacy profile storage key on load', async () => {
    const repository = new ChromeProfileRepository();
    const profile = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
    profile.baseProfile.personal.legalName.first = 'Legacy';
    await browser.storage.local.set({ 'fillio.profile': profile });

    await expect(repository.load()).resolves.toEqual(profile);
    await expect(
      browser.storage.local.get(PROFILE_STORAGE_KEY),
    ).resolves.toEqual({
      [PROFILE_STORAGE_KEY]: profile,
    });
  });

  it('rejects a corrupted persisted payload', async () => {
    await browser.storage.local.set({
      [PROFILE_STORAGE_KEY]: {
        schemaVersion: 1,
        baseProfile: {},
        variants: [],
        preferences: {},
        metadata: {},
      },
    });

    const repository = new ChromeProfileRepository();

    await expect(repository.load()).rejects.toThrow();
  });
});
