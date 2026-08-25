import { browser } from 'wxt/browser';

import { createDocumentBroker } from '../src/application/documents/document-broker';
import { createVaultBroker } from '../src/application/vault/vault-broker';
import { VaultSession } from '../src/application/vault/vault-session';
import { isOpenWorkspaceMessage } from '../src/application/workspace/workspace-messages';
import {
  createEncryptedVault,
  decryptSensitiveProfile,
  reencryptSensitiveProfile,
  unlockVaultKey,
} from '../src/infrastructure/crypto/web-crypto-vault';
import { IndexedDbDocumentRepository } from '../src/infrastructure/storage/indexeddb-document-repository';
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

const documentBroker = createDocumentBroker(new IndexedDbDocumentRepository());

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (isOpenWorkspaceMessage(message)) {
      return browser.tabs.create({
        url: browser.runtime.getURL('/options.html'),
      });
    }
    if (isPotentialVaultMessage(message)) return vaultBroker.handle(message);
    if (isPotentialDocumentMessage(message))
      return documentBroker.handle(message);
    return undefined;
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

function isPotentialDocumentMessage(
  message: unknown,
): message is { type: string } {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof message.type === 'string' &&
    message.type.startsWith('fillio:document/')
  );
}
