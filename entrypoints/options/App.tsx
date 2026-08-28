import { useState } from 'react';

import { createCvImportWorkflow } from '../../src/application/profile/cv-import-workflow';
import { extractCvText } from '../../src/infrastructure/documents/extract-cv-text';
import { ChromeVaultClient } from '../../src/infrastructure/messaging/chrome-vault-client';
import { ChromeCorrectionRepository } from '../../src/infrastructure/storage/chrome-correction-repository';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { IndexedDbDocumentRepository } from '../../src/infrastructure/storage/indexeddb-document-repository';
import { CorrectionMemorySection } from '../../src/ui/corrections/CorrectionMemorySection';
import { WorkspaceFrame } from '../../src/ui/design-system/WorkspaceFrame';
import { BackupRecoveryInspector } from '../../src/ui/profile/BackupRecoveryInspector';
import { CvImportSection } from '../../src/ui/profile/CvImportSection';
import { ProfilePage } from '../../src/ui/profile/ProfilePage';
import { WorkspaceNavigation } from '../../src/ui/profile/WorkspaceNavigation';
import {
  WORKSPACE_SECTION_TITLES,
  type WorkspaceSection,
} from '../../src/ui/profile/workspace-sections';

const profileRepository = new ChromeProfileRepository();
const correctionRepository = new ChromeCorrectionRepository();
const documentRepository = new IndexedDbDocumentRepository();
const vaultClient = new ChromeVaultClient();
const cvImportWorkflow = createCvImportWorkflow({
  profileRepository,
  documentRepository,
  extractText: extractCvText,
});

export default function App() {
  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>('personal');
  const [profileRevision, setProfileRevision] = useState(0);
  const refreshWorkspace = () => setProfileRevision((current) => current + 1);

  const navigation = (
    <WorkspaceNavigation
      activeSection={activeSection}
      onChange={setActiveSection}
    />
  );

  const hideProfileSurface =
    activeSection === 'corrections' || activeSection === 'backup';

  return (
    <WorkspaceFrame
      navigation={navigation}
      title={WORKSPACE_SECTION_TITLES[activeSection]}
    >
      <div hidden={hideProfileSurface}>
        <ProfilePage
          key={profileRevision}
          repository={profileRepository}
          vaultClient={vaultClient}
          activeSection={activeSection}
        />
      </div>

      {activeSection === 'documents' ? (
        <CvImportSection
          workflow={cvImportWorkflow}
          onProfileChanged={refreshWorkspace}
        />
      ) : null}

      {activeSection === 'corrections' ? (
        <div className="w-full" id="corrections">
          <CorrectionMemorySection repository={correctionRepository} />
        </div>
      ) : null}

      {activeSection === 'backup' ? (
        <div className="w-full" id="backup-recovery">
          <BackupRecoveryInspector
            repository={profileRepository}
            onRestored={refreshWorkspace}
          />
        </div>
      ) : null}
    </WorkspaceFrame>
  );
}
