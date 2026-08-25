import { describe, expect, it } from 'vitest';

import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import {
  createProfileBackup,
  inspectProfileBackup,
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

  it('diagnoses malformed JSON without exposing parser internals', () => {
    expect(inspectProfileBackup('{not-json')).toEqual({
      ok: false,
      reason: 'invalid_json',
      message: 'This file is not valid JSON.',
    });
  });

  it('distinguishes unsupported backup versions from invalid profiles', () => {
    expect(
      inspectProfileBackup(
        JSON.stringify({
          format: 'fillio-profile-backup',
          formatVersion: 99,
          exportedAt: '2026-08-25T00:00:00.000Z',
          profile: {},
        }),
      ),
    ).toEqual({
      ok: false,
      reason: 'unsupported_version',
      message: 'This backup version is newer than this Fillio build supports.',
    });

    const invalidProfile = JSON.stringify({
      format: 'fillio-profile-backup',
      formatVersion: 1,
      exportedAt: '2026-08-25T00:00:00.000Z',
      profile: {},
    });
    expect(inspectProfileBackup(invalidProfile)).toEqual({
      ok: false,
      reason: 'invalid_profile',
      message: 'The backup envelope is valid, but its profile data is invalid.',
    });
  });

  it('returns the validated profile when recovery inspection succeeds', () => {
    const profile = createEmptyStoredProfile();
    const raw = serializeProfileBackup(
      createProfileBackup(profile, '2026-08-25T00:00:00.000Z'),
    );

    const result = inspectProfileBackup(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.backup.profile).toEqual(profile);
    }
  });
});
