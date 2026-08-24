import { describe, expect, it } from 'vitest';

import {
  createEmptyVaultEnvelope,
  parseStoredVaultEnvelope,
} from './vault-envelope';

describe('vault envelope v1', () => {
  it('creates a strict encrypted envelope with fixed crypto metadata', () => {
    const envelope = createEmptyVaultEnvelope('2026-08-13T16:00:00.000Z');

    expect(envelope).toEqual({
      schemaVersion: 1,
      kdf: {
        name: 'PBKDF2',
        hash: 'SHA-256',
        iterations: 600_000,
        salt: '',
      },
      cipher: {
        name: 'AES-GCM',
        keyLength: 256,
        iv: '',
        tagLength: 128,
      },
      ciphertext: '',
      metadata: {
        createdAt: '2026-08-13T16:00:00.000Z',
        updatedAt: '2026-08-13T16:00:00.000Z',
      },
    });
    expect(parseStoredVaultEnvelope(envelope)).toEqual(envelope);
  });

  it('rejects future versions and malformed crypto metadata', () => {
    expect(() => parseStoredVaultEnvelope({ schemaVersion: 2 })).toThrow();

    const envelope = createEmptyVaultEnvelope();
    expect(() =>
      parseStoredVaultEnvelope({
        ...envelope,
        kdf: { ...envelope.kdf, iterations: 1 },
      }),
    ).toThrow();
    expect(() =>
      parseStoredVaultEnvelope({
        ...envelope,
        cipher: { ...envelope.cipher, keyLength: 128 },
      }),
    ).toThrow();
  });

  it('rejects unexpected envelope properties', () => {
    const envelope = createEmptyVaultEnvelope();
    expect(() =>
      parseStoredVaultEnvelope({ ...envelope, unexpected: true }),
    ).toThrow();
  });
});
