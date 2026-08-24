import { browser } from 'wxt/browser';

import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import type {
  SensitiveFieldPath,
  VaultResponse,
} from '../../application/vault/vault-messages';

export class ChromeVaultClient {
  status(): Promise<VaultResponse> {
    return browser.runtime.sendMessage({ type: 'fillio:vault/status' });
  }

  setup(profile: SensitiveProfile, passphrase: string): Promise<VaultResponse> {
    return browser.runtime.sendMessage({
      type: 'fillio:vault/setup',
      profile,
      passphrase,
    });
  }

  unlock(passphrase: string): Promise<VaultResponse> {
    return browser.runtime.sendMessage({
      type: 'fillio:vault/unlock',
      passphrase,
    });
  }

  lock(): Promise<VaultResponse> {
    return browser.runtime.sendMessage({ type: 'fillio:vault/lock' });
  }

  loadProfile(): Promise<VaultResponse> {
    return browser.runtime.sendMessage({ type: 'fillio:vault/load-profile' });
  }

  saveProfile(profile: SensitiveProfile): Promise<VaultResponse> {
    return browser.runtime.sendMessage({
      type: 'fillio:vault/save-profile',
      profile,
    });
  }

  readFields(fields: SensitiveFieldPath[]): Promise<VaultResponse> {
    return browser.runtime.sendMessage({
      type: 'fillio:vault/read-fields',
      fields,
    });
  }

  reset(): Promise<VaultResponse> {
    return browser.runtime.sendMessage({ type: 'fillio:vault/reset' });
  }
}
