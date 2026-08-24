export function encodeVaultBytes(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

export function decodeVaultBytes(value: string): Uint8Array {
  if (value.length % 2 !== 0) throw new Error('Invalid encoded bytes.');
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    const byte = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    if (Number.isNaN(byte)) throw new Error('Invalid encoded bytes.');
    bytes[index] = byte;
  }
  return bytes;
}
