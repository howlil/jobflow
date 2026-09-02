import type {
  FillExecutionResult,
  FillInstruction,
  FillValue,
} from '../../application/prepare-fill/prepare-fill-plan';
import { normalizeFieldText } from '../../domain/matching/normalize-field-text';
import { scanDomFields, type ScannedDomField } from './extract-field-contexts';

function dispatchEvents(control: HTMLElement, includeInput = true): void {
  if (includeInput) {
    control.dispatchEvent(new Event('input', { bubbles: true }));
  }
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function browserDateValue(value: string): string {
  const displayDateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (displayDateMatch === null) return value;

  const [, day, month, year] = displayDateMatch;
  return `${year}-${month}-${day}`;
}

function setInputValue(control: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  setter?.call(
    control,
    control.type === 'date' ? browserDateValue(value) : value,
  );
  dispatchEvents(control);
}

function setTextareaValue(control: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  )?.set;
  setter?.call(control, value);
  dispatchEvents(control);
}

function setChecked(control: HTMLInputElement, checked: boolean): void {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'checked',
  )?.set;
  setter?.call(control, checked);
  dispatchEvents(control);
}

function fillSelect(control: HTMLSelectElement, value: string): boolean {
  const normalized = normalizeFieldText(value);
  const option = Array.from(control.options).find(
    (candidate) =>
      candidate.value === value ||
      normalizeFieldText(candidate.textContent ?? '') === normalized,
  );
  if (option === undefined) return false;

  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value',
  )?.set;
  setter?.call(control, option.value);
  dispatchEvents(control);
  return true;
}

function fillRadio(field: ScannedDomField, value: string): boolean {
  const normalized = normalizeFieldText(value);
  const index = field.context.options.findIndex(
    (option) =>
      option.value === value || normalizeFieldText(option.label) === normalized,
  );
  const control = field.controls[index];
  if (!(control instanceof HTMLInputElement)) return false;

  setChecked(control, true);
  return true;
}

function booleanValue(value: FillValue): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return null;

  const normalized = normalizeFieldText(value);
  if (['yes', 'true', '1', 'ya', 'iya'].includes(normalized)) return true;
  if (['no', 'false', '0', 'tidak'].includes(normalized)) return false;
  return null;
}

function fillField(
  field: ScannedDomField,
  instruction: FillInstruction,
): boolean {
  const first = field.controls[0];
  if (first === undefined || instruction.controlKind === 'file') return false;

  if (instruction.controlKind === 'radio') {
    return typeof instruction.value === 'string'
      ? fillRadio(field, instruction.value)
      : false;
  }

  if (instruction.controlKind === 'checkbox') {
    if (!(first instanceof HTMLInputElement)) return false;
    const checked = booleanValue(instruction.value);
    if (checked === null) return false;
    setChecked(first, checked);
    return true;
  }

  if (instruction.controlKind === 'select') {
    if (!(first instanceof HTMLSelectElement)) return false;
    if (typeof instruction.value !== 'string') return false;
    return fillSelect(first, instruction.value);
  }

  if (typeof instruction.value !== 'string') return false;

  if (first instanceof HTMLInputElement) {
    setInputValue(first, instruction.value);
    return true;
  }

  if (first instanceof HTMLTextAreaElement) {
    setTextareaValue(first, instruction.value);
    return true;
  }

  return false;
}

export function applyFillInstructions(
  root: ParentNode,
  origin: string,
  instructions: FillInstruction[],
): FillExecutionResult[] {
  const fields = scanDomFields(root, origin);
  const byFingerprint = new Map(
    fields.map((field) => [field.context.fieldFingerprint, field]),
  );

  return instructions.map((instruction) => {
    const field = byFingerprint.get(instruction.fieldFingerprint);
    if (field === undefined) {
      return {
        fieldFingerprint: instruction.fieldFingerprint,
        status: 'not-found' as const,
      };
    }

    return {
      fieldFingerprint: instruction.fieldFingerprint,
      status: fillField(field, instruction)
        ? ('filled' as const)
        : ('unsupported' as const),
    };
  });
}
