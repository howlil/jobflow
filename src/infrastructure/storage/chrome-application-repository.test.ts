import { beforeEach, describe, expect, it } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import { createEmptyApplicationCollection } from '../../domain/applications/create-empty-application-collection';
import {
  APPLICATION_STORAGE_KEY,
  ChromeApplicationRepository,
} from './chrome-application-repository';

describe('ChromeApplicationRepository', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('returns null when application storage is empty', async () => {
    await expect(new ChromeApplicationRepository().load()).resolves.toBeNull();
  });

  it('round-trips a schema-valid application collection', async () => {
    const repository = new ChromeApplicationRepository();
    const collection = createEmptyApplicationCollection(
      '2026-08-30T00:00:00.000Z',
    );
    collection.applications.push({
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      jobUrl: 'https://jobs.example/acme',
      stage: 'interview',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    });

    await repository.save(collection);

    await expect(repository.load()).resolves.toEqual(collection);
    await expect(
      browser.storage.local.get(APPLICATION_STORAGE_KEY),
    ).resolves.toEqual({
      [APPLICATION_STORAGE_KEY]: collection,
    });
  });

  it('rejects a corrupted persisted payload', async () => {
    await browser.storage.local.set({
      [APPLICATION_STORAGE_KEY]: {
        schemaVersion: 1,
        applications: [{ id: 'bad', company: '', role: '' }],
        metadata: {},
      },
    });

    await expect(new ChromeApplicationRepository().load()).rejects.toThrow();
  });
});
