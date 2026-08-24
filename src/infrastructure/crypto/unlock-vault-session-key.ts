import type { StoredVaultEnvelope } from '../../domain/vault/vault-envelope';
import { deriveVaultKeyFromEncodedSalt } from './derive-vault-key-from-encoded-salt';
import { VaultUnlockError } from './vault-error';
import { verifyVaultKey } from './verify-vault-key';

export async function unlockVaultSessionKey(
  envelope: StoredVaultEnvelope,
  phrase: string,
): Promise<CryptoKey> {
  try {
    const key = await deriveVaultKeyFromEncodedSalt(phrase, envelope.kdf.salt);
    await verifyVaultKey(envelope, key);
    return key;
  } catch {
    throw new VaultUnlockError();
  }
}
