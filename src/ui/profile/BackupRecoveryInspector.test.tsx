import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createProfileBackup,
  serializeProfileBackup,
} from '../../application/profile/profile-backup';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import { BackupRecoveryInspector } from './BackupRecoveryInspector';

function repository(): ProfileRepository {
  return {
    load: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function uploadFile(content: string, name = 'backup.json') {
  return new File([content], name, { type: 'application/json' });
}

describe('BackupRecoveryInspector', () => {
  it('explains malformed backups without changing persisted profile data', async () => {
    const repo = repository();
    render(<BackupRecoveryInspector repository={repo} />);

    fireEvent.change(screen.getByLabelText('Inspect backup file'), {
      target: { files: [uploadFile('{bad-json')] },
    });

    expect(await screen.findByText('This file is not valid JSON.')).toBeTruthy();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('validates first and restores only after an explicit action', async () => {
    const repo = repository();
    const profile = createEmptyStoredProfile('2026-08-25T00:00:00.000Z');
    profile.baseProfile.personal.legalName.first = 'Ulil';
    const raw = serializeProfileBackup(
      createProfileBackup(profile, '2026-08-25T10:00:00.000Z'),
    );
    const onRestored = vi.fn();

    render(
      <BackupRecoveryInspector repository={repo} onRestored={onRestored} />,
    );

    fireEvent.change(screen.getByLabelText('Inspect backup file'), {
      target: { files: [uploadFile(raw)] },
    });

    expect(
      await screen.findByText('Validated backup', { selector: 'strong' }),
    ).toBeTruthy();
    expect(screen.getByText(/25 Aug 2026/i)).toBeTruthy();
    expect(repo.save).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Restore validated backup' }),
    );

    await waitFor(() => expect(repo.save).toHaveBeenCalledWith(profile));
    expect(onRestored).toHaveBeenCalledTimes(1);
  });
});
