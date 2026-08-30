import { describe, expect, it } from 'vitest';

import { parseStoredApplicationCollection } from './migrations';

describe('parseStoredApplicationCollection', () => {
  it('migrates v1 application collections to the current version', () => {
    const result = parseStoredApplicationCollection({
      schemaVersion: 1,
      applications: [
        {
          id: 'app-1',
          company: 'Acme',
          role: 'Engineer',
          jobUrl: 'https://jobs.example/acme',
          stage: 'applied',
          createdAt: '2026-08-30T00:00:00.000Z',
          updatedAt: '2026-08-30T00:00:00.000Z',
        },
      ],
      metadata: {
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T00:00:00.000Z',
      },
    });

    expect(result).toEqual({
      schemaVersion: 2,
      applications: [
        {
          id: 'app-1',
          company: 'Acme',
          role: 'Engineer',
          jobUrl: 'https://jobs.example/acme',
          stage: 'applied',
          createdAt: '2026-08-30T00:00:00.000Z',
          updatedAt: '2026-08-30T00:00:00.000Z',
        },
      ],
      metadata: {
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T00:00:00.000Z',
      },
    });
  });

  it('rejects unsupported future versions', () => {
    expect(() =>
      parseStoredApplicationCollection({
        schemaVersion: 99,
        applications: [],
        metadata: {
          createdAt: '2026-08-30T00:00:00.000Z',
          updatedAt: '2026-08-30T00:00:00.000Z',
        },
      }),
    ).toThrow();
  });
});
