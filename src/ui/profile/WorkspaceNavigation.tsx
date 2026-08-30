import {
  BriefcaseBusiness,
  FileArchive,
  FileText,
  GraduationCap,
  History,
  ListChecks,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { SelectField } from '../design-system/primitives';
import type { WorkspaceSection } from './workspace-sections';

const groups = [
  {
    label: 'Profile',
    items: [
      { id: 'personal', label: 'Personal', icon: UserRound },
      { id: 'experience', label: 'Experience', icon: BriefcaseBusiness },
      { id: 'education', label: 'Education', icon: GraduationCap },
    ],
  },
  {
    label: 'Application',
    items: [
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'preferences', label: 'Preferences', icon: MapPin },
      { id: 'variants', label: 'Variants', icon: ListChecks },
    ],
  },
  {
    label: 'Privacy & data',
    items: [
      { id: 'sensitive', label: 'Sensitive', icon: ShieldCheck },
      { id: 'corrections', label: 'Corrections', icon: History },
      { id: 'backup', label: 'Backup', icon: FileArchive },
    ],
  },
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
        className="hidden space-y-5 md:block"
        aria-label="Career workspace sections"
      >
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
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
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
