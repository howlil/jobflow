import { describe, expect, it } from 'vitest';

import { createEmptyStoredProfile } from './create-empty-profile';
import { deriveActiveSkillNames, isActiveSkillName } from './derived-skills';

describe('derived skills', () => {
  it('derives unique active skills from experience and projects only', () => {
    const profile = createEmptyStoredProfile();
    profile.baseProfile.professional.skills.push({
      id: 'legacy-only',
      name: 'Legacy Skill',
      level: 'Advanced',
      yearsExperience: 5,
    });
    profile.baseProfile.professional.experiences.push({
      id: 'experience-1',
      company: 'Example',
      title: 'Engineer',
      employmentType: '',
      location: '',
      startDate: '',
      endDate: '',
      current: true,
      description: '',
      achievements: [],
      skills: [' TypeScript ', 'Node.js'],
    });
    profile.baseProfile.professional.projects.push({
      id: 'project-1',
      name: 'Project',
      role: '',
      description: '',
      url: '',
      startDate: '',
      endDate: '',
      skills: ['typescript', ' PostgreSQL  '],
    });

    expect(deriveActiveSkillNames(profile.baseProfile)).toEqual([
      'TypeScript',
      'Node.js',
      'PostgreSQL',
    ]);
    expect(isActiveSkillName(profile.baseProfile, ' TYPESCRIPT ')).toBe(true);
    expect(isActiveSkillName(profile.baseProfile, 'Legacy Skill')).toBe(false);
  });
});
