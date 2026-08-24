import {
  VAULT_KDF_ITERATIONS,
  VAULT_KEY_LENGTH,
} from '../../domain/vault/vault-envelope';

const encoder = new TextEncoder();

export async function deriveVaultKey(
  phrase: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    encoder.encode(phrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: VAULT_KDF_ITERATIONS,
      salt,
    },
    material,
    { name: 'AES-GCM', length: VAULT_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}
