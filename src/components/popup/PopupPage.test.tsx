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

function createProfileWithVariants() {
  const profile = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
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
  return profile;
}

describe('PopupPage', () => {
  it('stays a compact entry surface and opens the workspace', async () => {
    const openOptions = vi.fn().mockResolvedValue(undefined);

    render(
      <PopupPage
        repository={createRepository(null)}
        openOptions={openOptions}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Current application' }),
    ).toBeTruthy();
    expect(screen.getByText('Using your base career profile.')).toBeTruthy();
    expect(screen.queryByText(/% ready/i)).toBeNull();
    expect(screen.queryByText(/missing essentials/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Open workspace' }));
    await waitFor(() => expect(openOptions).toHaveBeenCalledTimes(1));
  });

  it('guides people to open a job application form when none is detected', async () => {
    render(
      <PopupPage
        repository={createRepository(createEmptyStoredProfile())}
        openOptions={vi.fn()}
      />,
    );

    expect(
      await screen.findByText(/open a job application form/i),
    ).toBeTruthy();
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
    const profile = createProfileWithVariants();
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

    expect(await screen.findByText('Recommended')).toBeTruthy();
    expect(screen.getAllByText('Backend Engineer').length).toBeGreaterThan(0);

    const selector =
      screen.getByLabelText<HTMLSelectElement>('Use for this page');
    fireEvent.change(selector, { target: { value: 'devops' } });
    await waitFor(() => expect(onSelectVariant).toHaveBeenCalledWith('devops'));

    fireEvent.click(
      screen.getByRole('button', { name: 'Use automatic recommendation' }),
    );
    await waitFor(() => expect(onSelectVariant).toHaveBeenCalledWith(null));
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
      expectedLabel: 'Prepare fields in workspace',
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
      expectedLabel: 'Prepare fields in workspace',
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
      expectedLabel: 'Manage vault in workspace',
    },
  ])(
    'uses a truthful workspace CTA when $name are detected',
    async ({ pageSummary, expectedLabel }) => {
      render(
        <PopupPage
          repository={createRepository(createEmptyStoredProfile())}
          openOptions={vi.fn()}
          pageSummary={pageSummary}
        />,
      );

      expect(
        await screen.findByRole('button', { name: expectedLabel }),
      ).toBeTruthy();
    },
  );
});
