import { scanDomFields } from './extract-field-contexts';

export type AttachFileResult =
  | { status: 'attached'; fieldFingerprint: string }
  | { status: 'not-found'; fieldFingerprint: string }
  | { status: 'unsupported'; fieldFingerprint: string };

export function attachFileToField(
  root: ParentNode,
  origin: string,
  fieldFingerprint: string,
  file: File,
): AttachFileResult {
  const field = scanDomFields(root, origin).find(
    (candidate) => candidate.context.fieldFingerprint === fieldFingerprint,
  );
  if (field === undefined) return { status: 'not-found', fieldFingerprint };

  const control = field.controls[0];
  if (!(control instanceof HTMLInputElement) || control.type !== 'file') {
    return { status: 'unsupported', fieldFingerprint };
  }

  try {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    control.files = transfer.files;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return { status: 'attached', fieldFingerprint };
  } catch {
    return { status: 'unsupported', fieldFingerprint };
  }
}
