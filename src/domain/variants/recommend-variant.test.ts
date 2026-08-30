import { describe, expect, it } from 'vitest';

import { createEmptyStoredProfile } from '../profile/create-empty-profile';
import type { ApplicationVariant } from '../profile/profile-schema';
import { recommendApplicationVariant } from './recommend-variant';

const variants: ApplicationVariant[] = [
  {
    id: 'backend',
    name: 'Backend Engineer',
    targetRoles: ['Backend Engineer'],
  },
  { id: 'devops', name: 'DevOps Engineer', targetRoles: ['DevOps Engineer'] },
];

describe('recommendApplicationVariant', () => {
  it('prefers the variant whose deterministic keywords match the page', () => {
    const result = recommendApplicationVariant(
      variants,
      ['Senior Backend Engineer', 'Go PostgreSQL Kafka'],
      'devops',
    );

    expect(result.variantId).toBe('backend');
    expect(result.score).toBeGreaterThan(0);
    expect(result.evidence).toContain('backend');
  });

  it('uses emphasized active skills as stronger evidence than generic role overlap', () => {
    const stored = createEmptyStoredProfile();
    stored.baseProfile.professional.skills = [
      { id: 'go', name: 'Go', level: '', yearsExperience: null },
      {
        id: 'kubernetes',
        name: 'Kubernetes',
        level: '',
        yearsExperience: null,
      },
    ];
    stored.baseProfile.professional.projects.push({
      id: 'platform-project',
      name: 'Platform project',
      role: '',
      description: '',
      url: '',
      startDate: '',
      endDate: '',
      skills: ['Kubernetes'],
    });
    const roleVariants: ApplicationVariant[] = [
      {
        id: 'backend-go',
        name: 'Software Engineer',
        targetRoles: ['Software Engineer'],
        emphasizedSkillIds: ['go'],
      },
      {
        id: 'platform-k8s',
        name: 'Software Engineer',
        targetRoles: ['Software Engineer'],
        emphasizedSkillIds: ['kubernetes'],
      },
    ];

    const result = recommendApplicationVariant(
      roleVariants,
      ['Software Engineer - Platform', 'Kubernetes infrastructure'],
      'backend-go',
      stored.baseProfile,
    );

    expect(result.variantId).toBe('platform-k8s');
    expect(result.evidence).toContain('skill:kubernetes');
  });

  it('ignores emphasized compatibility-registry skills that are not linked to career records', () => {
    const stored = createEmptyStoredProfile();
    stored.baseProfile.professional.skills = [
      {
        id: 'kubernetes',
        name: 'Kubernetes',
        level: 'Advanced',
        yearsExperience: 5,
      },
    ];
    const roleVariants: ApplicationVariant[] = [
      {
        id: 'default',
        name: 'Software Engineer',
        targetRoles: ['Software Engineer'],
      },
      {
        id: 'platform',
        name: 'Software Engineer',
        targetRoles: ['Software Engineer'],
        emphasizedSkillIds: ['kubernetes'],
      },
    ];

    const result = recommendApplicationVariant(
      roleVariants,
      ['Software Engineer', 'Kubernetes infrastructure'],
      'default',
      stored.baseProfile,
    );

    expect(result.variantId).toBe('default');
    expect(result.evidence).not.toContain('skill:kubernetes');
  });

  it('uses seniority evidence to break otherwise identical role matches', () => {
    const roleVariants: ApplicationVariant[] = [
      {
        id: 'backend',
        name: 'Backend Engineer',
        targetRoles: ['Backend Engineer'],
      },
      {
        id: 'senior-backend',
        name: 'Senior Backend Engineer',
        targetRoles: ['Senior Backend Engineer'],
      },
    ];

    const result = recommendApplicationVariant(
      roleVariants,
      ['Senior Backend Engineer', 'Build distributed backend services'],
      'backend',
    );

    expect(result.variantId).toBe('senior-backend');
    expect(result.evidence).toContain('seniority:senior');
  });

  it('falls back to the configured default when there is no evidence', () => {
    const result = recommendApplicationVariant(
      variants,
      ['Unrelated application'],
      'devops',
    );

    expect(result).toEqual({ variantId: 'devops', score: 0, evidence: [] });
  });

  it('returns null when no variants exist', () => {
    expect(recommendApplicationVariant([], ['Backend Engineer'], null)).toEqual(
      {
        variantId: null,
        score: 0,
        evidence: [],
      },
    );
  });
});
