import {
  BriefcaseBusiness,
  FileArchive,
  FileText,
  GraduationCap,
  History,
  Link,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import type { WorkspaceSection } from './workspace-sections';

const items = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'personal', label: 'Personal', icon: UserRound },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'links', label: 'Links', icon: Link },
  { id: 'experience', label: 'Experience', icon: BriefcaseBusiness },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'preferences', label: 'Preferences', icon: MapPin },
  { id: 'variants', label: 'Variants', icon: ListChecks },
  { id: 'sensitive', label: 'Sensitive', icon: ShieldCheck },
  { id: 'corrections', label: 'Corrections', icon: History },
  { id: 'backup', label: 'Backup', icon: FileArchive },
] as const;

type WorkspaceNavigationProps = {
  activeSection: WorkspaceSection;
  onChange: (section: WorkspaceSection) => void;
};

export function WorkspaceNavigation({
  activeSection,
  onChange,
}: WorkspaceNavigationProps) {
  return (
    <aside
      className="workspace-nav-wrap"
      aria-label="Career workspace navigation"
    >
      <div className="workspace-nav-heading">
        <strong>Profile setup</strong>
        <span>Choose what to update</span>
      </div>
      <label className="workspace-nav-select">
        Section
        <select
          value={activeSection}
          onChange={(event) => onChange(event.target.value as WorkspaceSection)}
        >
          {items.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <nav className="workspace-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className="fillio-nav-link"
              type="button"
              key={item.id}
              aria-current={activeSection === item.id ? 'page' : undefined}
              onClick={() => onChange(item.id)}
            >
              <Icon aria-hidden="true" size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
