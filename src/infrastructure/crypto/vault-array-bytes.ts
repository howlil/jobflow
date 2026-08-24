import { decodeVaultBytes } from './vault-bytes';

export function toVaultBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(bytes);
}

export function decodeVaultArrayBytes(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(decodeVaultBytes(value));
}
