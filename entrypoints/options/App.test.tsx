import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/infrastructure/storage/chrome-profile-repository', () => ({
  ChromeProfileRepository: class {
    load = vi.fn().mockResolvedValue(null);
    save = vi.fn().mockResolvedValue(undefined);
  },
}));

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
