import { describe, expect, it } from 'vitest';

import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import {
  createProfileBackup,
  parseProfileBackup,
  serializeProfileBackup,
} from './profile-backup';

describe('profile backup', () => {
  it('round-trips a validated profile through the versioned backup format', () => {
    const profile = createEmptyStoredProfile();
    profile.baseProfile.personal.legalName.first = 'Ulil';

    const backup = createProfileBackup(profile, '2026-08-25T00:00:00.000Z');
    const parsed = parseProfileBackup(serializeProfileBackup(backup));

    expect(parsed.format).toBe('fillio-profile-backup');
    expect(parsed.formatVersion).toBe(1);
    expect(parsed.profile.baseProfile.personal.legalName.first).toBe('Ulil');
  });

  it('rejects unrecognized backup formats', () => {
    expect(() =>
      parseProfileBackup(JSON.stringify({ format: 'other', formatVersion: 1 })),
    ).toThrow();
  });
});
