import type { BaseProfile } from './profile-schema';

export function normalizeSkillName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function deriveActiveSkillNames(baseProfile: BaseProfile): string[] {
  const displayByKey = new Map<string, string>();
  const values = [
    ...baseProfile.professional.experiences.flatMap((item) => item.skills ?? []),
    ...baseProfile.professional.projects.flatMap((item) => item.skills),
  ];

  for (const value of values) {
    const display = value.trim().replace(/\s+/g, ' ');
    const key = normalizeSkillName(display);
    if (key === '' || displayByKey.has(key)) continue;
    displayByKey.set(key, display);
  }

  return [...displayByKey.values()];
}

export function isActiveSkillName(
  baseProfile: BaseProfile,
  name: string,
): boolean {
  const key = normalizeSkillName(name);
  if (key === '') return false;
  return deriveActiveSkillNames(baseProfile).some(
    (skillName) => normalizeSkillName(skillName) === key,
  );
}
