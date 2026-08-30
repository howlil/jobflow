import { useState, type ReactNode } from 'react';

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

export function dateInputValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const slashDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (slashDate !== null) {
    const [, day, month, year] = slashDate;
    return `${year}-${month}-${day}`;
  }

  return '';
}

export function dateInputProps(value: string) {
  return {
    type: 'date' as const,
    value: dateInputValue(value),
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

export function addLinkedSkill(
  current: string[] | undefined,
  skillName: string,
): string[] {
  const normalized = skillName.trim().replace(/\s+/g, ' ');
  if (normalized === '') return current ?? [];
  const values = current ?? [];
  const exists = values.some(
    (value) =>
      value.trim().replace(/\s+/g, ' ').toLowerCase() ===
      normalized.toLowerCase(),
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
