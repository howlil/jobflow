import { describe, expect, it } from 'vitest';

import { parseStoredApplicationCollection } from './migrations';

describe('parseStoredApplicationCollection', () => {
  it('migrates v1 application collections into the lifecycle model', () => {
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
          updatedAt: '2026-08-30T01:00:00.000Z',
        },
      ],
      metadata: {
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T01:00:00.000Z',
      },
    });

    expect(result).toEqual({
      schemaVersion: 3,
      applications: [
        {
          id: 'app-1',
          company: 'Acme',
          role: 'Engineer',
          jobUrl: 'https://jobs.example/acme',
          stage: 'applied',
          substage: 'submitted',
          stageHistory: [
            {
              stage: 'applied',
              substage: 'submitted',
              enteredAt: '2026-08-30T01:00:00.000Z',
            },
          ],
          createdAt: '2026-08-30T00:00:00.000Z',
          updatedAt: '2026-08-30T01:00:00.000Z',
        },
      ],
      metadata: {
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T01:00:00.000Z',
      },
    });
  });

  it('maps v2 assessment and terminal stages to lifecycle substages without dropping details', () => {
    const result = parseStoredApplicationCollection({
      schemaVersion: 2,
      applications: [
        {
          id: 'assessment',
          company: 'Acme',
          role: 'Engineer',
          stage: 'assessment',
          priority: 'p1',
          nextAction: 'Finish take-home',
          deadline: '2026-09-05',
          createdAt: '2026-08-30T00:00:00.000Z',
          updatedAt: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'rejected',
          company: 'Closed Co',
          role: 'Engineer',
          stage: 'rejected',
          notes: 'Role closed.',
          createdAt: '2026-08-30T00:00:00.000Z',
          updatedAt: '2026-09-02T00:00:00.000Z',
        },
      ],
      metadata: {
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-09-02T00:00:00.000Z',
      },
    });

    expect(result.schemaVersion).toBe(3);
    expect(result.applications[0]).toMatchObject({
      id: 'assessment',
      stage: 'applied',
      substage: 'assessment',
      priority: 'p1',
      nextAction: 'Finish take-home',
      deadline: '2026-09-05',
      stageHistory: [
        {
          stage: 'applied',
          substage: 'assessment',
          enteredAt: '2026-09-01T00:00:00.000Z',
        },
      ],
    });
    expect(result.applications[1]).toMatchObject({
      id: 'rejected',
      stage: 'closed',
      substage: 'rejected',
      notes: 'Role closed.',
      stageHistory: [
        {
          stage: 'closed',
          substage: 'rejected',
          enteredAt: '2026-09-02T00:00:00.000Z',
        },
      ],
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
