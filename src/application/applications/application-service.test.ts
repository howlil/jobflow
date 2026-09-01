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
  it('creates a validated local application and starts lifecycle history', async () => {
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
      stageHistory: [{ stage: 'saved' }],
    });
    expect(application.stageHistory[0]?.enteredAt).toBe(application.createdAt);
    await expect(service.list()).resolves.toEqual([application]);
    expect(repository.saved).toHaveBeenCalledTimes(1);
  });

  it('clears explicitly emptied optional fields and keeps them cleared after reload', async () => {
    const service = createApplicationService(memoryRepository());
    const application = await service.create({
      company: 'Acme',
      role: 'Engineer',
      jobUrl: 'https://jobs.example/acme',
      stage: 'applied',
      notes: 'Follow up with recruiter.',
      source: 'LinkedIn',
      contactName: 'Maya',
      contactEmail: 'maya@example.com',
      nextActionAt: '2026-09-01',
      appliedAt: '2026-08-30',
    });

    const updated = await service.update(application.id, {
      jobUrl: '',
      notes: '',
      source: '',
      contactName: '',
      contactEmail: '',
      nextActionAt: '',
      appliedAt: '',
    });

    for (const field of [
      'jobUrl',
      'notes',
      'source',
      'contactName',
      'contactEmail',
      'nextActionAt',
      'appliedAt',
    ] as const) {
      expect(updated).not.toHaveProperty(field);
    }

    const [reloaded] = await service.list();
    expect(reloaded).toEqual(updated);
  });

  it('rejects empty required fields, invalid URLs, and invalid lifecycle combinations', async () => {
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
    await expect(
      service.create({
        company: 'Acme',
        role: 'Engineer',
        stage: 'closed',
      }),
    ).rejects.toThrow();
    await expect(
      service.create({
        company: 'Acme',
        role: 'Engineer',
        stage: 'interview',
        substage: 'assessment',
      }),
    ).rejects.toThrow();
  });

  it('records lifecycle history and important dates when stages advance', async () => {
    const service = createApplicationService(memoryRepository());
    const application = await service.create({
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      substage: 'submitted',
      notes: 'Keep recruiter context.',
      nextActionAt: '2026-09-01',
    });

    const interview = await service.changeStage(
      application.id,
      'interview',
      'technical_interview',
    );
    const offer = await service.changeStage(
      application.id,
      'offer',
      'offer_received',
    );

    expect(interview).toMatchObject({
      stage: 'interview',
      substage: 'technical_interview',
      notes: 'Keep recruiter context.',
      nextActionAt: '2026-09-01',
    });
    expect(interview.interviewAt).toBeDefined();
    expect(offer).toMatchObject({
      stage: 'offer',
      substage: 'offer_received',
      notes: 'Keep recruiter context.',
    });
    expect(offer.offerAt).toBeDefined();
    expect(
      offer.stageHistory.map(({ stage, substage }) => ({ stage, substage })),
    ).toEqual([
      { stage: 'applied', substage: 'submitted' },
      { stage: 'interview', substage: 'technical_interview' },
      { stage: 'offer', substage: 'offer_received' },
    ]);
  });

  it('records substage changes without inventing a primary-stage transition', async () => {
    const service = createApplicationService(memoryRepository());
    const application = await service.create({
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      substage: 'submitted',
    });

    const assessment = await service.update(application.id, {
      substage: 'assessment',
    });

    expect(assessment.stage).toBe('applied');
    expect(assessment.substage).toBe('assessment');
    expect(assessment.stageHistory).toHaveLength(2);
    expect(assessment.stageHistory[1]).toMatchObject({
      stage: 'applied',
      substage: 'assessment',
    });
    expect(assessment.appliedAt).toBeUndefined();
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
