import { VAULT_TAG_LENGTH } from '../../domain/vault/vault-envelope';

const encoder = new TextEncoder();
const VAULT_AAD = encoder.encode('fillio:vault:v1');

export async function encryptVaultBytes(
  plaintext: Uint8Array<ArrayBuffer>,
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const result = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: VAULT_AAD,
      tagLength: VAULT_TAG_LENGTH,
    },
    key,
    plaintext,
  );
  return new Uint8Array(result);
}

export async function decryptVaultBytes(
  ciphertext: Uint8Array<ArrayBuffer>,
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const result = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: VAULT_AAD,
      tagLength: VAULT_TAG_LENGTH,
    },
    key,
    ciphertext,
  );
  return new Uint8Array(result);
}
