import { z } from 'zod';

import { parseStoredProfile } from '../../domain/profile/migrations';
import type { StoredProfileEnvelope } from '../../domain/profile/profile-schema';

const ProfileBackupSchema = z
  .object({
    format: z.literal('fillio-profile-backup'),
    formatVersion: z.literal(1),
    exportedAt: z.string(),
    profile: z.unknown(),
  })
  .strict();

export type ProfileBackup = {
  format: 'fillio-profile-backup';
  formatVersion: 1;
  exportedAt: string;
  profile: StoredProfileEnvelope;
};

export type ProfileBackupInspection =
  | { ok: true; backup: ProfileBackup }
  | {
      ok: false;
      reason:
        | 'invalid_json'
        | 'invalid_format'
        | 'unsupported_version'
        | 'invalid_envelope'
        | 'invalid_profile';
      message: string;
    };

export function createProfileBackup(
  profile: StoredProfileEnvelope,
  exportedAt = new Date().toISOString(),
): ProfileBackup {
  return {
    format: 'fillio-profile-backup',
    formatVersion: 1,
    exportedAt,
    profile: parseStoredProfile(profile),
  };
}

export function serializeProfileBackup(backup: ProfileBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function inspectProfileBackup(raw: string): ProfileBackupInspection {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      reason: 'invalid_json',
      message: 'This file is not valid JSON.',
    };
  }

  if (typeof parsedJson !== 'object' || parsedJson === null) {
    return {
      ok: false,
      reason: 'invalid_format',
      message: 'This file is not a Fillio profile backup.',
    };
  }

  const candidate = parsedJson as Record<string, unknown>;
  if (candidate.format !== 'fillio-profile-backup') {
    return {
      ok: false,
      reason: 'invalid_format',
      message: 'This file is not a Fillio profile backup.',
    };
  }
  if (candidate.formatVersion !== 1) {
    return {
      ok: false,
      reason: 'unsupported_version',
      message: 'This backup version is newer than this Fillio build supports.',
    };
  }

  const envelopeResult = ProfileBackupSchema.safeParse(parsedJson);
  if (!envelopeResult.success) {
    return {
      ok: false,
      reason: 'invalid_envelope',
      message: 'The Fillio backup metadata is incomplete or invalid.',
    };
  }

  try {
    return {
      ok: true,
      backup: {
        format: envelopeResult.data.format,
        formatVersion: envelopeResult.data.formatVersion,
        exportedAt: envelopeResult.data.exportedAt,
        profile: parseStoredProfile(envelopeResult.data.profile),
      },
    };
  } catch {
    return {
      ok: false,
      reason: 'invalid_profile',
      message: 'The backup envelope is valid, but its profile data is invalid.',
    };
  }
}

export function parseProfileBackup(raw: string): ProfileBackup {
  const inspection = inspectProfileBackup(raw);
  if (!inspection.ok) {
    throw new Error(inspection.message);
  }
  return inspection.backup;
}
