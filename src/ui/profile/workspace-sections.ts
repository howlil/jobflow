export type WorkspaceSection =
  | 'personal'
  | 'contact'
  | 'links'
  | 'experience'
  | 'education'
  | 'documents'
  | 'preferences'
  | 'variants'
  | 'sensitive'
  | 'corrections'
  | 'backup';

export const WORKSPACE_SECTION_TITLES: Record<WorkspaceSection, string> = {
  personal: 'Personal',
  contact: 'Contact',
  links: 'Links',
  experience: 'Experience',
  education: 'Education',
  documents: 'Documents',
  preferences: 'Preferences',
  variants: 'Variants',
  sensitive: 'Sensitive',
  corrections: 'Corrections',
  backup: 'Backup',
};
