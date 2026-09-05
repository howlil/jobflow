import type { FieldContext } from './field-context';
import { normalizeFieldText } from '../matching/normalize-field-text';

export type ApplicationPageKind =
  | 'workday'
  | 'google-forms'
  | 'known-ats'
  | 'generic-job-application'
  | 'non-job-page';

export type ApplicationPageClassification = {
  kind: ApplicationPageKind;
  supported: boolean;
  confidence: 'none' | 'medium' | 'high';
  reasons: string[];
};

type ClassificationInput = {
  fields: FieldContext[];
  pageSignals: string[];
};

const KNOWN_ATS_HOSTS = [
  'greenhouse.io',
  'lever.co',
  'ashbyhq.com',
  'smartrecruiters.com',
  'workable.com',
  'icims.com',
  'taleo.net',
  'bamboohr.com',
] as const;

const JOB_PAGE_TERMS = [
  'apply for',
  'job application',
  'application form',
  'career opportunity',
  'candidate application',
  'open position',
  'job opening',
  'lowongan',
  'lamaran kerja',
  'form lamaran',
  'posisi yang dilamar',
] as const;

const EMPLOYMENT_TERMS = [
  'resume',
  'curriculum vitae',
  'cover letter',
  'work experience',
  'employment history',
  'education history',
  'linkedin',
  'notice period',
  'salary expectation',
  'expected salary',
  'visa sponsorship',
  'work authorization',
  'willing to relocate',
  'pengalaman kerja',
  'riwayat pekerjaan',
  'riwayat pendidikan',
  'gaji yang diharapkan',
] as const;

const CANDIDATE_FIELD_GROUPS = [
  ['first name', 'given name', 'nama depan'],
  ['last name', 'family name', 'surname', 'nama belakang'],
  ['email', 'e-mail'],
  ['phone', 'mobile', 'telephone', 'nomor telepon', 'nomor hp'],
  ['linkedin'],
  ['resume', 'curriculum vitae', 'cv'],
] as const;

function normalize(values: string[]): string {
  return normalizeFieldText(values.filter(Boolean).join(' '));
}

function hostnameFor(fields: FieldContext[]): string {
  const origin = fields[0]?.origin;
  if (!origin) return '';
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function hostMatches(hostname: string, suffix: string): boolean {
  return hostname === suffix || hostname.endsWith(`.${suffix}`);
}

function countTermMatches(text: string, terms: readonly string[]): number {
  return terms.reduce(
    (count, term) =>
      text.includes(normalizeFieldText(term)) ? count + 1 : count,
    0,
  );
}

function candidateFieldCoverage(fields: FieldContext[]): number {
  const fieldText = normalize(
    fields.flatMap((field) => [
      field.label,
      field.ariaLabel,
      field.placeholder,
      field.name,
      field.id,
      field.sectionText,
    ]),
  );

  return CANDIDATE_FIELD_GROUPS.reduce(
    (count, aliases) =>
      aliases.some((alias) => fieldText.includes(normalizeFieldText(alias)))
        ? count + 1
        : count,
    0,
  );
}

export function classifyApplicationPage({
  fields,
  pageSignals,
}: ClassificationInput): ApplicationPageClassification {
  if (fields.length === 0) {
    return {
      kind: 'non-job-page',
      supported: false,
      confidence: 'none',
      reasons: ['no-fillable-fields'],
    };
  }

  const hostname = hostnameFor(fields);
  const pageText = normalize(pageSignals);
  const fieldText = normalize(
    fields.flatMap((field) => [
      field.label,
      field.ariaLabel,
      field.placeholder,
      field.name,
      field.id,
      field.sectionText,
    ]),
  );
  const allText = `${pageText} ${fieldText}`.trim();
  const jobPageSignals = countTermMatches(pageText, JOB_PAGE_TERMS);
  const employmentSignals = countTermMatches(allText, EMPLOYMENT_TERMS);
  const candidateFields = candidateFieldCoverage(fields);

  const workday =
    hostMatches(hostname, 'myworkdayjobs.com') ||
    hostMatches(hostname, 'myworkdaysite.com') ||
    hostMatches(hostname, 'workdayjobs.com');
  const googleForms = hostMatches(hostname, 'docs.google.com');
  const knownAts = KNOWN_ATS_HOSTS.some((host) => hostMatches(hostname, host));

  if (
    workday &&
    fields.length >= 2 &&
    (candidateFields >= 2 || employmentSignals > 0)
  ) {
    return {
      kind: 'workday',
      supported: true,
      confidence: 'high',
      reasons: ['workday-host', 'candidate-form-signals'],
    };
  }

  if (
    googleForms &&
    fields.length >= 3 &&
    employmentSignals > 0 &&
    (jobPageSignals > 0 || candidateFields >= 2)
  ) {
    return {
      kind: 'google-forms',
      supported: true,
      confidence: jobPageSignals > 0 ? 'high' : 'medium',
      reasons: ['google-forms-host', 'employment-form-signals'],
    };
  }

  if (
    knownAts &&
    fields.length >= 2 &&
    (employmentSignals > 0 || candidateFields >= 2)
  ) {
    return {
      kind: 'known-ats',
      supported: true,
      confidence: 'high',
      reasons: ['known-ats-host', 'candidate-form-signals'],
    };
  }

  if (
    fields.length >= 2 &&
    candidateFields >= 2 &&
    (employmentSignals > 0 || jobPageSignals > 0)
  ) {
    return {
      kind: 'generic-job-application',
      supported: true,
      confidence:
        employmentSignals > 0 && jobPageSignals > 0 ? 'high' : 'medium',
      reasons: ['generic-form', 'job-and-candidate-signals'],
    };
  }

  return {
    kind: 'non-job-page',
    supported: false,
    confidence: 'none',
    reasons: ['insufficient-job-signals'],
  };
}
