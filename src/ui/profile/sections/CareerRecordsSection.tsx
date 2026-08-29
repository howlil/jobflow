import { CertificationsSection } from './CertificationsSection';
import { LanguagesSection } from './LanguagesSection';
import { ProjectsSection } from './ProjectsSection';
import type { ProfileSectionProps } from './profile-section-types';

export function CareerRecordsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'experience'}
    >
      <summary>Languages, certifications, and projects</summary>
      <LanguagesSection changeProfile={changeProfile} profile={profile} />
      <CertificationsSection changeProfile={changeProfile} profile={profile} />
      <ProjectsSection changeProfile={changeProfile} profile={profile} />
    </details>
  );
}
