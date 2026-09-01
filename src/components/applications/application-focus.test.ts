import { describe, expect, it } from 'vitest';

import type { JobApplication } from '../../domain/applications/application-schema';
import {
  applicationMatchesQuery,
  applicationNeedsAction,
  focusApplications,
} from './application-focus';

function application(
  overrides: Partial<JobApplication> &
    Pick<JobApplication, 'id' | 'company' | 'role'>,
): JobApplication {
  const stage = overrides.stage ?? 'applied';
  const substage = overrides.substage;
  return {
    stage,
    ...(substage === undefined ? {} : { substage }),
    stageHistory: [
      {
        stage,
        ...(substage === undefined ? {} : { substage }),
        enteredAt: '2026-08-30T00:00:00.000Z',
      },
    ],
    createdAt: '2026-08-30T00:00:00.000Z',
    updatedAt: '2026-08-30T00:00:00.000Z',
    ...overrides,
  };
}

describe('application pipeline focus', () => {
  const todayKey = '2026-08-30';

  it('matches multi-term company, role, source, contact, and lifecycle context without order or case sensitivity', () => {
    const item = application({
      id: 'app-1',
      company: 'Gojek',
      role: 'Backend Engineer',
      source: 'LinkedIn',
      contactName: 'Maya Putri',
      contactEmail: 'maya@example.com',
      substage: 'recruiter_review',
    });

    expect(applicationMatchesQuery(item, 'gojek')).toBe(true);
    expect(applicationMatchesQuery(item, 'BACKEND')).toBe(true);
    expect(applicationMatchesQuery(item, 'linkedin')).toBe(true);
    expect(applicationMatchesQuery(item, 'MAYA PUTRI')).toBe(true);
    expect(applicationMatchesQuery(item, 'example.com')).toBe(true);
    expect(applicationMatchesQuery(item, 'recruiter_review')).toBe(true);
    expect(applicationMatchesQuery(item, 'backend gojek')).toBe(true);
    expect(applicationMatchesQuery(item, 'linkedin maya')).toBe(true);
    expect(applicationMatchesQuery(item, 'gojek frontend')).toBe(false);
    expect(applicationMatchesQuery(item, 'frontend')).toBe(false);
  });

  it('treats only active overdue and due-today applications as needing action', () => {
    expect(
      applicationNeedsAction(
        application({
          id: 'overdue',
          company: 'A',
          role: 'Engineer',
          nextActionAt: '2026-08-29',
        }),
        todayKey,
      ),
    ).toBe(true);
    expect(
      applicationNeedsAction(
        application({
          id: 'today',
          company: 'B',
          role: 'Engineer',
          nextActionAt: '2026-08-30',
        }),
        todayKey,
      ),
    ).toBe(true);
    expect(
      applicationNeedsAction(
        application({
          id: 'future',
          company: 'C',
          role: 'Engineer',
          nextActionAt: '2026-08-31',
        }),
        todayKey,
      ),
    ).toBe(false);
    expect(
      applicationNeedsAction(
        application({
          id: 'closed',
          company: 'D',
          role: 'Engineer',
          stage: 'closed',
          substage: 'rejected',
          nextActionAt: '2026-08-28',
        }),
        todayKey,
      ),
    ).toBe(false);
  });

  it('separates active board, needs-action, and closed views', () => {
    const items = [
      application({
        id: 'none',
        company: 'No Action',
        role: 'Engineer',
        updatedAt: '2026-08-30T04:00:00.000Z',
      }),
      application({
        id: 'future',
        company: 'Future',
        role: 'Engineer',
        nextActionAt: '2026-09-01',
      }),
      application({
        id: 'today',
        company: 'Today',
        role: 'Engineer',
        nextActionAt: '2026-08-30',
        updatedAt: '2026-08-30T03:00:00.000Z',
      }),
      application({
        id: 'overdue',
        company: 'Overdue',
        role: 'Engineer',
        nextActionAt: '2026-08-28',
      }),
      application({
        id: 'accepted',
        company: 'Accepted Co',
        role: 'Engineer',
        stage: 'closed',
        substage: 'accepted',
        updatedAt: '2026-08-30T05:00:00.000Z',
      }),
      application({
        id: 'rejected',
        company: 'Rejected Co',
        role: 'Engineer',
        stage: 'closed',
        substage: 'rejected',
        nextActionAt: '2026-08-20',
      }),
    ];

    expect(
      focusApplications(items, {
        query: '',
        view: 'board',
        todayKey,
      }).map((item) => item.id),
    ).toEqual(['overdue', 'today', 'future', 'none']);

    expect(
      focusApplications(items, {
        query: '',
        view: 'needs-action',
        todayKey,
      }).map((item) => item.id),
    ).toEqual(['overdue', 'today']);

    expect(
      focusApplications(items, {
        query: '',
        view: 'closed',
        todayKey,
      }).map((item) => item.id),
    ).toEqual(['rejected', 'accepted']);
  });

  it('combines search with the selected pipeline view', () => {
    const items = [
      application({
        id: 'gojek-active',
        company: 'Gojek',
        role: 'Backend Engineer',
        nextActionAt: '2026-08-30',
      }),
      application({
        id: 'gojek-closed',
        company: 'Gojek',
        role: 'Platform Engineer',
        stage: 'closed',
        substage: 'rejected',
      }),
      application({
        id: 'traveloka-active',
        company: 'Traveloka',
        role: 'Backend Engineer',
      }),
    ];

    expect(
      focusApplications(items, {
        query: 'backend gojek',
        view: 'board',
        todayKey,
      }).map((item) => item.id),
    ).toEqual(['gojek-active']);

    expect(
      focusApplications(items, {
        query: 'platform gojek',
        view: 'closed',
        todayKey,
      }).map((item) => item.id),
    ).toEqual(['gojek-closed']);
  });
});
