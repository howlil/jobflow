import { useState, type ReactNode } from 'react';

import type { StoredProfileEnvelope } from '../../../domain/profile/profile-schema';

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function createProfileItemId(): string {
  return globalThis.crypto.randomUUID();
}

export function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function listValue(values: string[]): string {
  return values.join(', ');
}

export function parseNullableNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function formatDateValue(value: string): string {
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDateMatch !== null) {
    const [, year, month, day] = isoDateMatch;
    return `${day}/${month}/${year}`;
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(value);
  if (monthMatch !== null) {
    const [, year, month] = monthMatch;
    const monthIndex = Number(month) - 1;
    const label = SHORT_MONTHS[monthIndex];
    if (label !== undefined) return `${label} ${year}`;
  }

  return value;
}

export function dateInputProps(value: string) {
  return {
    inputMode: 'numeric' as const,
    pattern: '\\d{2}/\\d{2}/\\d{4}',
    placeholder: 'DD/MM/YYYY',
    value: formatDateValue(value),
  };
}

export function monthInputValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '') return '';

  const monthValue = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (monthValue !== null) return trimmed;

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoDate !== null) return `${isoDate[1]}-${isoDate[2]}`;

  const slashDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (slashDate !== null) return `${slashDate[3]}-${slashDate[2]}`;

  const namedMonth = /^([A-Za-z]{3,9})\s+(\d{4})$/.exec(trimmed);
  if (namedMonth !== null) {
    const monthToken = namedMonth[1]?.slice(0, 3).toLowerCase();
    const monthIndex = SHORT_MONTHS.findIndex(
      (month) => month.toLowerCase() === monthToken,
    );
    if (monthIndex >= 0) {
      return `${namedMonth[2]}-${String(monthIndex + 1).padStart(2, '0')}`;
    }
  }

  return '';
}

export function monthInputProps(value: string) {
  return {
    type: 'month' as const,
    value: monthInputValue(value),
  };
}

function dateSummaryValue(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const month = monthInputValue(trimmed);
  return month === '' ? '' : formatDateValue(month);
}

export function dateRangeSummary(
  startDate: string,
  endDate: string,
  current = false,
): string {
  const start = dateSummaryValue(startDate);
  const end = current ? 'Present' : dateSummaryValue(endDate);
  if (start !== '' && end !== '') return `${start} - ${end}`;
  return start || end;
}

function descriptionItems(value: string): string[] {
  return value
    .split(/\r?\n|;+/)
    .map((item) => item.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

export function descriptionPreview(value: string) {
  const items = descriptionItems(value);
  if (items.length === 0) return null;

  return (
    <ul className="description-preview-list" aria-label="Description preview">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function skillNames(profile: StoredProfileEnvelope): string[] {
  return profile.baseProfile.professional.skills
    .map((skill) => skill.name.trim())
    .filter(Boolean);
}

function ensureSkill(profile: StoredProfileEnvelope, name: string): void {
  const normalized = name.trim();
  if (normalized === '') return;
  const exists = profile.baseProfile.professional.skills.some(
    (skill) => skill.name.trim().toLowerCase() === normalized.toLowerCase(),
  );
  if (exists) return;
  profile.baseProfile.professional.skills.push({
    id: createProfileItemId(),
    name: normalized,
    level: '',
    yearsExperience: null,
  });
}

export function syncSkills(
  profile: StoredProfileEnvelope,
  values: string[],
): string[] {
  const parsed = values.map((value) => value.trim()).filter(Boolean);
  for (const value of parsed) ensureSkill(profile, value);
  return parsed;
}

export function addLinkedSkill(
  current: string[] | undefined,
  skillName: string,
): string[] {
  const normalized = skillName.trim();
  if (normalized === '') return current ?? [];
  const values = current ?? [];
  const exists = values.some(
    (value) => value.trim().toLowerCase() === normalized.toLowerCase(),
  );
  return exists ? values : [...values, normalized];
}

export function CollapsibleRecord({
  children,
  initialOpen,
  className = '',
}: {
  children: ReactNode;
  initialOpen: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <details
      className={`record-card ${className}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {children}
    </details>
  );
}
