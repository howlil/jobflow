import type {
  FillAnalysis,
  FillInstruction,
} from '../prepare-fill/prepare-fill-plan';
import type { SensitiveFieldPath, SensitiveFieldValue } from './vault-messages';

export function createSensitiveFillInstructions(
  items: FillAnalysis[],
  values: Partial<Record<SensitiveFieldPath, SensitiveFieldValue>>,
): FillInstruction[] {
  const instructions: FillInstruction[] = [];

  for (const item of items) {
    if (item.match.status !== 'sensitive') continue;
    const value = values[item.match.field];
    if (!hasSensitiveFillValue(value)) continue;

    instructions.push({
      fieldFingerprint: item.context.fieldFingerprint,
      field: item.match.field,
      value: typeof value === 'number' ? String(value) : value,
      controlKind: item.context.controlKind,
    });
  }

  return instructions;
}

function hasSensitiveFillValue(
  value: SensitiveFieldValue | undefined,
): value is Exclude<SensitiveFieldValue, null> {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  return value.trim().length > 0;
}
