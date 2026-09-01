import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { JobApplication } from '../../domain/applications/application-schema';
import type { ApplicationService } from '../../application/applications/application-service';
import { ApplicationsWorkspace } from './ApplicationsWorkspace';

function application(
  overrides: Partial<JobApplication> &
    Pick<JobApplication, 'id' | 'company' | 'role'>,
): JobApplication {
  const stage = overrides.stage ?? 'saved';
  const substage = overrides.substage;
  const createdAt = overrides.createdAt ?? '2026-08-30T00:00:00.000Z';
  return {
    stage,
    ...(substage === undefined ? {} : { substage }),
    stageHistory: overrides.stageHistory ?? [
      {
        stage,
        ...(substage === undefined ? {} : { substage }),
        enteredAt: createdAt,
      },
    ],
    createdAt,
    updatedAt: overrides.updatedAt ?? createdAt,
    ...overrides,
  };
}

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
  it('shows the primary lifecycle funnel and groups closed opportunities by outcome', async () => {
    const applications: JobApplication[] = [
      application({
        id: 'active',
        company: 'Gojek',
        role: 'Backend Engineer',
        stage: 'applied',
        substage: 'recruiter_review',
        priority: 'p0',
        nextAction: 'Follow up recruiter',
        deadline: '2026-09-05',
        updatedAt: '2026-08-30T03:00:00.000Z',
      }),
      application({
        id: 'closed',
        company: 'Traveloka',
        role: 'Platform Engineer',
        stage: 'closed',
        substage: 'rejected',
        notes: 'Role closed after final review.',
        closedAt: '2026-09-01',
        updatedAt: '2026-08-30T02:00:00.000Z',
      }),
    ];
    render(<ApplicationsWorkspace service={createService(applications)} />);

    expect(await screen.findByText('Backend Engineer')).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Saved' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Applying' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Applied' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Interview' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Offer' })).not.toBeNull();
    expect(screen.getByText('Recruiter review')).not.toBeNull();
    expect(screen.getByText('P0 · Apply ASAP')).not.toBeNull();
    expect(screen.getByText('Next: Follow up recruiter')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Closed 1' }));
    expect(screen.getByRole('heading', { name: 'Accepted' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Rejected' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Withdrawn' })).not.toBeNull();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'View Traveloka Platform Engineer details',
      }),
    );

    expect(screen.getByText('Role closed after final review.')).not.toBeNull();
    expect(
      screen.getByText('This opportunity is closed as Rejected.'),
    ).not.toBeNull();
    expect(screen.getByText('Lifecycle complete.')).not.toBeNull();
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
        appliedAt: '',
        interviewAt: '',
        offerAt: '',
        closedAt: '',
      }),
    );
    expect(screen.queryByLabelText('Company')).toBeNull();
  });

  it('moves an active job through primary lifecycle stages from application detail', async () => {
    const item = application({
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      substage: 'submitted',
      nextActionAt: '2000-01-01',
    });
    const service = createService([item]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    expect(screen.getByText('Overdue 2000-01-01')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Interview →' })).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: 'View Acme Engineer details' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Interview →' }));

    await waitFor(() =>
      expect(service.changeStage).toHaveBeenCalledWith(
        'app-1',
        'interview',
        undefined,
      ),
    );
    expect(screen.getByText('Moved to Interview.')).not.toBeNull();
  });

  it('updates lifecycle detail without changing the primary stage', async () => {
    const item = application({
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      substage: 'submitted',
    });
    const service = createService([item]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    fireEvent.click(
      screen.getByRole('button', { name: 'View Acme Engineer details' }),
    );
    fireEvent.change(screen.getByLabelText('Lifecycle detail'), {
      target: { value: 'assessment' },
    });

    await waitFor(() =>
      expect(service.update).toHaveBeenCalledWith('app-1', {
        substage: 'assessment',
      }),
    );
    expect(screen.getByText('Lifecycle detail: Assessment.')).not.toBeNull();
  });

  it('closes an opportunity with an explicit outcome from detail', async () => {
    const item = application({
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'interview',
      substage: 'technical_interview',
    });
    const service = createService([item]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    fireEvent.click(
      screen.getByRole('button', { name: 'View Acme Engineer details' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mark rejected' }));

    await waitFor(() =>
      expect(service.changeStage).toHaveBeenCalledWith(
        'app-1',
        'closed',
        'rejected',
      ),
    );
    expect(screen.getByText('Closed as Rejected.')).not.toBeNull();
  });

  it('edits lifecycle dates and job context from application detail', async () => {
    const item = application({
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      substage: 'recruiter_review',
      priority: 'p1',
      notes: 'Initial note.',
      source: 'LinkedIn',
      contactName: 'Maya',
      contactEmail: 'maya@example.com',
      nextAction: 'Follow up recruiter',
      nextActionAt: '2026-09-01',
      deadline: '2026-09-05',
      appliedAt: '2026-08-31',
    });
    const service = createService([item]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    fireEvent.click(
      screen.getByRole('button', { name: 'View Acme Engineer details' }),
    );

    expect(screen.getByText('Initial note.')).not.toBeNull();
    expect(screen.getByText('Maya · maya@example.com')).not.toBeNull();
    expect(
      (screen.getByLabelText('Lifecycle detail') as HTMLSelectElement).value,
    ).toBe('recruiter_review');
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));

    expect(screen.getByDisplayValue('Initial note.')).not.toBeNull();
    expect(screen.getByLabelText('Lifecycle detail')).not.toBeNull();
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Updated note.' },
    });
    fireEvent.change(screen.getByLabelText('Interview date'), {
      target: { value: '2026-09-03' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(service.update).toHaveBeenCalledWith('app-1', {
        company: 'Acme',
        role: 'Engineer',
        jobUrl: '',
        stage: 'applied',
        substage: 'recruiter_review',
        priority: 'p1',
        notes: 'Updated note.',
        source: 'LinkedIn',
        contactName: 'Maya',
        contactEmail: 'maya@example.com',
        nextAction: 'Follow up recruiter',
        nextActionAt: '2026-09-01',
        deadline: '2026-09-05',
        appliedAt: '2026-08-31',
        interviewAt: '2026-09-03',
        offerAt: '',
        closedAt: '',
      }),
    );
    expect(screen.getByText('Job updated.')).not.toBeNull();
  });

  it('preserves the needs-action view and search after returning from detail', async () => {
    const applications: JobApplication[] = [
      application({
        id: 'gojek-due',
        company: 'Gojek',
        role: 'Backend Engineer',
        stage: 'applied',
        substage: 'recruiter_review',
        nextAction: 'Follow up recruiter',
        nextActionAt: '2000-01-01',
        notes: 'Follow up with recruiter.',
        updatedAt: '2026-08-30T03:00:00.000Z',
      }),
      application({
        id: 'gojek-future',
        company: 'Gojek',
        role: 'Platform Engineer',
        stage: 'applied',
        nextActionAt: '2999-01-01',
        updatedAt: '2026-08-30T02:00:00.000Z',
      }),
      application({
        id: 'traveloka-due',
        company: 'Traveloka',
        role: 'Software Engineer',
        stage: 'interview',
        nextActionAt: '2000-01-02',
        updatedAt: '2026-08-30T01:00:00.000Z',
      }),
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

  it('falls back to a deterministic lifecycle suggestion after completing the explicit action', async () => {
    const item = application({
      id: 'gojek-due',
      company: 'Gojek',
      role: 'Backend Engineer',
      stage: 'applied',
      substage: 'recruiter_review',
      nextAction: 'Follow up recruiter',
      nextActionAt: '2000-01-01',
      updatedAt: '2026-08-30T03:00:00.000Z',
    });
    const completedApplication = application({
      id: item.id,
      company: item.company,
      role: item.role,
      stage: item.stage,
      substage: item.substage,
      stageHistory: item.stageHistory,
      createdAt: item.createdAt,
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    const service = createService([item]);
    vi.mocked(service.list)
      .mockResolvedValueOnce([item])
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
    expect(screen.getByText('Suggested next')).not.toBeNull();
    expect(
      screen.getByText('Follow up if there is no response.'),
    ).not.toBeNull();
  });
});
