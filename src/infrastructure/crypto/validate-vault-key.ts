import type { StoredVaultEnvelope } from '../../domain/vault/vault-envelope';
import { decryptEncodedVaultBytes } from './decrypt-encoded-vault-bytes';

export async function validateVaultKey(
  envelope: StoredVaultEnvelope,
  key: CryptoKey,
): Promise<void> {
  const { ciphertext } = envelope;
  const { iv } = envelope.cipher;
  await decryptEncodedVaultBytes(ciphertext, iv, key);
}
