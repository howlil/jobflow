import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import type { StoredVaultEnvelope } from '../../domain/vault/vault-envelope';
import { createEncryptedProfileVault } from './create-encrypted-profile-vault';
import { decryptEncodedVaultBytes } from './decrypt-encoded-vault-bytes';
import { unlockVaultSessionKey } from './unlock-vault-session-key';
import { updateEncryptedProfileVault } from './update-encrypted-profile-vault';
import { VaultUnlockError } from './vault-error';
import { decodeVaultProfile } from './vault-profile-codec';

export { VaultUnlockError };

export function createEncryptedVault(
  profile: SensitiveProfile,
  passphrase: string,
  now = new Date().toISOString(),
): Promise<{ envelope: StoredVaultEnvelope; key: CryptoKey }> {
  return createEncryptedProfileVault(profile, passphrase, now);
}

export function unlockVaultKey(
  envelope: StoredVaultEnvelope,
  passphrase: string,
): Promise<CryptoKey> {
  return unlockVaultSessionKey(envelope, passphrase);
}

export async function decryptSensitiveProfile(
  envelope: StoredVaultEnvelope,
  key: CryptoKey,
): Promise<SensitiveProfile> {
  try {
    const plaintext = await decryptEncodedVaultBytes(
      envelope.ciphertext,
      envelope.cipher.iv,
      key,
    );
    return decodeVaultProfile(plaintext);
  } catch {
    throw new VaultUnlockError();
  }
}

export function reencryptSensitiveProfile(
  profile: SensitiveProfile,
  envelope: StoredVaultEnvelope,
  key: CryptoKey,
  now = new Date().toISOString(),
): Promise<StoredVaultEnvelope> {
  return updateEncryptedProfileVault(profile, envelope, key, now);
}
