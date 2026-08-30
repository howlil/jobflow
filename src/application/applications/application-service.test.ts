import { describe, expect, it, vi } from 'vitest';

import { createEmptyApplicationCollection } from '../../domain/applications/create-empty-application-collection';
import type { ApplicationRepository } from './application-repository';
import { createApplicationService } from './application-service';

function memoryRepository(): ApplicationRepository & {
  saved: ReturnType<typeof vi.fn>;
} {
  let collection = createEmptyApplicationCollection('2026-08-30T00:00:00.000Z');
  const saved = vi.fn();
  return {
    saved,
    async load() {
      return collection;
    },
    async save(next) {
      collection = next;
      saved(next);
    },
  };
}

describe('createApplicationService', () => {
  it('creates a validated local application and persists it', async () => {
    const repository = memoryRepository();
    const service = createApplicationService(repository);

    const application = await service.create({
      company: ' Acme ',
      role: ' Senior Backend Engineer ',
      jobUrl: 'https://jobs.example/acme-backend',
      stage: 'saved',
      notes: ' Follow up with recruiter ',
      source: ' LinkedIn ',
      contactName: ' Maya ',
      contactEmail: ' maya@example.com ',
      nextActionAt: '2026-09-01',
    });

    expect(application).toMatchObject({
      company: 'Acme',
      role: 'Senior Backend Engineer',
      jobUrl: 'https://jobs.example/acme-backend',
      stage: 'saved',
      notes: 'Follow up with recruiter',
      source: 'LinkedIn',
      contactName: 'Maya',
      contactEmail: 'maya@example.com',
      nextActionAt: '2026-09-01',
    });
    await expect(service.list()).resolves.toEqual([application]);
    expect(repository.saved).toHaveBeenCalledTimes(1);
  });

  it('rejects empty required fields and invalid URLs', async () => {
    const service = createApplicationService(memoryRepository());

    await expect(
      service.create({
        company: '',
        role: 'Engineer',
        stage: 'saved',
      }),
    ).rejects.toThrow();
    await expect(
      service.create({
        company: 'Acme',
        role: 'Engineer',
        jobUrl: 'not a url',
        stage: 'saved',
      }),
    ).rejects.toThrow();
    await expect(
      service.create({
        company: 'Acme',
        role: 'Engineer',
        stage: 'saved',
        contactEmail: 'not-email',
      }),
    ).rejects.toThrow();
  });

  it('changes stages without enforcing a strict state machine or dropping details', async () => {
    const service = createApplicationService(memoryRepository());
    const application = await service.create({
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      notes: 'Keep recruiter context.',
      nextActionAt: '2026-09-01',
    });

    const next = await service.changeStage(application.id, 'offer');

    expect(next.stage).toBe('offer');
    expect(next.notes).toBe('Keep recruiter context.');
    expect(next.nextActionAt).toBe('2026-09-01');
  });

  it('derives a conservative review draft from page capture signals', () => {
    const service = createApplicationService(memoryRepository());

    expect(
      service.createDraftFromPageCapture({
        url: 'https://jobs.example/acme/backend',
        signals: ['Senior Backend Engineer at Acme'],
      }),
    ).toEqual({
      company: 'Acme',
      role: 'Senior Backend Engineer',
      jobUrl: 'https://jobs.example/acme/backend',
      stage: 'saved',
    });
  });
});
