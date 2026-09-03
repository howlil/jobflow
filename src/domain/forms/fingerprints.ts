import type { FieldContext } from './field-context';
import { normalizeFieldText } from '../matching/normalize-field-text';

function hashText(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function createFieldFingerprint(context: FieldContext): string {
  const stableParts = [
    context.controlKind,
    normalizeFieldText(context.inputType),
    normalizeFieldText(context.label),
    normalizeFieldText(context.name),
    normalizeFieldText(context.placeholder),
    normalizeFieldText(context.ariaLabel),
    normalizeFieldText(context.sectionText),
    context.options
      .map(
        (option) =>
          `${normalizeFieldText(option.value)}:${normalizeFieldText(option.label)}`,
      )
      .join('|'),
    context.structuredRecord === undefined
      ? ''
      : `${context.structuredRecord.kind}:${context.structuredRecord.recordIndex}:${context.structuredRecord.field}`,
  ];

  return `fld_${hashText(stableParts.join('::'))}`;
}