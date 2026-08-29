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

function visibleInputByLabel(label: string): HTMLInputElement {
  const input = screen
    .getAllByLabelText<HTMLInputElement>(label)
    .find((element) => element.closest('section')?.hidden === false);

  if (input === undefined) {
    throw new Error(`Could not find visible input for ${label}`);
  }

  return input;
}

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
    expect(screen.queryByRole('button', { name: 'Save profile' })).toBeNull();

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
        'Autosave failed. Edit again to retry.',
      );

      fireEvent.change(firstName, { target: { value: 'Retained draft v2' } });
      await act(() => vi.advanceTimersByTimeAsync(800));

      expect(save).toHaveBeenCalledTimes(2);
      expect(save.mock.calls[1]?.[0].baseProfile.personal.legalName.first).toBe(
        'Retained draft v2',
      );
      expect(screen.getByRole('status').textContent).toBe('Profile saved.');
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens directly on combined personal, contact, and link details', async () => {
    const { repository } = createRepository(null);

    render(<ProfilePage repository={repository} activeSection="personal" />);

    expect(await screen.findByLabelText('First name')).not.toBeNull();
    expect(screen.getByLabelText('Primary email')).not.toBeNull();
    expect(screen.getByLabelText('LinkedIn')).not.toBeNull();
    expect(screen.queryByText('Profile readiness')).toBeNull();
    expect(screen.queryByRole('button', { name: /save profile/i })).toBeNull();
  });

  it('shows only the selected form category', async () => {
    const { repository } = createRepository(null);
    const { rerender } = render(
      <ProfilePage repository={repository} activeSection="personal" />,
    );

    expect(await screen.findByLabelText('First name')).not.toBeNull();
    expect(
      screen.getByLabelText('Primary email').closest('section')?.hidden,
    ).toBe(false);
    expect(screen.getByLabelText('LinkedIn').closest('section')?.hidden).toBe(
      false,
    );
    expect(
      screen.getByRole('button', { name: 'Add experience', hidden: true }),
    ).not.toBeNull();

    rerender(
      <ProfilePage repository={repository} activeSection="experience" />,
    );

    expect(screen.getByLabelText('First name').closest('section')?.hidden).toBe(
      true,
    );
    expect(
      screen.getByLabelText('Primary email').closest('section')?.hidden,
    ).toBe(true);
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

    render(<ProfilePage repository={repository} />);
    await screen.findByLabelText('First name');

    vi.useFakeTimers();
    try {
      fireEvent.change(screen.getByLabelText('First name'), {
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

      await act(() => vi.advanceTimersByTimeAsync(800));
    } finally {
      vi.useRealTimers();
    }
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
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

  it('adds richer career records, preferences, reusable answers, and a variant', async () => {
    const { repository, save } = createRepository(null);

    const { rerender } = render(
      <ProfilePage repository={repository} activeSection="personal" />,
    );
    await screen.findByLabelText('First name');

    vi.useFakeTimers();
    try {
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
      fireEvent.change(screen.getByLabelText('Start date'), {
        target: { value: '01/02/2024' },
      });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: '- Built internal tooling\n- Reduced manual work' },
      });
      fireEvent.change(
        screen.getByLabelText('Related skills, comma separated'),
        {
          target: { value: 'TypeScript, React' },
        },
      );

      rerender(
        <ProfilePage repository={repository} activeSection="education" />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add education' }));
      fireEvent.change(screen.getByLabelText('Institution'), {
        target: { value: 'Universitas Andalas' },
      });
      fireEvent.change(screen.getByLabelText('Degree'), {
        target: { value: 'Bachelor' },
      });
      fireEvent.change(visibleInputByLabel('Start date'), {
        target: { value: '01/09/2018' },
      });

      rerender(<ProfilePage repository={repository} activeSection="skills" />);
      expect(screen.getByDisplayValue('TypeScript')).not.toBeNull();

      rerender(
        <ProfilePage repository={repository} activeSection="preferences" />,
      );
      fireEvent.change(
        screen.getByLabelText('Desired roles, comma separated'),
        {
          target: { value: 'Backend Engineer, Software Engineer' },
        },
      );

      rerender(
        <ProfilePage repository={repository} activeSection="documents" />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add answer' }));
      fireEvent.change(screen.getByLabelText('Question'), {
        target: { value: 'Why are you interested in this role?' },
      });
      fireEvent.change(screen.getByLabelText('Answer'), {
        target: { value: 'I enjoy building reliable backend systems.' },
      });
      fireEvent.change(screen.getByLabelText('Tags, comma separated'), {
        target: { value: 'motivation, backend' },
      });

      rerender(
        <ProfilePage repository={repository} activeSection="variants" />,
      );
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

      await act(() => vi.advanceTimersByTimeAsync(800));
    } finally {
      vi.useRealTimers();
    }
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    const saved = save.mock.calls[0]?.[0];

    expect(saved?.baseProfile.professional.experiences[0]).toMatchObject({
      company: 'Example Co',
      title: 'Software Engineer',
      employmentType: 'Full-time',
      startDate: '01/02/2024',
      skills: ['TypeScript', 'React'],
    });
    expect(saved?.baseProfile.professional.education).toHaveLength(1);
    expect(saved?.baseProfile.professional.education[0]?.startDate).toBe(
      '01/09/2018',
    );
    expect(saved?.baseProfile.professional.skills).toHaveLength(2);
    expect(saved?.baseProfile.jobPreferences.desiredRoles).toEqual([
      'Backend Engineer',
      'Software Engineer',
    ]);
    expect(saved?.baseProfile.customAnswers[0]).toMatchObject({
      question: 'Why are you interested in this role?',
      answer: 'I enjoy building reliable backend systems.',
      tags: ['motivation', 'backend'],
    });
    expect(saved?.variants).toHaveLength(1);
    expect(saved?.variants[0]).toMatchObject({
      name: 'Backend Engineer',
      targetRoles: ['Backend Engineer'],
      headlineOverride: 'Backend Software Engineer',
    });
    expect(saved?.preferences.defaultVariantId).toBe(saved?.variants[0]?.id);
  });

  it('keeps saved career records collapsed and previews multiline descriptions as lists', async () => {
    const profile = createEmptyStoredProfile('2026-08-13T00:00:00.000Z');
    profile.baseProfile.professional.experiences.push({
      id: 'experience-1',
      company: 'Example Co',
      title: 'Software Engineer',
      employmentType: 'Full-time',
      location: 'Jakarta',
      startDate: '2024-02-01',
      endDate: '',
      current: true,
      description: '- Built internal tooling\n- Reduced manual work',
      achievements: [],
      skills: ['TypeScript'],
    });
    profile.baseProfile.professional.education.push({
      id: 'education-1',
      institution: 'Universitas Andalas',
      degree: 'Bachelor',
      fieldOfStudy: 'Computer Science',
      location: 'Padang',
      startDate: '2018-09-01',
      endDate: '2022-08-01',
      gpa: null,
      maxGpa: null,
      description: '- Graduated with honors\n- Led final project',
    });
    profile.baseProfile.professional.projects.push({
      id: 'project-1',
      name: 'Hiring Portal',
      role: 'Frontend Engineer',
      description: '- Built candidate dashboard\n- Improved review speed',
      url: '',
      startDate: '2025-01-01',
      endDate: '2025-03-01',
      skills: ['React'],
    });
    profile.baseProfile.professional.skills.push({
      id: 'skill-1',
      name: 'TypeScript',
      level: '',
      yearsExperience: null,
    });
    const { repository } = createRepository(profile);
    const { rerender } = render(
      <ProfilePage repository={repository} activeSection="experience" />,
    );

    const experienceSummary = await screen.findByText(
      'Software Engineer at Example Co',
    );
    const experienceDetails = experienceSummary.closest('details');
    expect(experienceDetails?.open).toBe(false);

    fireEvent.click(experienceSummary);
    expect(experienceDetails?.open).toBe(true);
    expect(screen.getByDisplayValue('01/02/2024')).not.toBeNull();
    expect(screen.getByText('Reduced manual work')).not.toBeNull();
    expect(screen.getByText('Hiring Portal')).not.toBeNull();

    rerender(<ProfilePage repository={repository} activeSection="education" />);
    const educationSummary = await screen.findByText('Bachelor');
    const educationDetails = educationSummary.closest('details');
    expect(educationDetails?.open).toBe(false);

    fireEvent.click(educationSummary);
    expect(educationDetails?.open).toBe(true);
    expect(screen.getByDisplayValue('01/09/2018')).not.toBeNull();
    expect(screen.getByText('Led final project')).not.toBeNull();
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
