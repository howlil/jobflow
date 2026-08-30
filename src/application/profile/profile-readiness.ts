import { deriveActiveSkillNames } from '../../domain/profile/derived-skills';
import type { BaseProfile } from '../../domain/profile/profile-schema';

export type ProfileReadiness = {
  completed: number;
  total: 6;
  percentage: number;
  sections: {
    identity: boolean;
    contact: boolean;
    links: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
};

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function calculateProfileReadiness(
  baseProfile: BaseProfile,
): ProfileReadiness {
  const sections = {
    identity:
      hasText(baseProfile.personal.legalName.first) &&
      hasText(baseProfile.personal.legalName.last),
    contact:
      baseProfile.contact.emails.some((item) => hasText(item.value)) ||
      baseProfile.contact.phones.some((item) => hasText(item.value)) ||
      hasText(baseProfile.contact.whatsapp),
    links:
      hasText(baseProfile.links.linkedin) ||
      hasText(baseProfile.links.github) ||
      hasText(baseProfile.links.portfolio) ||
      baseProfile.links.websites.some((item) => hasText(item.url)) ||
      baseProfile.links.otherProfiles.some((item) => hasText(item.url)),
    experience: baseProfile.professional.experiences.some(
      (item) => hasText(item.company) || hasText(item.title),
    ),
    education: baseProfile.professional.education.some(
      (item) => hasText(item.institution) || hasText(item.degree),
    ),
    skills: deriveActiveSkillNames(baseProfile).length > 0,
  };

  const total = 6 as const;
  const completed = Object.values(sections).filter(Boolean).length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    sections,
  };
}
