export type WorkspaceSection =
  | 'personal'
  | 'contact'
  | 'links'
  | 'experience'
  | 'education'
  | 'skills'
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
  skills: 'Skills',
  documents: 'Documents',
  preferences: 'Preferences',
  variants: 'Variants',
  sensitive: 'Sensitive',
  corrections: 'Corrections',
  backup: 'Backup',
};
