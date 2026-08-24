import { ProfilePage } from '../../src/ui/profile/ProfilePage';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { ChromeVaultClient } from '../../src/infrastructure/messaging/chrome-vault-client';

const repository = new ChromeProfileRepository();
const vaultClient = new ChromeVaultClient();

export default function App() {
  return <ProfilePage repository={repository} vaultClient={vaultClient} />;
}
