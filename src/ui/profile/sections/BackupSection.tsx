import { Download, Upload } from 'lucide-react';

import type { WorkspaceSection } from '../workspace-sections';

type BackupSectionProps = {
  activeSection: WorkspaceSection;
  exportProfile: () => void;
  importProfile: (file: File) => void;
};

export function BackupSection({
  activeSection,
  exportProfile,
  importProfile,
}: BackupSectionProps) {
  return (
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'backup'}
    >
      <summary>Backup and recovery</summary>
      <p className="muted">
        Export contains the normal versioned profile and variants. Sensitive
        vault values are not exported as plaintext.
      </p>
      <div className="jobflow-section-heading">
        <button
          className="jobflow-button"
          type="button"
          onClick={exportProfile}
        >
          <Download aria-hidden="true" size={16} />
          Export profile backup
        </button>
        <label className="jobflow-button">
          <Upload aria-hidden="true" size={16} />
          Import profile backup
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) void importProfile(file);
              event.target.value = '';
            }}
          />
        </label>
      </div>
    </details>
  );
}
