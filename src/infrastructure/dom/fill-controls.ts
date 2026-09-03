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

function fillNativeSelect(control: HTMLSelectElement, value: string): boolean {
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

function optionValue(option: HTMLElement): string {
  return (
    option.getAttribute('data-value') ??
    option.getAttribute('value') ??
    option.getAttribute('aria-label') ??
    option.textContent ??
    ''
  );
}

function controlledOptionRoot(control: HTMLElement): ParentNode {
  const controlledId = control.getAttribute('aria-controls');
  if (controlledId !== null) {
    const controlled = control.ownerDocument.getElementById(controlledId);
    if (controlled !== null) return controlled;
  }
  return control.ownerDocument;
}

function findCustomOption(control: HTMLElement, value: string): HTMLElement | null {
  const normalized = normalizeFieldText(value);
  const root = controlledOptionRoot(control);
  const options = Array.from(
    root.querySelectorAll<HTMLElement>('[role="option"]'),
  );
  return (
    options.find(
      (option) =>
        normalizeFieldText(optionValue(option)) === normalized ||
        normalizeFieldText(option.textContent ?? '') === normalized,
    ) ?? null
  );
}

function fillCustomSelect(control: HTMLElement, value: string): boolean {
  control.click();

  let option = findCustomOption(control, value);
  if (option === null && control instanceof HTMLInputElement) {
    setInputValue(control, value);
    option = findCustomOption(control, value);
  }

  if (option !== null) {
    option.click();
    dispatchEvents(control, false);
    const selected = option.getAttribute('aria-selected');
    return selected === null || selected === 'true';
  }

  if (
    control instanceof HTMLInputElement &&
    control.getAttribute('aria-autocomplete') !== 'list'
  ) {
    return control.value === value;
  }

  return false;
}

function fillRadio(field: ScannedDomField, value: string): boolean {
  const normalized = normalizeFieldText(value);
  const index = field.context.options.findIndex(
    (option) =>
      option.value === value || normalizeFieldText(option.label) === normalized,
  );
  const control = field.controls[index];
  if (control === undefined) return false;

  if (control instanceof HTMLInputElement) {
    setChecked(control, true);
    return control.checked;
  }

  control.click();
  const checked = control.getAttribute('aria-checked');
  return checked === null || checked === 'true';
}

function booleanValue(value: FillValue): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return null;

  const normalized = normalizeFieldText(value);
  if (['yes', 'true', '1', 'ya', 'iya'].includes(normalized)) return true;
  if (['no', 'false', '0', 'tidak'].includes(normalized)) return false;
  return null;
}

function fillCheckbox(control: HTMLElement, checked: boolean): boolean {
  if (control instanceof HTMLInputElement) {
    setChecked(control, checked);
    return control.checked === checked;
  }

  const current = control.getAttribute('aria-checked');
  if (current === String(checked)) return true;
  if (current !== 'true' && current !== 'false') return false;
  control.click();
  return control.getAttribute('aria-checked') === String(checked);
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
    const checked = booleanValue(instruction.value);
    return checked === null ? false : fillCheckbox(first, checked);
  }

  if (instruction.controlKind === 'select') {
    if (typeof instruction.value !== 'string') return false;
    return first instanceof HTMLSelectElement
      ? fillNativeSelect(first, instruction.value)
      : fillCustomSelect(first, instruction.value);
  }

  if (typeof instruction.value !== 'string') return false;

  if (first instanceof HTMLInputElement) {
    const expectedValue =
      first.type === 'date'
        ? browserDateValue(instruction.value)
        : instruction.value;
    setInputValue(first, instruction.value);
    return first.value === expectedValue;
  }

  if (first instanceof HTMLTextAreaElement) {
    setTextareaValue(first, instruction.value);
    return first.value === instruction.value;
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