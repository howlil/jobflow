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
      }),
    );
  });

  it('moves an application between stages without drag and drop', async () => {
    const application: JobApplication = {
      id: 'app-1',
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
      createdAt: '2026-08-30T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z',
    };
    const service = createService([application]);
    render(<ApplicationsWorkspace service={service} />);

    await screen.findByText('Engineer');
    fireEvent.change(screen.getByLabelText('Move stage'), {
      target: { value: 'interview' },
    });

    await waitFor(() =>
      expect(service.changeStage).toHaveBeenCalledWith('app-1', 'interview'),
    );
  });
});
