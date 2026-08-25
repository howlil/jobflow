import { useState } from 'react';

import { ChromeVaultClient } from '../../src/infrastructure/messaging/chrome-vault-client';
import { ChromeCorrectionRepository } from '../../src/infrastructure/storage/chrome-correction-repository';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { IndexedDbDocumentRepository } from '../../src/infrastructure/storage/indexeddb-document-repository';
import { CorrectionMemorySection } from '../../src/ui/corrections/CorrectionMemorySection';
import { BackupRecoveryInspector } from '../../src/ui/profile/BackupRecoveryInspector';
import { CvImportSection } from '../../src/ui/profile/CvImportSection';
import { ProfilePage } from '../../src/ui/profile/ProfilePage';
import { WorkspaceNavigation } from '../../src/ui/profile/WorkspaceNavigation';
import type { WorkspaceSection } from '../../src/ui/profile/workspace-sections';

const profileRepository = new ChromeProfileRepository();
const correctionRepository = new ChromeCorrectionRepository();
const documentRepository = new IndexedDbDocumentRepository();
const vaultClient = new ChromeVaultClient();

export default function App() {
  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>('overview');
  const [profileRevision, setProfileRevision] = useState(0);
  const refreshWorkspace = () => setProfileRevision((current) => current + 1);

  return (
    <div className="workspace-shell">
      <div className="workspace-topbar">
        <div className="workspace-topbar__inner">
          <div className="workspace-brand">
            <span className="workspace-brand__mark" aria-hidden="true">
              F
            </span>
            <span>Fillio</span>
          </div>
          <span className="workspace-topbar__meta">
            Stored locally in this browser
          </span>
        </div>
      </div>

      <div className="workspace-layout">
        <WorkspaceNavigation
          activeSection={activeSection}
          onChange={setActiveSection}
        />
        <div className="workspace-content">
          {activeSection !== 'corrections' ? (
            <ProfilePage
              key={profileRevision}
              repository={profileRepository}
              vaultClient={vaultClient}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          ) : null}

          {activeSection === 'documents' ? (
            <CvImportSection
              profileRepository={profileRepository}
              documentRepository={documentRepository}
              onProfileChanged={refreshWorkspace}
            />
          ) : null}

          {activeSection === 'corrections' ? (
            <div className="workspace-section-wrap" id="corrections">
              <CorrectionMemorySection repository={correctionRepository} />
            </div>
          ) : null}
          {activeSection === 'backup' ? (
            <div className="workspace-section-wrap" id="backup-recovery">
              <BackupRecoveryInspector
                repository={profileRepository}
                onRestored={refreshWorkspace}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
