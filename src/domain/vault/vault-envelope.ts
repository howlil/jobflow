import { z } from 'zod';

export const VAULT_KDF_ITERATIONS = 600_000;
export const VAULT_KEY_LENGTH = 256;
export const VAULT_TAG_LENGTH = 128;

const KdfSchema = z
  .object({
    name: z.literal('PBKDF2'),
    hash: z.literal('SHA-256'),
    iterations: z.literal(VAULT_KDF_ITERATIONS),
    salt: z.string(),
  })
  .strict();

const CipherSchema = z
  .object({
    name: z.literal('AES-GCM'),
    keyLength: z.literal(VAULT_KEY_LENGTH),
    iv: z.string(),
    tagLength: z.literal(VAULT_TAG_LENGTH),
  })
  .strict();

export const StoredVaultEnvelopeSchema = z
  .object({
    schemaVersion: z.literal(1),
    kdf: KdfSchema,
    cipher: CipherSchema,
    ciphertext: z.string(),
    metadata: z
      .object({
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .strict(),
  })
  .strict();

export type StoredVaultEnvelope = z.infer<typeof StoredVaultEnvelopeSchema>;

export function createEmptyVaultEnvelope(
  now = new Date().toISOString(),
): StoredVaultEnvelope {
  return {
    schemaVersion: 1,
    kdf: {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: VAULT_KDF_ITERATIONS,
      salt: '',
    },
    cipher: {
      name: 'AES-GCM',
      keyLength: VAULT_KEY_LENGTH,
      iv: '',
      tagLength: VAULT_TAG_LENGTH,
    },
    ciphertext: '',
    metadata: { createdAt: now, updatedAt: now },
  };
}

export function parseStoredVaultEnvelope(value: unknown): StoredVaultEnvelope {
  return StoredVaultEnvelopeSchema.parse(value);
}
