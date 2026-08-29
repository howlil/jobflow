import { Download, Upload } from 'lucide-react';

import {
  ActionRow,
  Button,
  FilePicker,
  Section,
  SectionHeader,
} from '../../design-system/primitives';
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
    <Section hidden={activeSection !== 'backup'}>
      <SectionHeader
        title="Backup and recovery"
        description="Export contains the normal versioned profile and variants. Sensitive vault values are not exported as plaintext."
      />
      <ActionRow>
        <Button onClick={exportProfile}>
          <Download aria-hidden="true" size={16} />
          Export profile backup
        </Button>
        <FilePicker
          accept="application/json,.json"
          inputLabel="Import profile backup"
          onFile={importProfile}
          label={
            <>
              <Upload aria-hidden="true" size={16} />
              Import profile backup
            </>
          }
        />
      </ActionRow>
    </Section>
  );
}
