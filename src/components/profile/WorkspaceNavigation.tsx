import {
  BriefcaseBusiness,
  ClipboardList,
  FileArchive,
  FileText,
  GraduationCap,
  History,
  ListChecks,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { SelectField } from '../ui';
import type { WorkspaceSection } from './workspace-sections';

const groups = [
  {
    label: 'Work',
    items: [{ id: 'applications', label: 'Pipeline', icon: ClipboardList }],
  },
  {
    label: 'Career',
    items: [
      { id: 'personal', label: 'Profile', icon: UserRound },
      { id: 'experience', label: 'Experience', icon: BriefcaseBusiness },
      { id: 'education', label: 'Education', icon: GraduationCap },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'variants', label: 'Application Profiles', icon: ListChecks },
    ],
  },
  {
    label: 'Settings & data',
    items: [
      { id: 'preferences', label: 'Preferences', icon: MapPin },
      { id: 'sensitive', label: 'Privacy & Sensitive', icon: ShieldCheck },
      { id: 'corrections', label: 'Autofill Memory', icon: History },
      { id: 'backup', label: 'Backup & Recovery', icon: FileArchive },
    ],
  },
] as const;

type WorkspaceNavigationProps = {
  activeSection: WorkspaceSection;
  onChange: (section: WorkspaceSection) => void;
};

const navItemBase =
  'flex h-9 min-h-9 w-full items-center gap-2 rounded-control border px-2 text-left text-sm font-medium transition-colors focus-visible:border-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent-soft';

export function WorkspaceNavigation({
  activeSection,
  onChange,
}: WorkspaceNavigationProps) {
  return (
    <div>
      <SelectField
        className="md:hidden"
        label="Section"
        selectClassName="text-sm"
        value={activeSection}
        onChange={(event) => onChange(event.target.value as WorkspaceSection)}
      >
        {groups.map((group) => (
          <optgroup label={group.label} key={group.label}>
            {group.items.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </optgroup>
        ))}
      </SelectField>

      <nav
        className="hidden space-y-4 md:block"
        aria-label="Jobflow workspace sections"
      >
        {groups.map((group) => (
          <div key={group.label}>
            <p className="pointer-events-none mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-app-subtle opacity-0 transition-opacity duration-100 group-data-[expanded=true]/sidebar:opacity-100">
              {group.label}
            </p>
            <div className="grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    className={`${navItemBase} ${
                      active
                        ? 'border-app-border bg-app-muted text-app-ink'
                        : 'border-transparent text-app-text hover:border-app-border hover:text-app-ink'
                    }`}
                    type="button"
                    key={item.id}
                    aria-current={active ? 'page' : undefined}
                    title={item.label}
                    onClick={() => onChange(item.id)}
                  >
                    <Icon
                      className="shrink-0"
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.8}
                    />
                    <span className="pointer-events-none truncate opacity-0 transition-opacity duration-100 group-data-[expanded=true]/sidebar:opacity-100">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
