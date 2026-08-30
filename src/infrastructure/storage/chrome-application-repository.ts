import { browser } from 'wxt/browser';

import type { ApplicationRepository } from '../../application/applications/application-repository';
import type { StoredApplicationCollection } from '../../domain/applications/application-schema';
import { parseStoredApplicationCollection } from '../../domain/applications/migrations';

export const APPLICATION_STORAGE_KEY = 'jobflow.applications';

export class ChromeApplicationRepository implements ApplicationRepository {
  async load(): Promise<StoredApplicationCollection | null> {
    const stored = await browser.storage.local.get(APPLICATION_STORAGE_KEY);
    const rawApplications = stored[APPLICATION_STORAGE_KEY];

    if (rawApplications === undefined) {
      return null;
    }

    return parseStoredApplicationCollection(rawApplications);
  }

  async save(collection: StoredApplicationCollection): Promise<void> {
    const validatedCollection = parseStoredApplicationCollection(collection);

    await browser.storage.local.set({
      [APPLICATION_STORAGE_KEY]: validatedCollection,
    });
  }
}
