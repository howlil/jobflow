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

export function parseProfileBackup(raw: string): ProfileBackup {
  const parsedJson: unknown = JSON.parse(raw);
  const envelope = ProfileBackupSchema.parse(parsedJson);
  return {
    format: envelope.format,
    formatVersion: envelope.formatVersion,
    exportedAt: envelope.exportedAt,
    profile: parseStoredProfile(envelope.profile),
  };
}
