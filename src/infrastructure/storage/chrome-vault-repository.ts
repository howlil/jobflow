import { browser } from 'wxt/browser';

import type { VaultRepository } from '../../application/vault/vault-repository';
import {
  parseStoredVaultEnvelope,
  type StoredVaultEnvelope,
} from '../../domain/vault/vault-envelope';

export const VAULT_STORAGE_KEY = 'fillio.vault';

export class ChromeVaultRepository implements VaultRepository {
  async load(): Promise<StoredVaultEnvelope | null> {
    const stored = await browser.storage.local.get(VAULT_STORAGE_KEY);
    const value = stored[VAULT_STORAGE_KEY];
    return value === undefined ? null : parseStoredVaultEnvelope(value);
  }

  async save(envelope: StoredVaultEnvelope): Promise<void> {
    await browser.storage.local.set({
      [VAULT_STORAGE_KEY]: parseStoredVaultEnvelope(envelope),
    });
  }

  async delete(): Promise<void> {
    await browser.storage.local.remove(VAULT_STORAGE_KEY);
  }
}
