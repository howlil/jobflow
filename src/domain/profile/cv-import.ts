import type { StoredProfileEnvelope } from './profile-schema';

export type CvImportKey =
  | 'name'
  | 'headline'
  | 'summary'
  | 'email'
  | 'phone'
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'experiences'
  | 'education'
  | 'skills';

export type CvImportValue = {
  key: CvImportKey;
  label: string;
  value: string;
  evidence: string;
};

export type CvImportedExperience = {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type CvImportedEducation = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type CvImportDraft = {
  values: CvImportValue[];
  experiences: CvImportedExperience[];
  education: CvImportedEducation[];
  skills: string[];
  rawTextLength: number;
};

export type CvImportPreviewItem = {
  key: CvImportKey;
  label: string;
  extracted: string;
  current: string;
  status: 'new' | 'same' | 'conflict';
  evidence: string;
};

type SectionName = 'summary' | 'experience' | 'education' | 'skills';

const sectionAliases: Record<SectionName, string[]> = {
  summary: ['summary', 'profile', 'professional summary', 'about'],
  experience: [
    'experience',
    'work experience',
    'professional experience',
    'employment',
  ],
  education: ['education', 'academic background', 'academics'],
  skills: ['skills', 'technical skills', 'core skills', 'technologies'],
};

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/;
const urlPattern = /https?:\/\/[^\s)]+|(?:www\.)[^\s)]+/gi;
const dateRangePattern =
  /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\s*\d{4}\s*(?:-|–|—|to)\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\s*\d{4}|present|current)/i;

function compact(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanBullet(value: string): string {
  return compact(value.replace(/^[•●▪◦*-]+\s*/, ''));
}

function normalizedHeading(value: string): string {
  return cleanBullet(value)
    .replace(/[:.]+$/, '')
    .toLowerCase();
}

function splitLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim());
}

function headingFor(line: string): SectionName | null {
  const normalized = normalizedHeading(line);
  for (const [section, aliases] of Object.entries(sectionAliases) as Array<
    [SectionName, string[]]
  >) {
    if (aliases.includes(normalized)) return section;
  }
  return null;
}

function collectSections(lines: string[]): Record<SectionName, string[]> {
  const result: Record<SectionName, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
  };
  let current: SectionName | null = null;

  for (const line of lines) {
    const next = headingFor(line);
    if (next !== null) {
      current = next;
      continue;
    }
    if (current !== null) result[current].push(line);
  }
  return result;
}

function firstUrl(urls: string[], predicate: (url: string) => boolean): string {
  return urls.find(predicate) ?? '';
}

function inferName(lines: string[]): string {
  for (const raw of lines.slice(0, 12)) {
    const line = cleanBullet(raw);
    if (
      line.length >= 3 &&
      line.length <= 80 &&
      !emailPattern.test(line) &&
      !phonePattern.test(line) &&
      !line.includes('http') &&
      !headingFor(line)
    ) {
      return line;
    }
  }
  return '';
}

function inferHeadline(lines: string[], name: string): string {
  const nameIndex = lines.findIndex((line) => cleanBullet(line) === name);
  const candidates = lines.slice(Math.max(0, nameIndex + 1), nameIndex + 6);
  for (const raw of candidates) {
    const line = cleanBullet(raw);
    if (
      line.length >= 3 &&
      line.length <= 120 &&
      !emailPattern.test(line) &&
      !phonePattern.test(line) &&
      !line.includes('http') &&
      headingFor(line) === null
    ) {
      return line;
    }
  }
  return '';
}

function parseSkills(lines: string[]): string[] {
  const values = lines
    .flatMap((line) => line.split(/[,|•·]/))
    .map(cleanBullet)
    .filter((value) => value.length >= 2 && value.length <= 48);
  return [...new Set(values)].slice(0, 80);
}

function parseExperience(lines: string[]): CvImportedExperience[] {
  const nonEmpty = lines.map(cleanBullet).filter(Boolean);
  const results: CvImportedExperience[] = [];

  for (let index = 0; index < nonEmpty.length; index += 1) {
    const line = nonEmpty[index] ?? '';
    if (!dateRangePattern.test(line)) continue;

    const first = nonEmpty[index - 2] ?? '';
    const second = nonEmpty[index - 1] ?? '';
    const after: string[] = [];
    for (let cursor = index + 1; cursor < nonEmpty.length; cursor += 1) {
      const candidate = nonEmpty[cursor] ?? '';
      if (dateRangePattern.test(candidate)) break;
      if (candidate.length > 0) after.push(candidate);
      if (after.length === 4) break;
    }

    const current = /present|current/i.test(line);
    const dates = line.split(/\s*(?:-|–|—|to)\s*/i);
    results.push({
      company: second,
      title: first,
      location: '',
      startDate: compact(dates[0] ?? ''),
      endDate: current ? '' : compact(dates[1] ?? ''),
      current,
      description: after.join(' · '),
    });
  }

  return results.filter((item) => item.company || item.title).slice(0, 20);
}

function parseEducation(lines: string[]): CvImportedEducation[] {
  const nonEmpty = lines.map(cleanBullet).filter(Boolean);
  const results: CvImportedEducation[] = [];

  for (let index = 0; index < nonEmpty.length; index += 1) {
    const line = nonEmpty[index] ?? '';
    if (!dateRangePattern.test(line)) continue;
    const institution = nonEmpty[index - 2] ?? nonEmpty[index - 1] ?? '';
    const degreeLine = nonEmpty[index - 1] ?? '';
    const dates = line.split(/\s*(?:-|–|—|to)\s*/i);
    const degreeParts = degreeLine.split(/\s+(?:in|of)\s+/i);

    results.push({
      institution,
      degree: degreeParts[0] ?? degreeLine,
      fieldOfStudy: degreeParts.slice(1).join(' in '),
      startDate: compact(dates[0] ?? ''),
      endDate: compact(dates[1] ?? ''),
      description: '',
    });
  }

  return results.filter((item) => item.institution || item.degree).slice(0, 12);
}

function addValue(
  values: CvImportValue[],
  key: CvImportKey,
  label: string,
  value: string,
  evidence: string,
): void {
  const normalized = compact(value);
  if (normalized === '') return;
  values.push({ key, label, value: normalized, evidence });
}

export function parseCvText(text: string): CvImportDraft {
  const lines = splitLines(text);
  const nonEmpty = lines.filter(Boolean);
  const sections = collectSections(lines);
  const joined = nonEmpty.join(' ');
  const email = joined.match(emailPattern)?.[0] ?? '';
  const phone = joined.match(phonePattern)?.[0] ?? '';
  const urls = joined.match(urlPattern) ?? [];
  const name = inferName(nonEmpty);
  const headline = inferHeadline(nonEmpty, name);
  const summary = sections.summary
    .map(cleanBullet)
    .filter(Boolean)
    .slice(0, 4)
    .join(' ');
  const skills = parseSkills(sections.skills);
  const experiences = parseExperience(sections.experience);
  const education = parseEducation(sections.education);
  const values: CvImportValue[] = [];

  addValue(values, 'name', 'Name', name, 'first resume header line');
  addValue(values, 'headline', 'Headline', headline, 'resume header');
  addValue(values, 'summary', 'Summary', summary, 'summary section');
  addValue(values, 'email', 'Email', email, 'email syntax');
  addValue(values, 'phone', 'Phone', phone, 'phone syntax');
  addValue(
    values,
    'linkedin',
    'LinkedIn',
    firstUrl(urls, (url) => url.toLowerCase().includes('linkedin.com')),
    'LinkedIn URL',
  );
  addValue(
    values,
    'github',
    'GitHub',
    firstUrl(urls, (url) => url.toLowerCase().includes('github.com')),
    'GitHub URL',
  );
  addValue(
    values,
    'portfolio',
    'Portfolio',
    firstUrl(
      urls,
      (url) =>
        !url.toLowerCase().includes('linkedin.com') &&
        !url.toLowerCase().includes('github.com'),
    ),
    'other URL in resume header',
  );

  if (experiences.length > 0) {
    addValue(
      values,
      'experiences',
      'Experience',
      `${experiences.length} ${experiences.length === 1 ? 'role' : 'roles'}`,
      'experience section + date ranges',
    );
  }
  if (education.length > 0) {
    addValue(
      values,
      'education',
      'Education',
      `${education.length} ${education.length === 1 ? 'record' : 'records'}`,
      'education section + date ranges',
    );
  }
  if (skills.length > 0) {
    addValue(values, 'skills', 'Skills', skills.join(', '), 'skills section');
  }

  return {
    values,
    experiences,
    education,
    skills,
    rawTextLength: text.length,
  };
}

function primaryValue(
  items: StoredProfileEnvelope['baseProfile']['contact']['emails'],
): string {
  return items.find((item) => item.primary)?.value ?? items[0]?.value ?? '';
}

function currentValue(
  profile: StoredProfileEnvelope,
  key: CvImportKey,
): string {
  const base = profile.baseProfile;
  if (key === 'name') {
    return [
      base.personal.legalName.first,
      base.personal.legalName.middle,
      base.personal.legalName.last,
    ]
      .filter(Boolean)
      .join(' ');
  }
  if (key === 'headline') return base.professional.headline;
  if (key === 'summary') return base.professional.summary;
  if (key === 'email') return primaryValue(base.contact.emails);
  if (key === 'phone') return primaryValue(base.contact.phones);
  if (key === 'linkedin') return base.links.linkedin;
  if (key === 'github') return base.links.github;
  if (key === 'portfolio') return base.links.portfolio;
  if (key === 'experiences') {
    return `${base.professional.experiences.length} existing`;
  }
  if (key === 'education') {
    return `${base.professional.education.length} existing`;
  }
  return `${base.professional.skills.length} existing`;
}

export function createCvImportPreview(
  profile: StoredProfileEnvelope,
  draft: CvImportDraft,
): CvImportPreviewItem[] {
  return draft.values.map((value) => {
    const current = currentValue(profile, value.key);
    const normalizedCurrent = compact(current).toLowerCase();
    const normalizedExtracted = compact(value.value).toLowerCase();
    const structured = ['experiences', 'education', 'skills'].includes(
      value.key,
    );
    return {
      key: value.key,
      label: value.label,
      extracted: value.value,
      current,
      status:
        current === '' || (structured && current.startsWith('0 '))
          ? 'new'
          : normalizedCurrent === normalizedExtracted
            ? 'same'
            : 'conflict',
      evidence: value.evidence,
    };
  });
}

function replacePrimaryContact(
  items: StoredProfileEnvelope['baseProfile']['contact']['emails'],
  value: string,
  idFactory: () => string,
): StoredProfileEnvelope['baseProfile']['contact']['emails'] {
  const index = items.findIndex((item) => item.primary);
  if (index < 0) {
    return [
      { id: idFactory(), label: 'Primary', value, primary: true },
      ...items,
    ];
  }
  return items.map((item, itemIndex) =>
    itemIndex === index ? { ...item, value } : item,
  );
}

function applyName(profile: StoredProfileEnvelope, value: string): void {
  const parts = compact(value).split(' ').filter(Boolean);
  profile.baseProfile.personal.legalName.first = parts[0] ?? '';
  profile.baseProfile.personal.legalName.last =
    parts.length > 1 ? (parts.at(-1) ?? '') : '';
  profile.baseProfile.personal.legalName.middle =
    parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
}

export function applyCvImport(
  profile: StoredProfileEnvelope,
  draft: CvImportDraft,
  selected: ReadonlySet<CvImportKey>,
  idFactory: () => string,
): StoredProfileEnvelope {
  const next = structuredClone(profile);
  const byKey = new Map(draft.values.map((value) => [value.key, value.value]));

  if (selected.has('name')) applyName(next, byKey.get('name') ?? '');
  if (selected.has('headline')) {
    next.baseProfile.professional.headline = byKey.get('headline') ?? '';
  }
  if (selected.has('summary')) {
    next.baseProfile.professional.summary = byKey.get('summary') ?? '';
  }
  if (selected.has('email')) {
    next.baseProfile.contact.emails = replacePrimaryContact(
      next.baseProfile.contact.emails,
      byKey.get('email') ?? '',
      idFactory,
    );
  }
  if (selected.has('phone')) {
    next.baseProfile.contact.phones = replacePrimaryContact(
      next.baseProfile.contact.phones,
      byKey.get('phone') ?? '',
      idFactory,
    );
  }
  if (selected.has('linkedin'))
    next.baseProfile.links.linkedin = byKey.get('linkedin') ?? '';
  if (selected.has('github'))
    next.baseProfile.links.github = byKey.get('github') ?? '';
  if (selected.has('portfolio'))
    next.baseProfile.links.portfolio = byKey.get('portfolio') ?? '';

  if (selected.has('experiences')) {
    next.baseProfile.professional.experiences = draft.experiences.map(
      (item) => ({
        id: idFactory(),
        company: item.company,
        title: item.title,
        employmentType: '',
        location: item.location,
        startDate: item.startDate,
        endDate: item.endDate,
        current: item.current,
        description: item.description,
        achievements: [],
      }),
    );
  }

  if (selected.has('education')) {
    next.baseProfile.professional.education = draft.education.map((item) => ({
      id: idFactory(),
      institution: item.institution,
      degree: item.degree,
      fieldOfStudy: item.fieldOfStudy,
      location: '',
      startDate: item.startDate,
      endDate: item.endDate,
      gpa: null,
      maxGpa: null,
      description: item.description,
    }));
  }

  if (selected.has('skills')) {
    next.baseProfile.professional.skills = draft.skills.map((name) => ({
      id: idFactory(),
      name,
      level: '',
      yearsExperience: null,
    }));
  }

  next.metadata.updatedAt = new Date().toISOString();
  return next;
}
