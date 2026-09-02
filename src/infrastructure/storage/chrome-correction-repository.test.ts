import { beforeEach, describe, expect, it } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';

import {
  reusableAnswerCorrectionTarget,
  type FieldCorrection,
} from '../../domain/corrections/correction-schema';
import {
  ChromeCorrectionRepository,
  CORRECTION_STORAGE_KEY,
} from './chrome-correction-repository';

function entry(overrides: Partial<FieldCorrection> = {}): FieldCorrection {
  return {
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-a',
    fieldFingerprint: 'field-a',
    target: 'personal.legalName.first',
    updatedAt: '2026-08-13T12:00:00.000Z',
    ...overrides,
  };
}

describe('ChromeCorrectionRepository', () => {
  beforeEach(() => fakeBrowser.reset());

  it('returns an empty list when nothing is stored', async () => {
    const repository = new ChromeCorrectionRepository();
    await expect(
      repository.listForOrigin('https://jobs.example.test'),
    ).resolves.toEqual([]);
  });

  it('replaces only the same origin/form/field key', async () => {
    const repository = new ChromeCorrectionRepository();
    await repository.upsert(entry());
    await repository.upsert(
      entry({
        fieldFingerprint: 'field-b',
        target: 'contact.email.primary',
      }),
    );
    await repository.upsert(
      entry({
        origin: 'https://other.example.test',
        target: 'links.github',
      }),
    );
    await repository.upsert(
      entry({
        target: 'contact.phone.primary',
        updatedAt: '2026-08-13T12:30:00.000Z',
      }),
    );

    const stored = await repository.listForOrigin('https://jobs.example.test');
    expect(stored).toHaveLength(2);
    expect(stored).toEqual(
      expect.arrayContaining([
        entry({
          target: 'contact.phone.primary',
          updatedAt: '2026-08-13T12:30:00.000Z',
        }),
        entry({
          fieldFingerprint: 'field-b',
          target: 'contact.email.primary',
        }),
      ]),
    );
  });

  it('persists reusable-answer correction targets', async () => {
    const repository = new ChromeCorrectionRepository();
    const correction = entry({
      target: reusableAnswerCorrectionTarget('answer-1'),
    });

    await repository.upsert(correction);

    await expect(repository.listAll()).resolves.toEqual([correction]);
    await expect(
      browser.storage.local.get(CORRECTION_STORAGE_KEY),
    ).resolves.toEqual({
      [CORRECTION_STORAGE_KEY]: { schemaVersion: 2, entries: [correction] },
    });
  });

  it('lists all corrections for management UI', async () => {
    const repository = new ChromeCorrectionRepository();
    await repository.upsert(entry());
    await repository.upsert(
      entry({
        origin: 'https://other.example.test',
        fieldFingerprint: 'field-b',
      }),
    );

    await expect(repository.listAll()).resolves.toHaveLength(2);
  });

  it('migrates legacy correction storage on load', async () => {
    const correction = entry();
    await browser.storage.local.set({
      'fillio.corrections': { schemaVersion: 1, entries: [correction] },
    });
    const repository = new ChromeCorrectionRepository();

    await expect(repository.listAll()).resolves.toEqual([correction]);
    await expect(
      browser.storage.local.get(CORRECTION_STORAGE_KEY),
    ).resolves.toEqual({
      [CORRECTION_STORAGE_KEY]: { schemaVersion: 2, entries: [correction] },
    });
  });

  it('upgrades current v1 correction storage on load', async () => {
    const correction = entry();
    await browser.storage.local.set({
      [CORRECTION_STORAGE_KEY]: { schemaVersion: 1, entries: [correction] },
    });
    const repository = new ChromeCorrectionRepository();

    await expect(repository.listAll()).resolves.toEqual([correction]);
    await expect(
      browser.storage.local.get(CORRECTION_STORAGE_KEY),
    ).resolves.toEqual({
      [CORRECTION_STORAGE_KEY]: { schemaVersion: 2, entries: [correction] },
    });
  });

  it('deletes one exact correction without disturbing siblings', async () => {
    const repository = new ChromeCorrectionRepository();
    await repository.upsert(entry());
    await repository.upsert(entry({ fieldFingerprint: 'field-b' }));

    await repository.remove({
      origin: 'https://jobs.example.test',
      formFingerprint: 'form-a',
      fieldFingerprint: 'field-a',
    });

    await expect(
      repository.listForOrigin('https://jobs.example.test'),
    ).resolves.toEqual([entry({ fieldFingerprint: 'field-b' })]);
  });

  it('resets one origin and can clear all learned corrections', async () => {
    const repository = new ChromeCorrectionRepository();
    await repository.upsert(entry());
    await repository.upsert(
      entry({
        origin: 'https://other.example.test',
        fieldFingerprint: 'field-b',
      }),
    );

    await repository.removeForOrigin('https://jobs.example.test');
    await expect(repository.listAll()).resolves.toEqual([
      entry({
        origin: 'https://other.example.test',
        fieldFingerprint: 'field-b',
      }),
    ]);

    await repository.clear();
    await expect(repository.listAll()).resolves.toEqual([]);
  });

  it('rejects malformed persisted data', async () => {
    await browser.storage.local.set({
      [CORRECTION_STORAGE_KEY]: { schemaVersion: 2, entries: [{}] },
    });
    const repository = new ChromeCorrectionRepository();
    await expect(
      repository.listForOrigin('https://jobs.example.test'),
    ).rejects.toThrow();
  });
});
