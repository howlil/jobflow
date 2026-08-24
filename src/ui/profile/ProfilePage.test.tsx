import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import { ProfilePage } from './ProfilePage';

function createRepository(
  initial: Awaited<ReturnType<ProfileRepository['load']>>,
) {
  const load = vi.fn().mockResolvedValue(initial);
  const save = vi.fn().mockResolvedValue(undefined);
  const repository: ProfileRepository = { load, save };

  return { repository, load, save };
}

describe('ProfilePage', () => {
  it('shows a guided readiness summary for an empty profile', async () => {
    const { repository } = createRepository(null);

    render(<ProfilePage repository={repository} />);

    expect(await screen.findByText('Profile readiness')).not.toBeNull();
    expect(screen.getByText(/sections ready/i)).not.toBeNull();
    expect(screen.getByText('Missing essentials')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: /save profile/i }),
    ).not.toBeNull();
  });

  it('shows compact empty states for profile modules', async () => {
    const { repository } = createRepository(null);

    render(<ProfilePage repository={repository} />);

    expect(await screen.findByText('Experience')).not.toBeNull();
    expect(screen.getByText('No experience added yet.')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: /add experience/i }),
    ).not.toBeNull();
    expect(screen.getByText('No education added yet.')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: /add education/i }),
    ).not.toBeNull();
    expect(screen.getByText('No skills added yet.')).not.toBeNull();
    expect(screen.getByRole('button', { name: /add skill/i })).not.toBeNull();
    expect(
      screen.getByText('No application variants added yet.'),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: /add variant/i })).not.toBeNull();
  });

  it('edits core profile fields and persists them', async () => {
    const { repository, save } = createRepository(null);

    render(<ProfilePage repository={repository} />);

    fireEvent.change(await screen.findByLabelText('First name'), {
      target: { value: 'Ulil' },
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: 'Abshar' },
    });
    fireEvent.change(screen.getByLabelText('Primary email'), {
      target: { value: 'ulil@example.com' },
    });
    fireEvent.change(screen.getByLabelText('LinkedIn'), {
      target: { value: 'https://linkedin.com/in/ulil' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('status').textContent).toBe('Profile saved.');
    const saved = save.mock.calls[0]?.[0];

    expect(saved?.baseProfile.personal.legalName.first).toBe('Ulil');
    expect(saved?.baseProfile.personal.legalName.last).toBe('Abshar');
    expect(saved?.baseProfile.contact.emails[0]?.value).toBe(
      'ulil@example.com',
    );
    expect(saved?.baseProfile.links.linkedin).toBe(
      'https://linkedin.com/in/ulil',
    );
  });

  it('adds career records and a lightweight application variant', async () => {
    const { repository, save } = createRepository(null);

    render(<ProfilePage repository={repository} />);
    await screen.findByLabelText('First name');

    fireEvent.click(screen.getByRole('button', { name: 'Add experience' }));
    fireEvent.change(screen.getByLabelText('Company 1'), {
      target: { value: 'Example Co' },
    });
    fireEvent.change(screen.getByLabelText('Job title 1'), {
      target: { value: 'Software Engineer' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
    fireEvent.change(screen.getByLabelText('Institution 1'), {
      target: { value: 'Universitas Andalas' },
    });
    fireEvent.change(screen.getByLabelText('Degree 1'), {
      target: { value: 'Bachelor' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add skill' }));
    fireEvent.change(screen.getByLabelText('Skill 1'), {
      target: { value: 'TypeScript' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add variant' }));
    fireEvent.change(screen.getByLabelText('Variant name 1'), {
      target: { value: 'Backend Engineer' },
    });
    fireEvent.change(screen.getByLabelText('Variant headline 1'), {
      target: { value: 'Backend Software Engineer' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    const saved = save.mock.calls[0]?.[0];

    expect(saved?.baseProfile.professional.experiences).toHaveLength(1);
    expect(saved?.baseProfile.professional.education).toHaveLength(1);
    expect(saved?.baseProfile.professional.skills).toHaveLength(1);
    expect(saved?.variants).toHaveLength(1);
    expect(saved?.variants[0]).toMatchObject({
      name: 'Backend Engineer',
      headlineOverride: 'Backend Software Engineer',
    });
    expect(saved?.preferences.defaultVariantId).toBe(saved?.variants[0]?.id);
  });

  it('rehydrates a persisted profile', async () => {
    const profile = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
    profile.baseProfile.personal.legalName.first = 'Persisted';
    const { repository } = createRepository(profile);

    render(<ProfilePage repository={repository} />);

    const firstName =
      await screen.findByLabelText<HTMLInputElement>('First name');

    expect(firstName.value).toBe('Persisted');
  });
});
