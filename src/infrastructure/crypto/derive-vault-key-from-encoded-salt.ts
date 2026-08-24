import { decodeVaultArrayBytes } from './vault-array-bytes';
import { deriveVaultKey } from './vault-key';

export function deriveVaultKeyFromEncodedSalt(
  phrase: string,
  encodedSalt: string,
): Promise<CryptoKey> {
  return deriveVaultKey(phrase, decodeVaultArrayBytes(encodedSalt));
}
