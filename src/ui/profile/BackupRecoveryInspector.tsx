import { useState } from 'react';

import {
  inspectProfileBackup,
  type ProfileBackup,
} from '../../application/profile/profile-backup';
import type { ProfileRepository } from '../../application/profile/profile-repository';

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
      setMessage('The backup is valid, but Fillio could not restore it.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <section
      className="profile-section"
      aria-labelledby="backup-inspector-title"
    >
      <div className="fillio-section-heading">
        <div>
          <p className="eyebrow">Recovery</p>
          <h2 id="backup-inspector-title">Backup diagnostics</h2>
        </div>
      </div>
      <p className="muted">
        Inspect a backup before restoring it. Validation never modifies your
        current profile, and encrypted vault values are not part of normal
        profile backups.
      </p>
      <label>
        Inspect backup file
        <input
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file !== undefined) void inspect(file);
          }}
        />
      </label>

      {backup !== null ? (
        <div className="record-card">
          <strong>Validated backup</strong>
          <p className="muted">
            Exported{' '}
            {new Date(backup.exportedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
            . Restore only if this is the profile snapshot you intend to use.
          </p>
          <button
            className="fillio-button"
            type="button"
            disabled={restoring}
            onClick={() => void restore()}
          >
            {restoring ? 'Restoring…' : 'Restore validated backup'}
          </button>
        </div>
      ) : null}

      {message !== null ? <p role="status">{message}</p> : null}
    </section>
  );
}
