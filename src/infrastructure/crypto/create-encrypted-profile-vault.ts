import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import type { StoredVaultEnvelope } from '../../domain/vault/vault-envelope';
import { createVaultEnvelope } from './create-vault-envelope';
import { encodeVaultProfile } from './vault-profile-codec';

export function createEncryptedProfileVault(
  profile: SensitiveProfile,
  phrase: string,
  now?: string,
): Promise<{ envelope: StoredVaultEnvelope; key: CryptoKey }> {
  return createVaultEnvelope(encodeVaultProfile(profile), phrase, now);
}
