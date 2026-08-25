import { describe, expect, it } from 'vitest';

import { extractJobContext } from './job-context';

describe('extractJobContext', () => {
  it('extracts seniority, domains, and only candidate skills present on the page', () => {
    const result = extractJobContext(
      [
        'Senior Backend Engineer - Payments Platform',
        'Build distributed services with Go, Kafka and PostgreSQL.',
      ],
      ['Go', 'Kubernetes', 'Kafka', 'PostgreSQL'],
    );

    expect(result.seniority).toBe('senior');
    expect(result.domains).toEqual(
      expect.arrayContaining([
        'backend',
        'payments',
        'platform',
        'distributed',
      ]),
    );
    expect(result.skills).toEqual(['go', 'kafka', 'postgresql']);
    expect(result.tokens).toContain('engineer');
  });

  it('returns neutral context when signals contain no useful evidence', () => {
    expect(extractJobContext(['Apply now'], ['Go'])).toMatchObject({
      seniority: null,
      skills: [],
      domains: [],
    });
  });
});
