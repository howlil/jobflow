import { beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import { createEmptySensitiveProfile } from '../../domain/profile/create-empty-sensitive-profile';
import { ChromeVaultClient } from './chrome-vault-client';

describe('ChromeVaultClient', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('sends typed vault messages through extension runtime messaging', async () => {
    const response = {
      ok: true,
      status: { configured: true, unlocked: true, expiresAt: 1786639500000 },
    };
    const sendMessage = vi
      .spyOn(browser.runtime, 'sendMessage')
      .mockImplementation(async () => response as never);
    const profile = createEmptySensitiveProfile();

    await expect(
      new ChromeVaultClient().setup(profile, 'local-passphrase'),
    ).resolves.toEqual(response);

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'jobflow:vault/setup',
      profile,
      passphrase: 'local-passphrase',
    });
  });

  it('does not retain the passphrase after sending an unlock message', async () => {
    const response = {
      ok: true,
      status: { configured: true, unlocked: true, expiresAt: null },
    };
    const sendMessage = vi
      .spyOn(browser.runtime, 'sendMessage')
      .mockImplementation(async () => response as never);
    const client = new ChromeVaultClient();

    await client.unlock('local-passphrase');

    expect(JSON.stringify(client)).not.toContain('local-passphrase');
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'jobflow:vault/unlock',
      passphrase: 'local-passphrase',
    });
  });
});
