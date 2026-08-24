import { browser } from 'wxt/browser';

import { createVaultBroker } from '../src/application/vault/vault-broker';
import { VaultSession } from '../src/application/vault/vault-session';
import {
  createEncryptedVault,
  decryptSensitiveProfile,
  reencryptSensitiveProfile,
  unlockVaultKey,
} from '../src/infrastructure/crypto/web-crypto-vault';
import { ChromeVaultRepository } from '../src/infrastructure/storage/chrome-vault-repository';

const vaultBroker = createVaultBroker({
  repository: new ChromeVaultRepository(),
  session: new VaultSession<CryptoKey>(),
  crypto: {
    createEncryptedVault,
    unlockVaultKey,
    decryptSensitiveProfile,
    reencryptSensitiveProfile,
  },
});

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (!isPotentialVaultMessage(message)) return undefined;
    return vaultBroker.handle(message);
  });
});

function isPotentialVaultMessage(
  message: unknown,
): message is { type: string } {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof message.type === 'string' &&
    message.type.startsWith('fillio:vault/')
  );
}
