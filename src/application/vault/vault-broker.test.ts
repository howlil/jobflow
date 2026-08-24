import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createEmptySensitiveProfile } from '../../domain/profile/create-empty-sensitive-profile';
import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import { createEmptyVaultEnvelope } from '../../domain/vault/vault-envelope';
import { VaultUnlockError } from '../../infrastructure/crypto/web-crypto-vault';
import type { VaultRepository } from './vault-repository';
import { VaultLockedError, VaultSession } from './vault-session';
import { createVaultBroker } from './vault-broker';

function key(label: string): CryptoKey {
  return { type: 'secret', label } as unknown as CryptoKey;
}

function profileWithSensitiveValues(): SensitiveProfile {
  const profile = createEmptySensitiveProfile();
  profile.personal.birthDate = '2001-02-03';
  profile.identity.nationalId = '3174000000000001';
  profile.compensation.expected.amount = 15_000_000;
  profile.compensation.expected.currency = 'IDR';
  profile.compensation.expected.payPeriod = 'monthly';
  return profile;
}

class MemoryVaultRepository implements VaultRepository {
  envelope = null as Awaited<ReturnType<VaultRepository['load']>>;

  async load() {
    return this.envelope;
  }

  async save(envelope: NonNullable<typeof this.envelope>) {
    this.envelope = envelope;
  }

  async delete() {
    this.envelope = null;
  }
}

describe('createVaultBroker', () => {
  let repository: MemoryVaultRepository;
  let session: VaultSession<CryptoKey>;
  let encryptedProfile: SensitiveProfile;

  beforeEach(() => {
    repository = new MemoryVaultRepository();
    session = new VaultSession<CryptoKey>();
    encryptedProfile = profileWithSensitiveValues();
  });

  function broker() {
    return createVaultBroker({
      repository,
      session,
      crypto: {
        createEncryptedVault: vi.fn(async () => ({
          envelope: createEmptyVaultEnvelope('2026-08-13T16:30:00.000Z'),
          key: key('created'),
        })),
        unlockVaultKey: vi.fn(async () => key('unlocked')),
        decryptSensitiveProfile: vi.fn(async () => encryptedProfile),
        reencryptSensitiveProfile: vi.fn(async (_profile, envelope) => ({
          ...envelope,
          metadata: {
            ...envelope.metadata,
            updatedAt: '2026-08-13T17:00:00.000Z',
          },
        })),
      },
    });
  }

  it('reports configured and unlocked state without exposing passphrase or key material', async () => {
    const response = await broker().handle({
      type: 'fillio:vault/setup',
      passphrase: 'local-passphrase',
      profile: encryptedProfile,
    });

    expect(response).toMatchObject({
      ok: true,
      status: { configured: true, unlocked: true },
    });
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain('local-passphrase');
    expect(serialized).not.toContain('created');
    expect(serialized).not.toContain('CryptoKey');
    expect(repository.envelope).not.toBeNull();
  });

  it('fails closed when unlocking an absent vault or an invalid passphrase', async () => {
    await expect(
      broker().handle({
        type: 'fillio:vault/unlock',
        passphrase: 'local-passphrase',
      }),
    ).resolves.toEqual({ ok: false, error: 'not-configured' });

    repository.envelope = createEmptyVaultEnvelope();
    const invalidBroker = createVaultBroker({
      repository,
      session,
      crypto: {
        createEncryptedVault: vi.fn(),
        unlockVaultKey: vi.fn(async () => {
          throw new VaultUnlockError();
        }),
        decryptSensitiveProfile: vi.fn(),
        reencryptSensitiveProfile: vi.fn(),
      },
    });

    await expect(
      invalidBroker.handle({
        type: 'fillio:vault/unlock',
        passphrase: 'wrong-passphrase',
      }),
    ).resolves.toEqual({ ok: false, error: 'invalid-passphrase' });
    expect(session.status().unlocked).toBe(false);
  });

  it('requires an unlocked session before loading or saving plaintext profile data', async () => {
    repository.envelope = createEmptyVaultEnvelope();

    await expect(
      broker().handle({ type: 'fillio:vault/load-profile' }),
    ).resolves.toEqual({ ok: false, error: 'locked' });
    await expect(
      broker().handle({
        type: 'fillio:vault/save-profile',
        profile: encryptedProfile,
      }),
    ).resolves.toEqual({ ok: false, error: 'locked' });
  });

  it('loads, saves, and reads only requested sensitive fields while unlocked', async () => {
    repository.envelope = createEmptyVaultEnvelope('2026-08-13T16:30:00.000Z');
    session.unlock(key('session'));
    const vaultBroker = broker();

    await expect(
      vaultBroker.handle({ type: 'fillio:vault/load-profile' }),
    ).resolves.toEqual({ ok: true, profile: encryptedProfile });

    await expect(
      vaultBroker.handle({
        type: 'fillio:vault/read-fields',
        fields: ['identity.nationalId', 'personal.birthDate'],
      }),
    ).resolves.toEqual({
      ok: true,
      values: {
        'identity.nationalId': '3174000000000001',
        'personal.birthDate': '2001-02-03',
      },
    });

    encryptedProfile.identity.taxId = '99.999.999.9-999.999';
    await expect(
      vaultBroker.handle({
        type: 'fillio:vault/save-profile',
        profile: encryptedProfile,
      }),
    ).resolves.toMatchObject({
      ok: true,
      status: { configured: true, unlocked: true },
    });
    expect(repository.envelope?.metadata.updatedAt).toBe(
      '2026-08-13T17:00:00.000Z',
    );
  });

  it('locks and resets without leaving an unlocked session behind', async () => {
    repository.envelope = createEmptyVaultEnvelope();
    session.unlock(key('session'));

    await expect(
      broker().handle({ type: 'fillio:vault/lock' }),
    ).resolves.toEqual({
      ok: true,
      status: { configured: true, unlocked: false, expiresAt: null },
    });
    expect(() => session.requireKey()).toThrow(VaultLockedError);

    session.unlock(key('session'));
    await expect(
      broker().handle({ type: 'fillio:vault/reset' }),
    ).resolves.toEqual({
      ok: true,
      status: { configured: false, unlocked: false, expiresAt: null },
    });
    expect(repository.envelope).toBeNull();
    expect(() => session.requireKey()).toThrow(VaultLockedError);
  });
});
