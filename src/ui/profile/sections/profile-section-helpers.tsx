import { useState, type ReactNode } from 'react';

import type { StoredProfileEnvelope } from '../../../domain/profile/profile-schema';

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
  if (isoDateMatch === null) return value;
  const [, year, month, day] = isoDateMatch;
  return `${day}/${month}/${year}`;
}

export function dateInputProps(value: string) {
  return {
    inputMode: 'numeric' as const,
    pattern: '\\d{2}/\\d{2}/\\d{4}',
    placeholder: 'DD/MM/YYYY',
    value: formatDateValue(value),
  };
}

export function dateRangeSummary(
  startDate: string,
  endDate: string,
  current = false,
): string {
  const start = formatDateValue(startDate);
  const end = current ? 'Present' : formatDateValue(endDate);
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
}: {
  children: ReactNode;
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <details
      className="record-card"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {children}
    </details>
  );
}
