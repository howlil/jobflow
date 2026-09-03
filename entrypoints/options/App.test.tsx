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

vi.mock('../../src/components/corrections/CorrectionMemorySection', () => ({
  CorrectionMemorySection: () => <div>Correction memory</div>,
}));

vi.mock('../../src/components/profile/CvImportSection', () => ({
  CvImportSection: () => <div>CV import</div>,
}));

vi.mock('../../src/components/profile/BackupRecoveryInspector', () => ({
  BackupRecoveryInspector: () => <div>Backup recovery</div>,
}));

import App from './App';

describe('options App', () => {
  it('opens on the operational pipeline and updates the topbar with navigation', () => {
    render(<App />);

    expect(
      screen.getByRole('complementary', { name: 'Job Flow sidebar' }),
    ).not.toBeNull();
    expect(screen.getByRole('banner')).not.toBeNull();
    expect(screen.getByRole('main')).not.toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pipeline' }),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Autofill Memory' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Autofill Memory' }),
    ).not.toBeNull();
  });

  it('explicitly expands and collapses the desktop sidebar', () => {
    render(<App />);

    const expand = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(expand.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(expand);
    const collapse = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(collapse.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(collapse);
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).not.toBeNull();
  });

  it('preserves an unsaved profile draft while visiting Autofill Memory', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
    const firstName =
      await screen.findByLabelText<HTMLInputElement>('First name');
    fireEvent.change(firstName, { target: { value: 'Draft name' } });

    fireEvent.click(screen.getByRole('button', { name: 'Autofill Memory' }));
    expect(screen.getByText('Correction memory')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
    expect(screen.getByLabelText<HTMLInputElement>('First name').value).toBe(
      'Draft name',
    );
  });
});
