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

    fireEvent.click(
      screen.getByRole('button', { name: 'Open profile settings' }),
    );

    await waitFor(() => expect(openOptions).toHaveBeenCalledTimes(1));
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
});
