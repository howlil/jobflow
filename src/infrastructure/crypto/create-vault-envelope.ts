import {
  createEmptyVaultEnvelope,
  type StoredVaultEnvelope,
} from '../../domain/vault/vault-envelope';
import { encryptVaultBytes } from './vault-aead';
import { toVaultBytes } from './vault-array-bytes';
import { encodeVaultBytes } from './vault-bytes';
import { deriveVaultKey } from './vault-key';

export async function createVaultEnvelope(
  payload: Uint8Array,
  phrase: string,
  now = new Date().toISOString(),
): Promise<{ envelope: StoredVaultEnvelope; key: CryptoKey }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveVaultKey(phrase, salt);
  const encrypted = await encryptVaultBytes(toVaultBytes(payload), key, iv);
  const envelope = createEmptyVaultEnvelope(now);

  return {
    key,
    envelope: {
      ...envelope,
      kdf: { ...envelope.kdf, salt: encodeVaultBytes(salt) },
      cipher: { ...envelope.cipher, iv: encodeVaultBytes(iv) },
      ciphertext: encodeVaultBytes(encrypted),
    },
  };
}
