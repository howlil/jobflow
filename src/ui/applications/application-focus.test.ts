import { describe, expect, it } from 'vitest';

import type { JobApplication } from '../../domain/applications/application-schema';
import {
  applicationMatchesQuery,
  applicationNeedsAction,
  focusApplications,
} from './application-focus';

function application(
  overrides: Partial<JobApplication> & Pick<JobApplication, 'id' | 'company' | 'role'>,
): JobApplication {
  return {
    stage: 'applied',
    createdAt: '2026-08-30T00:00:00.000Z',
    updatedAt: '2026-08-30T00:00:00.000Z',
    ...overrides,
  };
}

describe('application follow-up focus', () => {
  const todayKey = '2026-08-30';

  it('matches company and role without case sensitivity', () => {
    const item = application({
      id: 'app-1',
      company: 'Gojek',
      role: 'Backend Engineer',
    });

    expect(applicationMatchesQuery(item, 'gojek')).toBe(true);
    expect(applicationMatchesQuery(item, 'BACKEND')).toBe(true);
    expect(applicationMatchesQuery(item, 'frontend')).toBe(false);
  });

  it('treats overdue and due-today applications as needing action', () => {
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
        application({ id: 'none', company: 'D', role: 'Engineer' }),
        todayKey,
      ),
    ).toBe(false);
  });

  it('filters and sorts by action urgency, date, then recency', () => {
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
        id: 'today-old',
        company: 'Today Old',
        role: 'Engineer',
        nextActionAt: '2026-08-30',
        updatedAt: '2026-08-30T01:00:00.000Z',
      }),
      application({
        id: 'overdue-newer-date',
        company: 'Overdue Two',
        role: 'Engineer',
        nextActionAt: '2026-08-29',
      }),
      application({
        id: 'overdue-older-date',
        company: 'Overdue One',
        role: 'Engineer',
        nextActionAt: '2026-08-28',
      }),
      application({
        id: 'today-new',
        company: 'Today New',
        role: 'Engineer',
        nextActionAt: '2026-08-30',
        updatedAt: '2026-08-30T03:00:00.000Z',
      }),
    ];

    expect(
      focusApplications(items, {
        query: '',
        view: 'all',
        todayKey,
      }).map((item) => item.id),
    ).toEqual([
      'overdue-older-date',
      'overdue-newer-date',
      'today-new',
      'today-old',
      'future',
      'none',
    ]);

    expect(
      focusApplications(items, {
        query: 'today',
        view: 'needs-action',
        todayKey,
      }).map((item) => item.id),
    ).toEqual(['today-new', 'today-old']);
  });
});
