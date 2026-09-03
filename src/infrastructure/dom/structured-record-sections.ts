import { normalizeFieldText } from '../../domain/matching/normalize-field-text';
import { scanDomFields } from './extract-field-contexts';

export type StructuredRecordTargets = {
  experience: number;
  education: number;
};

const KIND_TERMS = {
  experience: ['experience', 'work experience', 'employment', 'work history'],
  education: ['education', 'academic', 'school'],
} as const;

const ADD_TERMS = ['add', 'add another', 'add more', 'new'];

function detectedRecordCount(
  root: ParentNode,
  origin: string,
  kind: keyof StructuredRecordTargets,
): number {
  return new Set(
    scanDomFields(root, origin)
      .map((field) => field.context.structuredRecord)
      .filter((record) => record?.kind === kind)
      .map((record) => record?.recordIndex),
  ).size;
}

function controlText(control: HTMLElement): string {
  if (control instanceof HTMLInputElement) {
    return normalizeFieldText(
      control.getAttribute('aria-label') || control.value || control.title,
    );
  }
  return normalizeFieldText(
    control.getAttribute('aria-label') || control.title || control.textContent || '',
  );
}

function sectionText(control: HTMLElement): string {
  const section = control.closest('section, article, fieldset, [role="group"]');
  if (section === null) return '';
  const heading = section.querySelector(
    ':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > legend',
  );
  return normalizeFieldText(
    heading?.textContent || section.getAttribute('aria-label') || '',
  );
}

function containsAny(value: string, terms: readonly string[]): boolean {
  return terms.some((term) => value.includes(normalizeFieldText(term)));
}

function isAddControlForKind(
  control: HTMLElement,
  kind: keyof StructuredRecordTargets,
): boolean {
  if (
    control instanceof HTMLButtonElement &&
    (control.type === 'submit' || control.disabled)
  ) {
    return false;
  }
  if (control.getAttribute('aria-disabled') === 'true') return false;

  const label = controlText(control);
  if (!containsAny(label, ADD_TERMS)) return false;

  const kindTerms = KIND_TERMS[kind];
  if (containsAny(label, kindTerms)) return true;

  const nearbySection = sectionText(control);
  return containsAny(nearbySection, kindTerms);
}

function findAddControl(
  root: ParentNode,
  kind: keyof StructuredRecordTargets,
): HTMLElement | null {
  return (
    Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, [role="button"], input[type="button"]',
      ),
    ).find((control) => isAddControlForKind(control, kind)) ?? null
  );
}

function waitForRecordIncrease(
  root: ParentNode,
  origin: string,
  kind: keyof StructuredRecordTargets,
  previousCount: number,
  timeoutMs = 600,
): Promise<boolean> {
  if (detectedRecordCount(root, origin, kind) > previousCount) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const observerRoot = root instanceof Document ? root.documentElement : root;
    if (!(observerRoot instanceof Node)) {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      resolve(result);
    };
    const observer = new MutationObserver(() => {
      if (detectedRecordCount(root, origin, kind) > previousCount) {
        finish(true);
      }
    });
    observer.observe(observerRoot, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      finish(detectedRecordCount(root, origin, kind) > previousCount);
    }, timeoutMs);
  });
}

async function ensureKindSlots(
  root: ParentNode,
  origin: string,
  kind: keyof StructuredRecordTargets,
  desired: number,
): Promise<number> {
  const boundedDesired = Math.min(Math.max(desired, 0), 20);
  let detected = detectedRecordCount(root, origin, kind);

  while (detected < boundedDesired) {
    const addControl = findAddControl(root, kind);
    if (addControl === null) break;

    addControl.click();
    const increased = await waitForRecordIncrease(
      root,
      origin,
      kind,
      detected,
    );
    if (!increased) break;
    detected = detectedRecordCount(root, origin, kind);
  }

  return detected;
}

export async function ensureStructuredRecordSlots(
  root: ParentNode,
  origin: string,
  targets: StructuredRecordTargets,
): Promise<{ experience: number; education: number }> {
  const experience = await ensureKindSlots(
    root,
    origin,
    'experience',
    targets.experience,
  );
  const education = await ensureKindSlots(
    root,
    origin,
    'education',
    targets.education,
  );
  return { experience, education };
}