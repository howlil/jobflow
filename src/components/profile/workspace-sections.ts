export type WorkspaceSection =
  | 'personal'
  | 'contact'
  | 'links'
  | 'experience'
  | 'education'
  | 'applications'
  | 'documents'
  | 'preferences'
  | 'variants'
  | 'sensitive'
  | 'corrections'
  | 'backup';

export const WORKSPACE_SECTION_TITLES: Record<WorkspaceSection, string> = {
  personal: 'Profile',
  contact: 'Contact',
  links: 'Links',
  experience: 'Experience',
  education: 'Education',
  applications: 'Pipeline',
  documents: 'Documents',
  preferences: 'Preferences',
  variants: 'Application Profiles',
  sensitive: 'Privacy & Sensitive Data',
  corrections: 'Autofill Memory',
  backup: 'Backup & Recovery',
};
