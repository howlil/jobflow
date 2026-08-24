import { describe, expect, it } from 'vitest';

import type { FieldContext } from '../../domain/forms/field-context';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import { analyzeFieldContexts } from './analyze-field-contexts';

function field(label: string, fingerprint: string): FieldContext {
  return {
    controlKind: 'input',
    inputType: 'text',
    label,
    name: '',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-1',
    fieldFingerprint: fingerprint,
  };
}

describe('analyzeFieldContexts', () => {
  it('returns an explicit fill plan and page summary', () => {
    const profile = createEmptyStoredProfile(
      '2026-08-13T00:00:00.000Z',
    ).baseProfile;
    profile.personal.legalName.first = 'Ulil';
    profile.contact.emails = [
      {
        id: 'email-1',
        label: 'Primary',
        value: 'ulil@example.com',
        primary: true,
      },
    ];

    const result = analyzeFieldContexts(
      [
        field('First name', 'first'),
        { ...field('Email', 'email'), inputType: 'email' },
        field('Name', 'review'),
        field('Date of birth', 'birth-date'),
        field('Favorite color', 'unknown'),
        field('GitHub URL', 'missing'),
      ],
      profile,
    );

    expect(result.plan.ready).toHaveLength(2);
    expect(result.plan.needsReview).toHaveLength(1);
    expect(result.plan.sensitive).toHaveLength(1);
    expect(result.plan.unknown).toHaveLength(2);
    expect(result.summary).toEqual({
      ready: 2,
      needsReview: 1,
      sensitive: 1,
      unknown: 2,
      total: 6,
    });
  });
});
