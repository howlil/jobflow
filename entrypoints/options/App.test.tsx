import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/infrastructure/storage/chrome-profile-repository', () => ({
  ChromeProfileRepository: class {
    load = vi.fn().mockResolvedValue(null);
    save = vi.fn().mockResolvedValue(undefined);
  },
}));

vi.mock(
  '../../src/infrastructure/storage/chrome-application-repository',
  () => ({
    ChromeApplicationRepository: class {
      load = vi.fn().mockResolvedValue(null);
      save = vi.fn().mockResolvedValue(undefined);
    },
  }),
);

vi.mock('../../src/ui/corrections/CorrectionMemorySection', () => ({
  CorrectionMemorySection: () => <div>Correction memory</div>,
}));

vi.mock('../../src/ui/profile/CvImportSection', () => ({
  CvImportSection: () => <div>CV import</div>,
}));

vi.mock('../../src/ui/profile/BackupRecoveryInspector', () => ({
  BackupRecoveryInspector: () => <div>Backup recovery</div>,
}));

import App from './App';

describe('options App', () => {
  it('renders the dashboard shell and updates the topbar with navigation', () => {
    render(<App />);

    expect(
      screen.getByRole('complementary', { name: 'Job Flow sidebar' }),
    ).not.toBeNull();
    expect(screen.getByRole('banner')).not.toBeNull();
    expect(screen.getByRole('main')).not.toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Personal' }),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Corrections' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Corrections' }),
    ).not.toBeNull();
  });

  it('preserves an unsaved profile draft while visiting Corrections', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Personal' }));
    const firstName =
      await screen.findByLabelText<HTMLInputElement>('First name');
    fireEvent.change(firstName, { target: { value: 'Draft name' } });

    fireEvent.click(screen.getByRole('button', { name: 'Corrections' }));
    expect(screen.getByText('Correction memory')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Personal' }));
    expect(screen.getByLabelText<HTMLInputElement>('First name').value).toBe(
      'Draft name',
    );
  });
});
