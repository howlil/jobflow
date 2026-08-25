import { ChromeVaultClient } from '../../src/infrastructure/messaging/chrome-vault-client';
import { ChromeCorrectionRepository } from '../../src/infrastructure/storage/chrome-correction-repository';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { CorrectionMemorySection } from '../../src/ui/corrections/CorrectionMemorySection';
import { BackupRecoveryInspector } from '../../src/ui/profile/BackupRecoveryInspector';
import { ProfilePage } from '../../src/ui/profile/ProfilePage';

const profileRepository = new ChromeProfileRepository();
const correctionRepository = new ChromeCorrectionRepository();
const vaultClient = new ChromeVaultClient();

export default function App() {
  return (
    <>
      <ProfilePage repository={profileRepository} vaultClient={vaultClient} />
      <main className="profile-page">
        <CorrectionMemorySection repository={correctionRepository} />
        <BackupRecoveryInspector
          repository={profileRepository}
          onRestored={() => window.location.reload()}
        />
      </main>
    </>
  );
}
