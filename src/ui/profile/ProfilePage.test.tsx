import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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
  it('autosaves the latest ordinary profile change after a quiet period', async () => {
    const { repository, save } = createRepository(null);

    render(<ProfilePage repository={repository} activeSection="personal" />);

    const firstName =
      await screen.findByLabelText<HTMLInputElement>('First name');
    const saveIndicator = document.querySelector('.profile-save-indicator');
    expect(screen.getByRole('status').textContent).toBe('All changes saved.');
    expect(saveIndicator?.getAttribute('data-state')).toBe('clean');
    expect(screen.getByTitle('Save profile now')).not.toBeNull();

    vi.useFakeTimers();
    try {
      fireEvent.change(firstName, { target: { value: 'D' } });
      fireEvent.change(firstName, { target: { value: 'Draft' } });

      expect(screen.getByRole('status').textContent).toBe('Changes pending.');
      expect(saveIndicator?.getAttribute('data-state')).toBe('dirty');
      expect(save).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(799));
      expect(save).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(save).toHaveBeenCalledTimes(1);
      expect(save.mock.calls[0]?.[0].baseProfile.personal.legalName.first).toBe(
        'Draft',
      );
      expect(screen.getByRole('status').textContent).toBe('Profile saved.');
      expect(saveIndicator?.getAttribute('data-state')).toBe('saved');
    } finally {
      vi.useRealTimers();
    }
  });

  it('autosaves within the maximum wait while edits keep arriving', async () => {
    const { repository, save } = createRepository(null);

    render(<ProfilePage repository={repository} activeSection="personal" />);
    const firstName =
      await screen.findByLabelText<HTMLInputElement>('First name');

    vi.useFakeTimers();
    try {
      for (let index = 0; index < 7; index += 1) {
        fireEvent.change(firstName, { target: { value: `Draft ${index}` } });
        await act(() => vi.advanceTimersByTimeAsync(700));
      }

      expect(save).not.toHaveBeenCalled();
      await act(() => vi.advanceTimersByTimeAsync(100));

      expect(save).toHaveBeenCalledTimes(1);
      expect(save.mock.calls[0]?.[0].baseProfile.personal.legalName.first).toBe(
        'Draft 6',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('coalesces edits made during a pending autosave', async () => {
    let resolveFirstSave: (() => void) | undefined;
    const firstSave = new Promise<void>((resolve) => {
      resolveFirstSave = resolve;
    });
    const { repository, save } = createRepository(null);
    save
      .mockImplementationOnce(() => firstSave)
      .mockResolvedValueOnce(undefined);

    render(<ProfilePage repository={repository} activeSection="personal" />);
    const firstName =
      await screen.findByLabelText<HTMLInputElement>('First name');

    vi.useFakeTimers();
    try {
      fireEvent.change(firstName, { target: { value: 'First draft' } });
      await act(() => vi.advanceTimersByTimeAsync(800));
      expect(save).toHaveBeenCalledTimes(1);

      fireEvent.change(firstName, { target: { value: 'Latest draft' } });
      await act(async () => resolveFirstSave?.());

      expect(save).toHaveBeenCalledTimes(2);
      expect(save.mock.calls[1]?.[0].baseProfile.personal.legalName.first).toBe(
        'Latest draft',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps failed autosave changes available for a manual retry', async () => {
    const { repository, save } = createRepository(null);
    save
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValueOnce(undefined);

    render(<ProfilePage repository={repository} activeSection="personal" />);
    const firstName =
      await screen.findByLabelText<HTMLInputElement>('First name');

    vi.useFakeTimers();
    try {
      fireEvent.change(firstName, { target: { value: 'Retained draft' } });
      await act(() => vi.advanceTimersByTimeAsync(800));

      expect(screen.getByRole('alert').textContent).toBe(
        'Could not save your profile.',
      );
      expect(screen.getByRole('status').textContent).toBe(
        'Autosave failed. Use Save profile to retry.',
      );

      fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
      await act(async () => undefined);

      expect(save).toHaveBeenCalledTimes(2);
      expect(save.mock.calls[1]?.[0].baseProfile.personal.legalName.first).toBe(
        'Retained draft',
      );
      expect(screen.getByRole('status').textContent).toBe('Profile saved.');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows a guided readiness summary for an empty profile', async () => {
    const { repository } = createRepository(null);

    render(<ProfilePage repository={repository} activeSection="overview" />);

    expect(await screen.findByText('Profile readiness')).not.toBeNull();
    expect(screen.getByText(/sections ready/i)).not.toBeNull();
    expect(
      screen.getByText(
        'Start with name, email, and phone so Fillio can safely handle the common required fields.',
      ),
    ).not.toBeNull();
    expect(screen.getByText('Missing essentials')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Start with personal data' }),
    ).not.toBeNull();
    expect(screen.getByLabelText('First name').closest('section')?.hidden).toBe(
      true,
    );
    expect(
      screen.getByRole('button', { name: /save profile/i }),
    ).not.toBeNull();
  });

  it('shows only the selected form category', async () => {
    const { repository } = createRepository(null);
    const { rerender } = render(
      <ProfilePage repository={repository} activeSection="personal" />,
    );

    expect(await screen.findByLabelText('First name')).not.toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'Add experience', hidden: true })
        .closest('section')?.hidden,
    ).toBe(true);

    rerender(
      <ProfilePage repository={repository} activeSection="experience" />,
    );

    expect(screen.getByLabelText('First name').closest('section')?.hidden).toBe(
      true,
    );
    expect(
      screen.getByRole('button', { name: 'Add experience' }),
    ).not.toBeNull();
  });

  it('shows compact empty states for core profile modules', async () => {
    const { repository } = createRepository(null);

    const { rerender } = render(
      <ProfilePage repository={repository} activeSection="experience" />,
    );

    expect(await screen.findByText('Experience')).not.toBeNull();
    expect(screen.getByText('No experience added yet.')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: /add experience/i }),
    ).not.toBeNull();
    rerender(<ProfilePage repository={repository} activeSection="education" />);
    expect(screen.getByText('No education added yet.')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: /add education/i }),
    ).not.toBeNull();
    rerender(<ProfilePage repository={repository} activeSection="skills" />);
    expect(screen.getByText('No skills added yet.')).not.toBeNull();
    expect(screen.getByRole('button', { name: /add skill/i })).not.toBeNull();
    rerender(<ProfilePage repository={repository} activeSection="variants" />);
    expect(
      screen.getByText('No application variants added yet.'),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: /add variant/i })).not.toBeNull();
  });

  it('edits core profile fields and persists them', async () => {
    const { repository, save } = createRepository(null);

    const { rerender } = render(<ProfilePage repository={repository} />);

    fireEvent.change(await screen.findByLabelText('First name'), {
      target: { value: 'Ulil' },
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: 'Abshar' },
    });

    rerender(<ProfilePage repository={repository} activeSection="contact" />);
    fireEvent.change(screen.getByLabelText('Primary email'), {
      target: { value: 'ulil@example.com' },
    });

    rerender(<ProfilePage repository={repository} activeSection="links" />);
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

  it('adds richer career records, preferences, documents, and a variant', async () => {
    const { repository, save } = createRepository(null);

    const { rerender } = render(
      <ProfilePage repository={repository} activeSection="personal" />,
    );
    await screen.findByLabelText('First name');

    rerender(
      <ProfilePage repository={repository} activeSection="experience" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add experience' }));
    fireEvent.change(screen.getByLabelText('Company'), {
      target: { value: 'Example Co' },
    });
    fireEvent.change(screen.getByLabelText('Job title'), {
      target: { value: 'Software Engineer' },
    });
    fireEvent.change(screen.getByLabelText('Employment type'), {
      target: { value: 'Full-time' },
    });

    rerender(<ProfilePage repository={repository} activeSection="education" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
    fireEvent.change(screen.getByLabelText('Institution'), {
      target: { value: 'Universitas Andalas' },
    });
    fireEvent.change(screen.getByLabelText('Degree'), {
      target: { value: 'Bachelor' },
    });

    rerender(<ProfilePage repository={repository} activeSection="skills" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add skill' }));
    fireEvent.change(screen.getByLabelText('Skill'), {
      target: { value: 'TypeScript' },
    });

    rerender(
      <ProfilePage repository={repository} activeSection="preferences" />,
    );
    fireEvent.change(screen.getByLabelText('Desired roles, comma separated'), {
      target: { value: 'Backend Engineer, Software Engineer' },
    });

    rerender(<ProfilePage repository={repository} activeSection="documents" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add resume' }));
    fireEvent.change(screen.getByLabelText('Label'), {
      target: { value: 'Backend resume' },
    });
    fireEvent.change(screen.getByLabelText('File name'), {
      target: { value: 'backend.pdf' },
    });

    rerender(<ProfilePage repository={repository} activeSection="variants" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add variant' }));
    fireEvent.change(screen.getByLabelText('Variant name'), {
      target: { value: 'Backend Engineer' },
    });
    fireEvent.change(screen.getByLabelText('Target roles, comma separated'), {
      target: { value: 'Backend Engineer' },
    });
    fireEvent.change(screen.getByLabelText('Variant headline'), {
      target: { value: 'Backend Software Engineer' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    const saved = save.mock.calls[0]?.[0];

    expect(saved?.baseProfile.professional.experiences[0]).toMatchObject({
      company: 'Example Co',
      title: 'Software Engineer',
      employmentType: 'Full-time',
    });
    expect(saved?.baseProfile.professional.education).toHaveLength(1);
    expect(saved?.baseProfile.professional.skills).toHaveLength(1);
    expect(saved?.baseProfile.jobPreferences.desiredRoles).toEqual([
      'Backend Engineer',
      'Software Engineer',
    ]);
    expect(saved?.baseProfile.documents.resumes[0]).toMatchObject({
      label: 'Backend resume',
      fileName: 'backend.pdf',
    });
    expect(saved?.variants).toHaveLength(1);
    expect(saved?.variants[0]).toMatchObject({
      name: 'Backend Engineer',
      targetRoles: ['Backend Engineer'],
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
