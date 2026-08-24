import { beforeEach, describe, expect, it } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import { createEmptyVaultEnvelope } from '../../domain/vault/vault-envelope';
import {
  ChromeVaultRepository,
  VAULT_STORAGE_KEY,
} from './chrome-vault-repository';

describe('ChromeVaultRepository', () => {
  beforeEach(() => fakeBrowser.reset());

  it('loads null when the vault is not configured', async () => {
    await expect(new ChromeVaultRepository().load()).resolves.toBeNull();
  });

  it('saves and reloads only a validated encrypted envelope', async () => {
    const repository = new ChromeVaultRepository();
    const envelope = {
      ...createEmptyVaultEnvelope('2026-08-13T16:30:00.000Z'),
      kdf: {
        ...createEmptyVaultEnvelope().kdf,
        salt: 'c2FsdA==',
      },
      cipher: {
        ...createEmptyVaultEnvelope().cipher,
        iv: 'aXY=',
      },
      ciphertext: 'Y2lwaGVydGV4dA==',
    };

    await repository.save(envelope);

    await expect(repository.load()).resolves.toEqual(envelope);
    const raw = await browser.storage.local.get(VAULT_STORAGE_KEY);
    expect(raw).toEqual({ [VAULT_STORAGE_KEY]: envelope });
  });

  it('rejects malformed stored data instead of type casting it', async () => {
    await browser.storage.local.set({
      [VAULT_STORAGE_KEY]: { schemaVersion: 1, ciphertext: 'bad' },
    });

    await expect(new ChromeVaultRepository().load()).rejects.toThrow();
  });

  it('deletes the persisted vault envelope', async () => {
    const repository = new ChromeVaultRepository();
    await repository.save(createEmptyVaultEnvelope());

    await repository.delete();

    await expect(repository.load()).resolves.toBeNull();
  });
});
