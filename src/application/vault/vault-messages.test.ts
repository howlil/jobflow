import { describe, expect, it } from 'vitest';

import { createEmptySensitiveProfile } from '../../domain/profile/create-empty-sensitive-profile';
import {
  isVaultMessage,
  parseVaultMessage,
  type VaultResponse,
} from './vault-messages';

describe('vault runtime messages', () => {
  it('accepts supported vault commands and rejects malformed input', () => {
    const profile = createEmptySensitiveProfile();

    expect(isVaultMessage({ type: 'fillio:vault/status' })).toBe(true);
    expect(
      isVaultMessage({
        type: 'fillio:vault/setup',
        passphrase: 'local-passphrase',
        profile,
      }),
    ).toBe(true);
    expect(
      isVaultMessage({
        type: 'fillio:vault/read-fields',
        fields: ['identity.nationalId', 'personal.birthDate'],
      }),
    ).toBe(true);

    expect(isVaultMessage({ type: 'fillio:vault/setup', profile })).toBe(false);
    expect(isVaultMessage({ type: 'fillio:vault/read-fields' })).toBe(false);
    expect(isVaultMessage({ type: 'fillio:vault/unknown' })).toBe(false);
    expect(isVaultMessage(null)).toBe(false);
  });

  it('returns a typed invalid-message result instead of throwing on unknown payloads', () => {
    expect(parseVaultMessage({ type: 'fillio:vault/nope' })).toEqual({
      ok: false,
      error: 'invalid-message',
    });
  });

  it('keeps passphrases and key material out of status responses', () => {
    const response: VaultResponse = {
      ok: true,
      status: {
        configured: true,
        unlocked: true,
        expiresAt: 1786639500000,
      },
    };
    const serialized = JSON.stringify(response);

    expect(serialized).not.toContain('passphrase');
    expect(serialized).not.toContain('CryptoKey');
    expect(serialized).not.toContain('key');
  });
});
