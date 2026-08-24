import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import {
  parseStoredVaultEnvelope,
  type StoredVaultEnvelope,
} from '../../domain/vault/vault-envelope';
import { encryptVaultBytes } from './vault-aead';
import { encodeVaultBytes } from './vault-bytes';
import { encodeVaultProfile } from './vault-profile-codec';

export async function updateEncryptedProfileVault(
  profile: SensitiveProfile,
  envelope: StoredVaultEnvelope,
  key: CryptoKey,
  now = new Date().toISOString(),
): Promise<StoredVaultEnvelope> {
  const validated = parseStoredVaultEnvelope(envelope);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await encryptVaultBytes(
    encodeVaultProfile(profile),
    key,
    iv,
  );

  return {
    ...validated,
    cipher: { ...validated.cipher, iv: encodeVaultBytes(iv) },
    ciphertext: encodeVaultBytes(encrypted),
    metadata: { ...validated.metadata, updatedAt: now },
  };
}
