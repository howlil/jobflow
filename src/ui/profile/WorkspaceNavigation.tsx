import {
  BriefcaseBusiness,
  FileArchive,
  FileText,
  GraduationCap,
  History,
  ListChecks,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import type { WorkspaceSection } from './workspace-sections';

const items = [
  { id: 'personal', label: 'Personal', icon: UserRound },
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

const navItemBase =
  'flex min-h-10 w-full items-center gap-2.5 rounded-control border px-2.5 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2';

export function WorkspaceNavigation({
  activeSection,
  onChange,
}: WorkspaceNavigationProps) {
  return (
    <div className="space-y-4">
      <div className="hidden px-2 md:block">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
          Career data
        </p>
        <p className="mt-1 text-[11px] leading-4 text-app-text">
          Profile, documents, privacy, and recovery.
        </p>
      </div>

      <label className="block text-xs font-medium text-app-text md:hidden">
        Section
        <select
          className="mt-1.5 min-h-10 w-full rounded-control border border-app-border bg-white px-3 py-2 text-sm text-app-ink outline-none transition focus:border-app-ink focus:ring-2 focus:ring-app-border"
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

      <nav
        className="hidden gap-1 md:grid"
        aria-label="Career workspace sections"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              className={`${navItemBase} ${
                active
                  ? 'border-app-border bg-app-muted text-app-ink'
                  : 'border-transparent text-app-text hover:bg-app-muted hover:text-app-ink'
              }`}
              type="button"
              key={item.id}
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(item.id)}
            >
              <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
