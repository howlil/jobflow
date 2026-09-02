import { describe, expect, it } from 'vitest';

import { analyzeFieldContexts } from '../../application/forms/analyze-field-contexts';
import { reusableAnswerCorrectionTarget } from '../corrections/correction-schema';
import type { FieldContext } from './field-context';
import { createEmptyStoredProfile } from '../profile/create-empty-profile';

function field(
  label: string,
  overrides: Partial<FieldContext> = {},
): FieldContext {
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
    formFingerprint: 'form-coverage',
    fieldFingerprint: `field-${label.toLowerCase().replace(/\s+/g, '-')}`,
    ...overrides,
  };
}

describe('core autofill coverage', () => {
  it('fills safe scalar profile values that were previously unreachable', () => {
    const profile = createEmptyStoredProfile(
      '2026-09-03T00:00:00.000Z',
    ).baseProfile;
    profile.contact.address.line1 = '123 Example Street';
    profile.contact.address.line2 = 'Unit 5';
    profile.professional.summary =
      'Backend engineer focused on reliable systems.';
    profile.jobPreferences.noticePeriod = '30 days';

    const analysis = analyzeFieldContexts(
      [
        field('Street address'),
        field('Address line 2'),
        field('Professional summary', { controlKind: 'textarea' }),
        field('Notice period'),
      ],
      profile,
    );

    expect(analysis.plan.ready).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'contact.address.line1',
          value: '123 Example Street',
        }),
        expect.objectContaining({
          field: 'contact.address.line2',
          value: 'Unit 5',
        }),
        expect.objectContaining({
          field: 'professional.summary',
          value: 'Backend engineer focused on reliable systems.',
        }),
        expect.objectContaining({
          field: 'jobPreferences.noticePeriod',
          value: '30 days',
        }),
      ]),
    );
  });

  it('promotes only exact reusable questions to Ready', () => {
    const profile = createEmptyStoredProfile(
      '2026-09-03T00:00:00.000Z',
    ).baseProfile;
    profile.customAnswers = [
      {
        id: 'motivation',
        question: 'Why do you want this role?',
        answer: 'I want to build reliable products with this team.',
        canonicalIntent: 'application.motivation.role',
        tags: ['Role motivation'],
      },
    ];

    const analysis = analyzeFieldContexts(
      [field('Why do you want this role?', { controlKind: 'textarea' })],
      profile,
    );

    expect(analysis.plan.ready).toEqual([
      expect.objectContaining({
        field: 'customAnswer:motivation',
        value: 'I want to build reliable products with this team.',
      }),
    ]);
    expect(analysis.plan.needsReview).toHaveLength(0);
  });

  it('keeps similar reusable questions in Review rather than auto-filling', () => {
    const profile = createEmptyStoredProfile(
      '2026-09-03T00:00:00.000Z',
    ).baseProfile;
    profile.customAnswers = [
      {
        id: 'motivation',
        question: 'Why do you want this role?',
        answer: 'Reusable answer',
        canonicalIntent: 'application.motivation.role',
        tags: [],
      },
    ];

    const analysis = analyzeFieldContexts(
      [
        field('Why do you want this role at our company?', {
          controlKind: 'textarea',
        }),
      ],
      profile,
    );

    expect(analysis.plan.ready).toHaveLength(0);
    expect(analysis.plan.needsReview).toHaveLength(1);
    expect(analysis.plan.needsReview[0]?.match.status).toBe('review-answer');
  });

  it('never lets reusable answers override sensitive classification', () => {
    const profile = createEmptyStoredProfile(
      '2026-09-03T00:00:00.000Z',
    ).baseProfile;
    profile.customAnswers = [
      {
        id: 'salary',
        question: 'Expected salary',
        answer: '100000',
        canonicalIntent: 'compensation.expected',
        tags: [],
      },
    ];

    const analysis = analyzeFieldContexts([field('Expected salary')], profile);

    expect(analysis.plan.ready).toHaveLength(0);
    expect(analysis.plan.sensitive).toHaveLength(1);
  });

  it('uses an explicit local correction to teach an unknown field', () => {
    const profile = createEmptyStoredProfile(
      '2026-09-03T00:00:00.000Z',
    ).baseProfile;
    profile.customAnswers = [
      {
        id: 'motivation',
        question: 'Why this role?',
        answer: 'Because the role matches my experience.',
        canonicalIntent: 'application.motivation.role',
        tags: [],
      },
    ];
    const context = field('Motivation statement');

    const analysis = analyzeFieldContexts(context ? [context] : [], profile, [
      {
        origin: context.origin,
        formFingerprint: context.formFingerprint,
        fieldFingerprint: context.fieldFingerprint,
        target: reusableAnswerCorrectionTarget('motivation'),
        updatedAt: '2026-09-03T00:00:00.000Z',
      },
    ]);

    expect(analysis.plan.ready).toEqual([
      expect.objectContaining({
        field: 'customAnswer:motivation',
        value: 'Because the role matches my experience.',
      }),
    ]);
  });
});
