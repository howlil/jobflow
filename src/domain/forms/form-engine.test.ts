import { describe, expect, it } from 'vitest';

import { prepareFillPlan } from '../../application/prepare-fill/prepare-fill-plan';
import { createEmptyStoredProfile } from '../profile/create-empty-profile';
import { matchField } from '../matching/match-field';
import { normalizeFieldText } from '../matching/normalize-field-text';
import type { FieldContext } from './field-context';
import { createFieldFingerprint } from './fingerprints';

function field(overrides: Partial<FieldContext>): FieldContext {
  const seed = {
    controlKind: 'input' as const,
    inputType: 'text',
    label: '',
    name: '',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-1',
    fieldFingerprint: 'field-1',
    ...overrides,
  };

  return seed;
}

describe('form intelligence core', () => {
  it('normalizes unicode, case, punctuation, and repeated whitespace', () => {
    expect(normalizeFieldText('  NÁMA--Depan / First_Name  ')).toBe(
      'nama depan first name',
    );
  });

  it('creates a stable semantic field fingerprint without DOM identity', () => {
    const context = field({
      label: 'First name',
      name: 'candidate[first_name]',
      id: 'generated-123',
      fieldFingerprint: '',
    });

    const first = createFieldFingerprint(context);
    const second = createFieldFingerprint({ ...context, id: 'generated-999' });
    const changed = createFieldFingerprint({ ...context, label: 'Last name' });

    expect(first).toBe(second);
    expect(first).not.toBe(changed);
    expect(first).toMatch(/^fld_[a-z0-9]+$/);
  });

  it.each([
    ['First name', 'personal.legalName.first'],
    ['Nama belakang', 'personal.legalName.last'],
    ['Alamat email', 'contact.email.primary'],
    ['Nomor HP', 'contact.phone.primary'],
    ['Kota domisili', 'contact.address.city'],
    ['LinkedIn profile', 'links.linkedin'],
    ['GitHub URL', 'links.github'],
    ['Professional headline', 'professional.headline'],
    ['Willing to relocate?', 'jobPreferences.willingToRelocate'],
    ['Available from', 'jobPreferences.availabilityDate'],
  ])('maps exact/common alias %s to %s', (label, canonicalField) => {
    const result = matchField(field({ label }));

    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.field).toBe(canonicalField);
      expect(result.reason).toBe('exact-alias');
      expect(result.sensitivity).toBe('normal');
    }
  });

  it('uses structured context signals instead of one label alone', () => {
    const result = matchField(
      field({
        label: 'Contact',
        inputType: 'email',
        name: 'candidate_email_address',
        placeholder: 'you@example.com',
      }),
    );

    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.field).toBe('contact.email.primary');
      expect(result.reason).toBe('structured-heuristic');
    }
  });

  it('returns review when generic wording is genuinely ambiguous', () => {
    const result = matchField(field({ label: 'Name' }));

    expect(result.status).toBe('review');
    if (result.status === 'review') {
      expect(result.candidates.map((candidate) => candidate.field)).toEqual(
        expect.arrayContaining([
          'personal.legalName.first',
          'personal.legalName.last',
        ]),
      );
    }
  });

  it('classifies sensitive fields separately from normal ready fields', () => {
    expect(matchField(field({ label: 'Date of birth' }))).toEqual({
      status: 'sensitive',
      field: 'personal.birthDate',
      reason: 'exact-sensitive-alias',
      sensitivity: 'sensitive',
    });

    expect(matchField(field({ label: 'NIK' }))).toEqual({
      status: 'sensitive',
      field: 'identity.nationalId',
      reason: 'exact-sensitive-alias',
      sensitivity: 'sensitive',
    });

    expect(matchField(field({ label: 'Expected salary' }))).toEqual({
      status: 'sensitive',
      field: 'compensation.expected.amount',
      reason: 'exact-sensitive-alias',
      sensitivity: 'sensitive',
    });
  });

  it('fails closed for file fields', () => {
    expect(
      matchField(
        field({ controlKind: 'file', inputType: 'file', label: 'CV' }),
      ),
    ).toEqual({ status: 'unknown', reason: 'file-input' });
  });

  it('leaves unrelated fields unknown', () => {
    expect(
      matchField(field({ label: 'Favorite fictional character' })),
    ).toEqual({ status: 'unknown', reason: 'no-match' });
  });

  it('prepares an explicit fill plan without authorizing review, sensitive, unknown, or missing values', () => {
    const stored = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
    const profile = stored.baseProfile;
    profile.personal.legalName.first = 'Ulil';
    profile.contact.emails = [
      {
        id: 'email-1',
        label: 'Primary',
        value: 'ulil@example.com',
        primary: true,
      },
    ];
    profile.jobPreferences.willingToRelocate = true;
    profile.jobPreferences.availabilityDate = '2026-09-01';

    const contexts = [
      field({ fieldFingerprint: 'first', label: 'First name' }),
      field({
        fieldFingerprint: 'email',
        label: 'Email',
        inputType: 'email',
      }),
      field({
        fieldFingerprint: 'relocate',
        controlKind: 'checkbox',
        inputType: 'checkbox',
        label: 'Willing to relocate?',
      }),
      field({
        fieldFingerprint: 'available',
        inputType: 'date',
        label: 'Available from',
      }),
      field({ fieldFingerprint: 'ambiguous', label: 'Name' }),
      field({ fieldFingerprint: 'birth-date', label: 'Date of birth' }),
      field({ fieldFingerprint: 'unknown', label: 'Favorite color' }),
      field({ fieldFingerprint: 'missing', label: 'GitHub URL' }),
    ];

    const analysis = contexts.map((context) => ({
      context,
      match: matchField(context),
    }));
    const plan = prepareFillPlan(analysis, profile);

    expect(plan.ready).toEqual([
      expect.objectContaining({
        fieldFingerprint: 'first',
        field: 'personal.legalName.first',
        value: 'Ulil',
      }),
      expect.objectContaining({
        fieldFingerprint: 'email',
        field: 'contact.email.primary',
        value: 'ulil@example.com',
      }),
      expect.objectContaining({
        fieldFingerprint: 'relocate',
        value: true,
      }),
      expect.objectContaining({
        fieldFingerprint: 'available',
        value: '2026-09-01',
      }),
    ]);
    expect(plan.needsReview).toHaveLength(1);
    expect(plan.sensitive.map((item) => item.context.fieldFingerprint)).toEqual(
      ['birth-date'],
    );
    expect(plan.unknown.map((item) => item.context.fieldFingerprint)).toEqual(
      expect.arrayContaining(['unknown', 'missing']),
    );
  });
});
