import { useState } from 'react';

import { createApplicationService } from '../../src/application/applications/application-service';
import { createCvImportWorkflow } from '../../src/application/profile/cv-import-workflow';
import { extractCvText } from '../../src/infrastructure/documents/extract-cv-text';
import { ChromeVaultClient } from '../../src/infrastructure/messaging/chrome-vault-client';
import { ChromeCorrectionRepository } from '../../src/infrastructure/storage/chrome-correction-repository';
import { ChromeApplicationRepository } from '../../src/infrastructure/storage/chrome-application-repository';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { IndexedDbDocumentRepository } from '../../src/infrastructure/storage/indexeddb-document-repository';
import { CorrectionMemorySection } from '../../src/ui/corrections/CorrectionMemorySection';
import { ApplicationsWorkspace } from '../../src/ui/applications/ApplicationsWorkspace';
import { WorkspaceFrame } from '../../src/ui/design-system/WorkspaceFrame';
import { BackupRecoveryInspector } from '../../src/ui/profile/BackupRecoveryInspector';
import { CvImportSection } from '../../src/ui/profile/CvImportSection';
import {
  ProfilePage,
  type ProfileSaveState,
  type ProfileSaveStatus,
} from '../../src/ui/profile/ProfilePage';
import { WorkspaceNavigation } from '../../src/ui/profile/WorkspaceNavigation';
import {
  WORKSPACE_SECTION_TITLES,
  type WorkspaceSection,
} from '../../src/ui/profile/workspace-sections';

const profileRepository = new ChromeProfileRepository();
const applicationRepository = new ChromeApplicationRepository();
const correctionRepository = new ChromeCorrectionRepository();
const documentRepository = new IndexedDbDocumentRepository();
const vaultClient = new ChromeVaultClient();
const cvImportWorkflow = createCvImportWorkflow({
  profileRepository,
  documentRepository,
  extractText: extractCvText,
});
const applicationService = createApplicationService(applicationRepository);

const saveIndicatorTone: Record<ProfileSaveState, string> = {
  clean: 'bg-app-border-strong',
  dirty: 'bg-amber-600',
  saving: 'bg-app-ink',
  saved: 'bg-emerald-700',
  error: 'bg-red-700',
};

export default function App() {
  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>('personal');
  const [profileRevision, setProfileRevision] = useState(0);
  const [saveStatus, setSaveStatus] = useState<ProfileSaveStatus>({
    state: 'clean',
    text: 'All changes saved.',
  });
  const refreshWorkspace = () => setProfileRevision((current) => current + 1);

  const navigation = (
    <WorkspaceNavigation
      activeSection={activeSection}
      onChange={setActiveSection}
    />
  );

  const hideProfileSurface =
    activeSection === 'applications' ||
    activeSection === 'corrections' ||
    activeSection === 'backup';

  const workspaceMeta = hideProfileSurface ? (
    'Stored locally'
  ) : (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${saveIndicatorTone[saveStatus.state]}`}
        aria-hidden="true"
      />
      <span>{saveStatus.text}</span>
    </div>
  );

  return (
    <WorkspaceFrame
      navigation={navigation}
      title={WORKSPACE_SECTION_TITLES[activeSection]}
      meta={workspaceMeta}
    >
      <div className="grid gap-8">
        {activeSection === 'documents' ? (
          <CvImportSection
            workflow={cvImportWorkflow}
            onProfileChanged={refreshWorkspace}
          />
        ) : null}

        {activeSection === 'applications' ? (
          <div className="w-full" id="applications">
            <ApplicationsWorkspace service={applicationService} />
          </div>
        ) : null}

        <div hidden={hideProfileSurface}>
          <ProfilePage
            key={profileRevision}
            repository={profileRepository}
            vaultClient={vaultClient}
            activeSection={activeSection}
            onSaveStatusChange={setSaveStatus}
          />
        </div>

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
      </div>
    </WorkspaceFrame>
  );
}
