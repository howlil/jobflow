import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { JobApplication } from '../../domain/applications/application-schema';
import type { ApplicationService } from '../../application/applications/application-service';
import { ApplicationsWorkspace } from './ApplicationsWorkspace';

function createService(
  applications: JobApplication[] = [],
): ApplicationService {
  return {
    list: vi.fn().mockResolvedValue(applications),
    createDraftFromPageCapture: vi.fn(),
    create: vi.fn().mockResolvedValue(applications[0]),
    update: vi.fn().mockResolvedValue(applications[0]),
    changeStage: vi.fn().mockResolvedValue(applications[0]),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe('ApplicationsWorkspace', () => {
  it('shows the active funnel and opens closed opportunities in the same detail surface', async () => {
    const applications: JobApplication[] = [
      {
        id: 'active',
        company: 'Gojek',
        role: 'Backend Engineer',
        stage: 'applied',
        priority: 'p0',
        nextAction: 'Follow up recruiter',
        deadline: '2026-09-05',
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T03:00:00.000Z',
      },
      {
        id: 'closed',
        company: 'Traveloka',
        role: 'Platform Engineer',
        stage: 'rejected',
        notes: 'Role closed after final review.',
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T02:00:00.000Z',
      },
    ];
    render(<ApplicationsWorkspace service={createService(applications)} />);

    expect(await screen.findByText('Backend Engineer')).not.toBeNull();
    expect(screen.getByText('P0 · Apply ASAP')).not.toBeNull();
    expect(screen.getByText('Next: Follow up recruiter')).not.toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Job pipeline' }),
    ).not.toBeNull();
    expect(screen.queryByLabelText('Company')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Closed 1' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'View Traveloka Platform Engineer details',
      }),
    );

    expect(screen.getByText('Role closed after final review.')).not.toBeNull();
    expect(
      screen.getByText('This opportunity is closed as Rejected.'),
    ).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Back to pipeline' }),
    ).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Mark done' })).toBeNull();
  });

  it('creates jobs from an on-demand pipeline form', async () => {
    const service = createService();
    render(<ApplicationsWorkspace service={service} />);

    expect(screen.queryByLabelText('Company')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Add job' }));

    fireEvent.change(screen.getByLabelText('Company'), {
      target: { value: 'Acme' },
    });
    fireEvent.change(screen.getByLabelText('Role'), {
      target: { value: 'Engineer' },
    });
    fireEvent.change(screen.getByLabelText('Job URL'), {
      target: { value: 'https://jobs.example/acme' },
    });
    fireEvent.change(screen.getByLabelText('Priority'), {
      target: { value: 'p1' },
    });
    fireEvent.change(screen.getByLabelText('Next action'), {
      target: { value: 'Tailor resume' },
    });
    fireEvent.change(screen.getByLabelText('Application deadline'), {
      target: { value: '2026-09-05' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add to pipeline' }));

    await waitFor(() =>
      expect(service.create).toHaveBeenCalledWith({
        company: 'Acme',
        role: 'Engineer',
        jobUrl: 'https://jobs.example/acme',
        stage: 'saved',
        priority: 'p1',
        notes: '',
        source: '',
        contactName: '',
        contactEmail: '',
        nextAction: 'Tailor resume',
        nextActionAt: '',
        deadline: '2026-09-05',
      }),
    );
    expect(screen.queryByLabelText('Company')).toBeNull();
  });

  it('moves an active job from application detail', async () => {
    const application: JobApplication = {
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      nextActionAt: '2000-01-01',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    };
    const service = createService([application]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    expect(screen.getByText('Overdue 2000-01-01')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Assessment →' })).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: 'View Acme Engineer details' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Assessment →' }));

    await waitFor(() =>
      expect(service.changeStage).toHaveBeenCalledWith('app-1', 'assessment'),
    );
    expect(screen.getByText('Moved to Assessment.')).not.toBeNull();
  });

  it('edits an existing job contextually from application detail', async () => {
    const application: JobApplication = {
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'saved',
      priority: 'p1',
      notes: 'Initial note.',
      source: 'LinkedIn',
      contactName: 'Maya',
      contactEmail: 'maya@example.com',
      nextAction: 'Tailor resume',
      nextActionAt: '2026-09-01',
      deadline: '2026-09-05',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    };
    const service = createService([application]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    expect(screen.queryByText('Initial note.')).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'View Acme Engineer details' }),
    );

    expect(screen.getByText('Initial note.')).not.toBeNull();
    expect(screen.getByText('Maya · maya@example.com')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));

    expect(screen.getByDisplayValue('Initial note.')).not.toBeNull();
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Updated note.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(service.update).toHaveBeenCalledWith('app-1', {
        company: 'Acme',
        role: 'Engineer',
        jobUrl: '',
        stage: 'saved',
        priority: 'p1',
        notes: 'Updated note.',
        source: 'LinkedIn',
        contactName: 'Maya',
        contactEmail: 'maya@example.com',
        nextAction: 'Tailor resume',
        nextActionAt: '2026-09-01',
        deadline: '2026-09-05',
      }),
    );
    expect(screen.getByText('Job updated.')).not.toBeNull();
  });

  it('preserves the needs-action view and search after returning from detail', async () => {
    const applications: JobApplication[] = [
      {
        id: 'gojek-due',
        company: 'Gojek',
        role: 'Backend Engineer',
        stage: 'applied',
        nextAction: 'Follow up recruiter',
        nextActionAt: '2000-01-01',
        notes: 'Follow up with recruiter.',
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T03:00:00.000Z',
      },
      {
        id: 'gojek-future',
        company: 'Gojek',
        role: 'Platform Engineer',
        stage: 'applied',
        nextActionAt: '2999-01-01',
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T02:00:00.000Z',
      },
      {
        id: 'traveloka-due',
        company: 'Traveloka',
        role: 'Software Engineer',
        stage: 'interview',
        nextActionAt: '2000-01-02',
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T01:00:00.000Z',
      },
    ];
    render(<ApplicationsWorkspace service={createService(applications)} />);

    await screen.findByText('Backend Engineer');
    fireEvent.change(screen.getByLabelText('Search jobs'), {
      target: { value: 'gojek' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Needs action 2' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'View Gojek Backend Engineer details',
      }),
    );

    expect(screen.getByText('Follow up with recruiter.')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Back to pipeline' }));

    expect(
      (screen.getByLabelText('Search jobs') as HTMLInputElement).value,
    ).toBe('gojek');
    expect(
      screen
        .getByRole('button', { name: 'Needs action 2' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(screen.getByText('Backend Engineer')).not.toBeNull();
    expect(screen.queryByText('Software Engineer')).toBeNull();
    expect(screen.queryByText('Platform Engineer')).toBeNull();
  });

  it('completes the explicit next action from application detail', async () => {
    const application: JobApplication = {
      id: 'gojek-due',
      company: 'Gojek',
      role: 'Backend Engineer',
      stage: 'applied',
      nextAction: 'Follow up recruiter',
      nextActionAt: '2000-01-01',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T03:00:00.000Z',
    };
    const completedApplication: JobApplication = {
      id: application.id,
      company: application.company,
      role: application.role,
      stage: application.stage,
      createdAt: application.createdAt,
      updatedAt: '2026-09-01T00:00:00.000Z',
    };
    const service = createService([application]);
    vi.mocked(service.list)
      .mockResolvedValueOnce([application])
      .mockResolvedValue([completedApplication]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Backend Engineer');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'View Gojek Backend Engineer details',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mark done' }));

    await waitFor(() =>
      expect(service.update).toHaveBeenCalledWith('gojek-due', {
        nextAction: '',
        nextActionAt: '',
      }),
    );
    expect(screen.getByText('Follow-up completed.')).not.toBeNull();
    expect(screen.getByText('No next action set.')).not.toBeNull();
  });
});
