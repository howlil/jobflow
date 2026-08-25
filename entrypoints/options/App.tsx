import { ChromeVaultClient } from '../../src/infrastructure/messaging/chrome-vault-client';
import { ChromeCorrectionRepository } from '../../src/infrastructure/storage/chrome-correction-repository';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { IndexedDbDocumentRepository } from '../../src/infrastructure/storage/indexeddb-document-repository';
import { CorrectionMemorySection } from '../../src/ui/corrections/CorrectionMemorySection';
import { BackupRecoveryInspector } from '../../src/ui/profile/BackupRecoveryInspector';
import { CvImportSection } from '../../src/ui/profile/CvImportSection';
import { ProfilePage } from '../../src/ui/profile/ProfilePage';
import { WorkspaceNavigation } from '../../src/ui/profile/WorkspaceNavigation';

const profileRepository = new ChromeProfileRepository();
const correctionRepository = new ChromeCorrectionRepository();
const documentRepository = new IndexedDbDocumentRepository();
const vaultClient = new ChromeVaultClient();

export default function App() {
  const refreshWorkspace = () => window.location.reload();

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

      <WorkspaceNavigation />

      <ProfilePage repository={profileRepository} vaultClient={vaultClient} />

      <CvImportSection
        profileRepository={profileRepository}
        documentRepository={documentRepository}
        onProfileChanged={refreshWorkspace}
      />

      <div className="workspace-section-wrap" id="corrections">
        <CorrectionMemorySection repository={correctionRepository} />
      </div>
      <div className="workspace-section-wrap" id="backup-recovery">
        <BackupRecoveryInspector
          repository={profileRepository}
          onRestored={refreshWorkspace}
        />
      </div>
    </div>
  );
}
