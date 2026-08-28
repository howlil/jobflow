import type { StoredProfileEnvelope } from '../../../domain/profile/profile-schema';
import type { WorkspaceSection } from '../workspace-sections';

export type ProfileMutation = (profile: StoredProfileEnvelope) => void;

export type ProfileSectionProps = {
  activeSection: WorkspaceSection;
  changeProfile: (mutate: ProfileMutation) => void;
  profile: StoredProfileEnvelope;
};
