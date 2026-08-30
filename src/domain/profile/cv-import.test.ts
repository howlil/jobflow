import { describe, expect, it } from 'vitest';

import { createEmptyStoredProfile } from './create-empty-profile';
import { applyCvImport, createCvImportPreview, parseCvText } from './cv-import';

describe('CV import', () => {
  const text = `
Maya Putri
Backend Software Engineer
maya@example.com | +62 812-3456-7890
https://linkedin.com/in/maya-putri https://github.com/mayaputri https://maya.dev

Summary
Backend engineer focused on APIs and distributed systems.

Experience
Software Engineer
Acme Labs
Jan 2024 - Present
Built payment and logistics APIs.

Education
Universitas Example
Bachelor in Computer Science
2020 - 2024

Skills
Go, PostgreSQL, Redis, Docker
`;

  it('extracts skills without presenting them as standalone import candidates', () => {
    const draft = parseCvText(text);
    const values = new Map(draft.values.map((item) => [item.key, item.value]));

    expect(values.get('name')).toBe('Maya Putri');
    expect(values.get('headline')).toBe('Backend Software Engineer');
    expect(values.get('email')).toBe('maya@example.com');
    expect(values.get('linkedin')).toContain('linkedin.com/in/maya-putri');
    expect(values.get('github')).toContain('github.com/mayaputri');
    expect(values.has('skills')).toBe(false);
    expect(draft.skills).toEqual(['Go', 'PostgreSQL', 'Redis', 'Docker']);
    expect(draft.experiences).toHaveLength(1);
    expect(draft.experiences[0]?.title).toBe('Software Engineer');
    expect(draft.experiences[0]?.company).toBe('Acme Labs');
  });

  it('reports conflicts instead of silently overwriting', () => {
    const profile = createEmptyStoredProfile();
    profile.baseProfile.professional.headline = 'Platform Engineer';
    const draft = parseCvText(text);
    const preview = createCvImportPreview(profile, draft);

    expect(preview.find((item) => item.key === 'headline')?.status).toBe(
      'conflict',
    );
    expect(profile.baseProfile.professional.headline).toBe('Platform Engineer');
  });

  it('does not persist standalone skills even if a legacy caller selects them', () => {
    const profile = createEmptyStoredProfile();
    const draft = parseCvText(text);
    let nextId = 0;
    const next = applyCvImport(
      profile,
      draft,
      new Set(['name', 'email', 'skills']),
      () => `generated-${++nextId}`,
    );

    expect(next.baseProfile.personal.legalName.first).toBe('Maya');
    expect(next.baseProfile.personal.legalName.last).toBe('Putri');
    expect(next.baseProfile.contact.emails[0]?.value).toBe('maya@example.com');
    expect(next.baseProfile.professional.skills).toHaveLength(0);
    expect(next.baseProfile.professional.headline).toBe('');
    expect(profile.baseProfile.contact.emails).toHaveLength(0);
  });
});
