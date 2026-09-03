import { browser } from 'wxt/browser';

import { createDocumentBroker } from '../src/application/documents/document-broker';
import { createVaultBroker } from '../src/application/vault/vault-broker';
import { VaultSession } from '../src/application/vault/vault-session';
import {
  isOpenWorkspaceMessage,
  TOGGLE_ASSISTANT,
} from '../src/application/workspace/workspace-messages';
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

async function openWorkspace() {
  await browser.tabs.create({
    url: browser.runtime.getURL('/options.html'),
  });
}

export default defineBackground(() => {
  browser.action.onClicked.addListener((tab) => {
    if (tab.id === undefined) {
      void openWorkspace();
      return;
    }

    void browser.tabs
      .sendMessage(tab.id, { type: TOGGLE_ASSISTANT })
      .then((response: unknown) => {
        const available =
          typeof response === 'object' &&
          response !== null &&
          'available' in response &&
          response.available === true;
        if (!available) void openWorkspace();
      })
      .catch(() => {
        void openWorkspace();
      });
  });

  browser.runtime.onMessage.addListener((message) => {
    if (isOpenWorkspaceMessage(message)) return openWorkspace();
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
    message.type.startsWith('jobflow:vault/')
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
    message.type.startsWith('jobflow:document/')
  );
}
