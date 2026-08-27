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

const navItemBase =
  'flex min-h-[34px] w-full items-center gap-2 rounded-control border px-2 py-1.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2 max-[720px]:min-h-11';

export function WorkspaceNavigation({
  activeSection,
  onChange,
}: WorkspaceNavigationProps) {
  return (
    <aside
      className="sticky top-[68px] min-h-[calc(100vh-84px)] self-start border-r border-app-border py-5 pr-4 max-[720px]:top-[52px] max-[720px]:z-20 max-[720px]:min-h-0 max-[720px]:border-b max-[720px]:border-r-0 max-[720px]:bg-app-bg/95 max-[720px]:py-3 max-[720px]:pr-0 max-[720px]:backdrop-blur-md"
      aria-label="Career workspace navigation"
    >
      <div className="grid gap-0.5 px-2 max-[720px]:hidden">
        <strong className="text-xs font-semibold text-app-ink">
          Profile setup
        </strong>
        <span className="text-[11px] text-app-subtle">
          Choose what to update
        </span>
      </div>

      <label className="hidden text-xs font-medium text-app-text max-[720px]:block">
        Section
        <select
          className="mt-1.5 w-full rounded-control border border-app-border bg-white px-3 py-2 text-sm text-app-ink outline-none transition focus:border-app-ink focus:ring-2 focus:ring-app-border"
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

      <nav className="mt-3.5 grid gap-0.5 max-[720px]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              className={`${navItemBase} ${
                active
                  ? 'border-app-border bg-white font-semibold text-app-ink'
                  : 'border-transparent font-medium text-app-text hover:bg-app-muted hover:text-app-ink'
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
    </aside>
  );
}
