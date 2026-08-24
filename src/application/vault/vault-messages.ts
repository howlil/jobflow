import { z } from 'zod';

import {
  SensitiveProfileSchema,
  type SensitiveProfile,
} from '../../domain/profile/profile-schema';
import type { VaultSessionStatus } from './vault-session';

const SensitiveFieldPathSchema = z.enum([
  'personal.gender',
  'personal.birthPlace',
  'personal.birthDate',
  'personal.nationality',
  'personal.maritalStatus',
  'identity.nationalId',
  'identity.passport',
  'identity.taxId',
  'compensation.current.amount',
  'compensation.current.currency',
  'compensation.current.payPeriod',
  'compensation.expected.amount',
  'compensation.expected.currency',
  'compensation.expected.payPeriod',
  'compensation.negotiable',
  'workEligibility.visaStatus',
  'workEligibility.sponsorshipRequired',
]);

export type SensitiveFieldPath = z.infer<typeof SensitiveFieldPathSchema>;
export type SensitiveFieldValue = string | number | boolean | null;

const VaultMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('fillio:vault/status') }).strict(),
  z
    .object({
      type: z.literal('fillio:vault/setup'),
      passphrase: z.string().min(1),
      profile: SensitiveProfileSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('fillio:vault/unlock'),
      passphrase: z.string().min(1),
    })
    .strict(),
  z.object({ type: z.literal('fillio:vault/lock') }).strict(),
  z.object({ type: z.literal('fillio:vault/load-profile') }).strict(),
  z
    .object({
      type: z.literal('fillio:vault/save-profile'),
      profile: SensitiveProfileSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('fillio:vault/read-fields'),
      fields: z.array(SensitiveFieldPathSchema),
    })
    .strict(),
  z.object({ type: z.literal('fillio:vault/reset') }).strict(),
]);

export type VaultMessage = z.infer<typeof VaultMessageSchema>;

export type VaultStatus = VaultSessionStatus & {
  configured: boolean;
};

export type VaultErrorCode =
  | 'invalid-message'
  | 'not-configured'
  | 'invalid-passphrase'
  | 'locked'
  | 'vault-error';

export type VaultResponse =
  | { ok: true; status: VaultStatus }
  | { ok: true; profile: SensitiveProfile }
  | {
      ok: true;
      values: Partial<Record<SensitiveFieldPath, SensitiveFieldValue>>;
    }
  | { ok: false; error: VaultErrorCode };

export function isVaultMessage(value: unknown): value is VaultMessage {
  return VaultMessageSchema.safeParse(value).success;
}

export function parseVaultMessage(
  value: unknown,
): VaultMessage | Extract<VaultResponse, { ok: false }> {
  const result = VaultMessageSchema.safeParse(value);
  return result.success ? result.data : { ok: false, error: 'invalid-message' };
}
