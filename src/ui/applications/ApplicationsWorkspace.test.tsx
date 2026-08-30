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
  it('creates a local application through the shared service', async () => {
    const service = createService();
    render(<ApplicationsWorkspace service={service} />);

    fireEvent.change(screen.getByLabelText('Company'), {
      target: { value: 'Acme' },
    });
    fireEvent.change(screen.getByLabelText('Role'), {
      target: { value: 'Engineer' },
    });
    fireEvent.change(screen.getByLabelText('Job URL'), {
      target: { value: 'https://jobs.example/acme' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create application' }));

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
  });

  it('moves an application between stages without drag and drop', async () => {
    const application: JobApplication = {
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      notes: 'Schedule hiring manager follow-up.',
      source: 'Referral',
      contactName: 'Maya',
      nextActionAt: '2000-01-01',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    };
    const service = createService([application]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    expect(
      screen.getByText('Schedule hiring manager follow-up.'),
    ).not.toBeNull();
    expect(screen.getByText('Source: Referral')).not.toBeNull();
    expect(screen.getByText('Contact: Maya')).not.toBeNull();
    expect(screen.getByText('Overdue 2000-01-01')).not.toBeNull();

    fireEvent.change(screen.getByLabelText('Move stage'), {
      target: { value: 'interview' },
    });

    await waitFor(() =>
      expect(service.changeStage).toHaveBeenCalledWith('app-1', 'interview'),
    );
  });

  it('opens application details for editing', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Edit Acme Engineer' }));
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
});
