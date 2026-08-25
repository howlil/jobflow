import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import { PopupPage } from './PopupPage';

function createRepository(
  initial: Awaited<ReturnType<ProfileRepository['load']>>,
): ProfileRepository {
  return {
    load: vi.fn().mockResolvedValue(initial),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function createCompleteProfile() {
  const profile = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
  profile.baseProfile.personal.legalName.first = 'Ulil';
  profile.baseProfile.personal.legalName.last = 'Abshar';
  profile.baseProfile.contact.whatsapp = '+628123456789';
  profile.baseProfile.links.github = 'https://github.com/ulil';
  profile.baseProfile.professional.experiences.push({
    id: 'experience-1',
    company: 'Fillio',
    title: 'Engineer',
    employmentType: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: [],
  });
  profile.baseProfile.professional.education.push({
    id: 'education-1',
    institution: 'Fillio University',
    degree: '',
    fieldOfStudy: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: null,
    maxGpa: null,
    description: '',
  });
  profile.baseProfile.professional.skills.push({
    id: 'skill-1',
    name: 'TypeScript',
    level: '',
    yearsExperience: null,
  });
  return profile;
}

describe('PopupPage', () => {
  it('shows empty readiness and opens profile settings', async () => {
    const openOptions = vi.fn().mockResolvedValue(undefined);

    render(
      <PopupPage
        repository={createRepository(null)}
        openOptions={openOptions}
      />,
    );

    expect(
      await screen.findByText('0 of 6 profile sections ready'),
    ).toBeTruthy();
    expect(screen.getByText('0 application variants')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Complete profile' }));

    await waitFor(() => expect(openOptions).toHaveBeenCalledTimes(1));
  });

  it('guides people to open a job application form when none is detected', async () => {
    render(
      <PopupPage
        repository={createRepository(createCompleteProfile())}
        openOptions={vi.fn()}
      />,
    );

    expect(
      await screen.findByText(/open a job application form/i),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /open profile settings/i }),
    ).toBeTruthy();
  });

  it('shows readiness and variant count from persisted profile data', async () => {
    const profile = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
    profile.baseProfile.personal.legalName.first = 'Ulil';
    profile.baseProfile.personal.legalName.last = 'Abshar';
    profile.baseProfile.contact.whatsapp = '+628123456789';
    profile.baseProfile.professional.skills.push({
      id: 'skill-1',
      name: 'TypeScript',
      level: '',
      yearsExperience: null,
    });
    profile.variants.push({
      id: 'backend',
      name: 'Backend Engineer',
      targetRoles: ['Backend Engineer'],
    });

    render(
      <PopupPage
        repository={createRepository(profile)}
        openOptions={vi.fn()}
      />,
    );

    expect(await screen.findByText('50% ready')).toBeTruthy();
    expect(screen.getByText('1 application variant')).toBeTruthy();
    expect(screen.getByText('Backend Engineer')).toBeTruthy();
  });

  it('limits incomplete-profile essentials to the next three items', async () => {
    render(
      <PopupPage repository={createRepository(null)} openOptions={vi.fn()} />,
    );

    expect(await screen.findByText('Missing essentials')).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBeLessThanOrEqual(3);
  });

  it('shows the current page form analysis summary', async () => {
    render(
      <PopupPage
        repository={createRepository(null)}
        openOptions={vi.fn()}
        pageSummary={{
          ready: 2,
          needsReview: 1,
          sensitive: 1,
          unknown: 3,
          total: 7,
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Current page' }),
    ).toBeTruthy();
    expect(screen.getByText('2 ready')).toBeTruthy();
    expect(screen.getByText('1 needs review')).toBeTruthy();
    expect(screen.getByText('1 sensitive')).toBeTruthy();
    expect(screen.getByText('3 unknown')).toBeTruthy();
  });

  it('allows an explicit per-page variant override and reset to automatic', async () => {
    const profile = createCompleteProfile();
    profile.variants.push(
      {
        id: 'backend',
        name: 'Backend Engineer',
        targetRoles: ['Backend Engineer'],
      },
      {
        id: 'devops',
        name: 'DevOps Engineer',
        targetRoles: ['DevOps Engineer'],
      },
    );
    const onSelectVariant = vi.fn().mockResolvedValue(undefined);

    render(
      <PopupPage
        repository={createRepository(profile)}
        openOptions={vi.fn()}
        variantRecommendation={{
          variantId: 'backend',
          score: 5,
          evidence: ['backend', 'engineer'],
        }}
        activeVariantId="backend"
        variantOptions={[
          { id: 'backend', name: 'Backend Engineer' },
          { id: 'devops', name: 'DevOps Engineer' },
        ]}
        onSelectVariant={onSelectVariant}
      />,
    );

    const selector =
      await screen.findByLabelText<HTMLSelectElement>('Use for this page');
    fireEvent.change(selector, { target: { value: 'devops' } });
    await waitFor(() => expect(onSelectVariant).toHaveBeenCalledWith('devops'));

    fireEvent.click(
      screen.getByRole('button', { name: 'Use automatic recommendation' }),
    );
    await waitFor(() => expect(onSelectVariant).toHaveBeenCalledWith(null));
  });

  it('shows explicit deterministic guidance for each document field', async () => {
    render(
      <PopupPage
        repository={createRepository(createCompleteProfile())}
        openOptions={vi.fn()}
        fileInputCount={3}
        documentFields={[
          {
            fieldFingerprint: 'resume-field',
            fieldLabel: 'Resume / CV',
            intent: 'resume',
            evidence: ['label:resume'],
            recommendedDocument: {
              id: 'resume-1',
              label: 'Backend resume',
              fileName: 'backend.pdf',
            },
          },
          {
            fieldFingerprint: 'cover-field',
            fieldLabel: 'Cover letter',
            intent: 'cover_letter',
            evidence: ['label:cover letter'],
            recommendedDocument: {
              id: 'cover-1',
              label: 'Backend cover',
              fileName: 'backend-cover.pdf',
            },
          },
          {
            fieldFingerprint: 'unknown-file',
            fieldLabel: 'Supporting attachment',
            intent: 'unknown',
            evidence: [],
            recommendedDocument: null,
          },
        ]}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Document upload' }),
    ).toBeTruthy();
    expect(screen.getByText(/attached only when you click Attach/i)).toBeTruthy();
    expect(screen.getByText('Resume / CV')).toBeTruthy();
    expect(screen.getByText(/backend resume/i)).toBeTruthy();
    expect(screen.getAllByText('Cover letter')).toHaveLength(2);
    expect(screen.getByText(/backend cover/i)).toBeTruthy();
    expect(screen.getByText('Supporting attachment')).toBeTruthy();
    expect(
      screen.getAllByText(/unknown document type/i).length,
    ).toBeGreaterThan(0);
  });

  it.each([
    {
      name: 'safe fields',
      pageSummary: {
        ready: 2,
        needsReview: 0,
        sensitive: 0,
        unknown: 0,
        total: 2,
      },
      expectedLabel: 'Prepare fields in settings',
    },
    {
      name: 'review fields',
      pageSummary: {
        ready: 0,
        needsReview: 2,
        sensitive: 0,
        unknown: 0,
        total: 2,
      },
      expectedLabel: 'Prepare fields in settings',
    },
    {
      name: 'sensitive fields',
      pageSummary: {
        ready: 0,
        needsReview: 0,
        sensitive: 2,
        unknown: 0,
        total: 2,
      },
      expectedLabel: 'Manage vault in settings',
    },
  ])(
    'uses a truthful settings CTA when $name are detected',
    async ({ pageSummary, expectedLabel }) => {
      render(
        <PopupPage
          repository={createRepository(createCompleteProfile())}
          openOptions={vi.fn()}
          pageSummary={pageSummary}
        />,
      );

      expect(
        await screen.findByRole('button', { name: expectedLabel }),
      ).toBeTruthy();
      expect(
        screen.queryByRole('button', { name: /fill safe fields/i }),
      ).toBeNull();
      expect(
        screen.queryByRole('button', { name: /review fields/i }),
      ).toBeNull();
      expect(
        screen.queryByRole('button', { name: /open vault settings/i }),
      ).toBeNull();
    },
  );
});
