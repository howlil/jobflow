import { Upload } from 'lucide-react';
import { useState } from 'react';

import {
  inspectProfileBackup,
  type ProfileBackup,
} from '../../application/profile/profile-backup';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { Button, FilePicker, StatusMessage, Surface } from '../ui';
import { WorkspaceSection, WorkspaceSectionHeader } from '../layout';

type BackupRecoveryInspectorProps = {
  repository: ProfileRepository;
  onRestored?: () => void | Promise<void>;
};

export function BackupRecoveryInspector({
  repository,
  onRestored,
}: BackupRecoveryInspectorProps) {
  const [backup, setBackup] = useState<ProfileBackup | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  async function inspect(file: File) {
    const result = inspectProfileBackup(await file.text());
    if (!result.ok) {
      setBackup(null);
      setMessage(result.message);
      return;
    }
    setBackup(result.backup);
    setMessage(null);
  }

  async function restore() {
    if (backup === null) return;
    setRestoring(true);
    try {
      await repository.save(backup.profile);
      setMessage('Backup restored successfully.');
      await onRestored?.();
    } catch {
      setMessage('The backup is valid, but Job Flow could not restore it.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <WorkspaceSection aria-labelledby="backup-inspector-title">
      <WorkspaceSectionHeader
        eyebrow="Recovery"
        title={<span id="backup-inspector-title">Backup diagnostics</span>}
        description="Inspect a backup before restoring it. Validation never modifies your current profile, and encrypted vault values are not part of normal profile backups."
      />

      <div>
        <FilePicker
          accept="application/json,.json"
          inputLabel="Inspect backup file"
          onFile={inspect}
          label={
            <>
              <Upload aria-hidden="true" size={16} />
              Inspect backup file
            </>
          }
        />
      </div>

      {backup !== null ? (
        <Surface>
          <strong className="text-sm font-semibold text-app-ink">
            Validated backup
          </strong>
          <p className="m-0 text-xs leading-5 text-app-text">
            Exported{' '}
            {new Date(backup.exportedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
            . Restore only if this is the profile snapshot you intend to use.
          </p>
          <Button
            className="justify-self-start"
            disabled={restoring}
            onClick={() => void restore()}
          >
            {restoring ? 'Restoring…' : 'Restore validated backup'}
          </Button>
        </Surface>
      ) : null}

      {message !== null ? (
        <StatusMessage role="status">{message}</StatusMessage>
      ) : null}
    </WorkspaceSection>
  );
}
