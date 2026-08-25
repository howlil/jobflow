import { describe, expect, it } from 'vitest';

import type { FieldContext } from './field-context';
import { matchField } from '../matching/match-field';

function field(overrides: Partial<FieldContext>): FieldContext {
  return {
    controlKind: 'input',
    inputType: 'text',
    label: '',
    name: '',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-corpus',
    fieldFingerprint: 'field-corpus',
    ...overrides,
  };
}

describe('representative career form corpus', () => {
  it.each([
    ['Given name', 'personal.legalName.first'],
    ['Surname', 'personal.legalName.last'],
    ['E-mail address', 'contact.email.primary'],
    ['Mobile number', 'contact.phone.primary'],
    ['Province', 'contact.address.state'],
    ['Kode pos', 'contact.address.postalCode'],
    ['Personal website', 'links.portfolio'],
    ['Bersedia untuk relokasi', 'jobPreferences.willingToRelocate'],
    ['Tanggal mulai tersedia', 'jobPreferences.availabilityDate'],
  ])('recognizes normal global/local label %s', (label, expectedField) => {
    expect(matchField(field({ label }))).toMatchObject({
      status: 'ready',
      field: expectedField,
      sensitivity: 'normal',
    });
  });

  it.each([
    [
      'Greenhouse-like first name',
      { label: 'First Name', name: 'job_application[first_name]' },
      'personal.legalName.first',
    ],
    [
      'Lever-like email',
      { label: 'Email', name: 'email', placeholder: 'you@example.com' },
      'contact.email.primary',
    ],
    [
      'Workday-like phone',
      { ariaLabel: 'Phone Number', id: 'phone-number' },
      'contact.phone.primary',
    ],
    [
      'Ashby-like LinkedIn',
      { label: 'LinkedIn Profile', name: 'linkedinUrl' },
      'links.linkedin',
    ],
    [
      'SmartRecruiters-like city',
      { label: 'City', name: 'candidate.address.city' },
      'contact.address.city',
    ],
    [
      'Indonesian custom postal code',
      { label: 'Kode Pos', name: 'postal_code' },
      'contact.address.postalCode',
    ],
  ])(
    'recognizes %s without an ATS adapter',
    (_name, context, expectedField) => {
      expect(matchField(field(context))).toMatchObject({
        status: 'ready',
        field: expectedField,
        sensitivity: 'normal',
      });
    },
  );

  it.each([
    ['Tanggal lahir', 'personal.birthDate'],
    ['Tempat lahir', 'personal.birthPlace'],
    ['Jenis kelamin', 'personal.gender'],
    ['Kewarganegaraan', 'personal.nationality'],
    ['Status perkawinan', 'personal.maritalStatus'],
    ['Nomor KTP', 'identity.nationalId'],
    ['NPWP', 'identity.taxId'],
    ['Gaji saat ini', 'compensation.current.amount'],
    ['Visa sponsorship required', 'workEligibility.sponsorshipRequired'],
  ])('classifies sensitive global/local label %s', (label, expectedField) => {
    expect(matchField(field({ label }))).toMatchObject({
      status: 'sensitive',
      field: expectedField,
      sensitivity: 'sensitive',
    });
  });

  it.each([
    { label: 'National ID', name: 'government_id' },
    { label: 'Expected salary', name: 'salaryExpectation' },
    { ariaLabel: 'Date of Birth', name: 'birthDate' },
  ])('keeps ATS-shaped sensitive contexts out of normal Ready', (context) => {
    const result = matchField(field(context));
    expect(result.status).not.toBe('ready');
  });

  it.each(['Resume', 'Upload CV', 'Portfolio file'])(
    'keeps file-like controls fail-closed for %s',
    (label) => {
      expect(
        matchField(field({ label, controlKind: 'file', inputType: 'file' })),
      ).toEqual({ status: 'unknown', reason: 'file-input' });
    },
  );

  it('keeps unsupported ambiguous questions out of Ready', () => {
    expect(
      matchField(
        field({
          label: 'Why do you want to join our company?',
          controlKind: 'textarea',
        }),
      ).status,
    ).not.toBe('ready');
  });
});
