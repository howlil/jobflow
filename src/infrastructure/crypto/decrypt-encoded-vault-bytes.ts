import { decryptVaultBytes } from './vault-aead';
import { decodeVaultBytes } from './vault-bytes';

export function decryptEncodedVaultBytes(
  encodedCiphertext: string,
  encodedIv: string,
  key: CryptoKey,
): Promise<Uint8Array> {
  return decryptVaultBytes(
    // @ts-expect-error TS 5.9 models this freshly allocated byte view as ArrayBufferLike.
    decodeVaultBytes(encodedCiphertext),
    key,
    decodeVaultBytes(encodedIv),
  );
}
