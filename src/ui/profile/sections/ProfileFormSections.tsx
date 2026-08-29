import {
  SensitiveVaultSection,
  type VaultClient,
} from '../../vault/SensitiveVaultSection';
import { BackupSection } from './BackupSection';
import { CareerRecordsSection } from './CareerRecordsSection';
import { DocumentsSection } from './DocumentsSection';
import { EducationSection } from './EducationSection';
import { ExperienceSection } from './ExperienceSection';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { PreferencesSection } from './PreferencesSection';
import { SkillsSection } from './SkillsSection';
import { VariantsSection } from './VariantsSection';
import type { ProfileSectionProps } from './profile-section-types';

export type { ProfileMutation } from './profile-section-types';

type ProfileFormSectionsProps = ProfileSectionProps & {
  exportProfile: () => void;
  importProfile: (file: File) => void;
  vaultClient: VaultClient | undefined;
};

export function ProfileFormSections({
  activeSection,
  changeProfile,
  exportProfile,
  importProfile,
  profile,
  vaultClient,
}: ProfileFormSectionsProps) {
  const sectionProps = { activeSection, changeProfile, profile };

  return (
    <div className="grid gap-8">
      <PersonalDetailsSection {...sectionProps} />
      <ExperienceSection {...sectionProps} />
      <CareerRecordsSection {...sectionProps} />
      <EducationSection {...sectionProps} />
      <SkillsSection {...sectionProps} />
      <PreferencesSection {...sectionProps} />
      <DocumentsSection {...sectionProps} />
      {vaultClient !== undefined && activeSection === 'sensitive' ? (
        <SensitiveVaultSection vaultClient={vaultClient} />
      ) : null}
      <VariantsSection {...sectionProps} />
      <BackupSection
        activeSection={activeSection}
        exportProfile={exportProfile}
        importProfile={importProfile}
      />
    </div>
  );
}
