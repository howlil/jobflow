import { Section, SectionHeader } from '../../design-system/primitives';
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
    <Section hidden={activeSection !== 'experience'}>
      <SectionHeader title="Languages, certifications, and projects" />
      <div className="grid gap-6">
        <LanguagesSection changeProfile={changeProfile} profile={profile} />
        <CertificationsSection
          changeProfile={changeProfile}
          profile={profile}
        />
        <ProjectsSection changeProfile={changeProfile} profile={profile} />
      </div>
    </Section>
  );
}
