export type JobSeniority =
  | 'intern'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'staff'
  | 'principal';

export type JobContext = {
  tokens: string[];
  skills: string[];
  domains: string[];
  seniority: JobSeniority | null;
};

const DOMAIN_TERMS = [
  'backend',
  'frontend',
  'fullstack',
  'platform',
  'infrastructure',
  'cloud',
  'devops',
  'sre',
  'security',
  'data',
  'mobile',
  'payments',
  'fintech',
  'distributed',
] as const;

const SENIORITY_ALIASES: Array<[JobSeniority, string[]]> = [
  ['principal', ['principal']],
  ['staff', ['staff']],
  ['lead', ['lead', 'tech lead', 'technical lead']],
  ['senior', ['senior', 'sr']],
  ['mid', ['mid', 'middle', 'intermediate']],
  ['junior', ['junior', 'jr', 'entry level', 'entry-level']],
  ['intern', ['intern', 'internship']],
];

export function normalizeJobText(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsPhrase(haystack: string, needle: string): boolean {
  const normalizedNeedle = normalizeJobText(needle);
  if (normalizedNeedle === '') return false;
  return ` ${haystack} `.includes(` ${normalizedNeedle} `);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function extractJobContext(
  pageSignals: string[],
  candidateSkills: string[] = [],
): JobContext {
  const normalizedSignals = pageSignals.map(normalizeJobText).filter(Boolean);
  const combined = normalizedSignals.join(' ');
  const tokens = unique(
    normalizedSignals
      .flatMap((signal) => signal.split(/\s+/))
      .filter((token) => token.length >= 2),
  );

  const skills = unique(
    candidateSkills
      .map(normalizeJobText)
      .filter((skill) => skill !== '' && containsPhrase(combined, skill)),
  );

  const domains = DOMAIN_TERMS.filter((domain) =>
    containsPhrase(combined, domain),
  );

  const seniority =
    SENIORITY_ALIASES.find(([, aliases]) =>
      aliases.some((alias) => containsPhrase(combined, alias)),
    )?.[0] ?? null;

  return { tokens, skills, domains, seniority };
}
