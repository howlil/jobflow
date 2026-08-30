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
  it('shows the active funnel and separates closed jobs', async () => {
    const applications: JobApplication[] = [
      {
        id: 'active',
        company: 'Gojek',
        role: 'Backend Engineer',
        stage: 'applied',
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T03:00:00.000Z',
      },
      {
        id: 'closed',
        company: 'Traveloka',
        role: 'Platform Engineer',
        stage: 'rejected',
        createdAt: '2026-08-30T00:00:00.000Z',
        updatedAt: '2026-08-30T02:00:00.000Z',
      },
    ];
    render(<ApplicationsWorkspace service={createService(applications)} />);

    expect(await screen.findByText('Backend Engineer')).not.toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Job pipeline' }),
    ).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Saved' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Applied' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Assessment' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Interview' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Offer' })).not.toBeNull();
    expect(screen.queryByText('Platform Engineer')).toBeNull();
    expect(screen.queryByLabelText('Company')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Closed 1' }));

    expect(screen.getByText('Platform Engineer')).not.toBeNull();
    expect(screen.queryByText('Backend Engineer')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Accepted' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Rejected' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Withdrawn' })).not.toBeNull();
  });

  it('creates jobs from an on-demand form', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Add to pipeline' }));

    await waitFor(() =>
      expect(service.create).toHaveBeenCalledWith({
        company: 'Acme',
        role: 'Engineer',
        jobUrl: 'https://jobs.example/acme',
        stage: 'saved',
        notes: '',
        source: '',
        contactName: '',
        contactEmail: '',
        nextActionAt: '',
      }),
    );
    expect(screen.queryByLabelText('Company')).toBeNull();
  });

  it('moves an active job directly to the next pipeline stage', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Assessment →' }));

    await waitFor(() =>
      expect(service.changeStage).toHaveBeenCalledWith('app-1', 'assessment'),
    );
  });

  it('opens full job details only for editing', async () => {
    const application: JobApplication = {
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'saved',
      notes: 'Initial note.',
      source: 'LinkedIn',
      contactName: 'Maya',
      contactEmail: 'maya@example.com',
      nextActionAt: '2026-09-01',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    };
    const service = createService([application]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    expect(screen.queryByText('Initial note.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Acme Engineer' }));

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
        notes: 'Updated note.',
        source: 'LinkedIn',
        contactName: 'Maya',
        contactEmail: 'maya@example.com',
        nextActionAt: '2026-09-01',
      }),
    );
  });

  it('combines search with the needs-action work queue', async () => {
    const applications: JobApplication[] = [
      {
        id: 'gojek-due',
        company: 'Gojek',
        role: 'Backend Engineer',
        stage: 'applied',
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
    const service = createService(applications);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Backend Engineer');
    expect(
      screen.getByText('3 active opportunities · 2 need action'),
    ).not.toBeNull();

    fireEvent.change(screen.getByLabelText('Search jobs'), {
      target: { value: 'gojek' },
    });

    expect(screen.getByText('Backend Engineer')).not.toBeNull();
    expect(screen.getByText('Platform Engineer')).not.toBeNull();
    expect(screen.queryByText('Software Engineer')).toBeNull();
    expect(screen.queryByText('Follow up with recruiter.')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Needs action 2' }));

    expect(screen.getByText('Backend Engineer')).not.toBeNull();
    expect(screen.getByText('Follow up with recruiter.')).not.toBeNull();
    expect(screen.queryByText('Platform Engineer')).toBeNull();
  });
});