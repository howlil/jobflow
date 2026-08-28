import { browser } from 'wxt/browser';

import type { ProfileRepository } from '../../application/profile/profile-repository';
import { parseStoredProfile } from '../../domain/profile/migrations';
import type { StoredProfileEnvelope } from '../../domain/profile/profile-schema';

export const PROFILE_STORAGE_KEY = 'jobflow.profile';
const LEGACY_PROFILE_STORAGE_KEY = 'fillio.profile';

export class ChromeProfileRepository implements ProfileRepository {
  async load(): Promise<StoredProfileEnvelope | null> {
    const stored = await browser.storage.local.get([
      PROFILE_STORAGE_KEY,
      LEGACY_PROFILE_STORAGE_KEY,
    ]);
    const rawProfile =
      stored[PROFILE_STORAGE_KEY] ?? stored[LEGACY_PROFILE_STORAGE_KEY];

    if (rawProfile === undefined) {
      return null;
    }

    const profile = parseStoredProfile(rawProfile);
    if (stored[PROFILE_STORAGE_KEY] === undefined) {
      await this.save(profile);
    }
    return profile;
  }

  async save(profile: StoredProfileEnvelope): Promise<void> {
    const validatedProfile = parseStoredProfile(profile);

    await browser.storage.local.set({
      [PROFILE_STORAGE_KEY]: validatedProfile,
    });
  }
}
