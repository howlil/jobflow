import type {
  ControlKind,
  EducationRecordField,
  ExperienceRecordField,
  FieldContext,
  FieldOption,
  StructuredRecordContext,
} from '../../domain/forms/field-context';
import { createFieldFingerprint } from '../../domain/forms/fingerprints';
import { normalizeFieldText } from '../../domain/matching/normalize-field-text';

type NativeControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type LiveControl = HTMLElement;

export type ScannedDomField = {
  context: FieldContext;
  controls: LiveControl[];
};

const CONTROL_SELECTOR =
  'input, textarea, select, [role="combobox"], [role="checkbox"], [role="radio"], [aria-haspopup="listbox"]';

const UNSUPPORTED_INPUT_TYPES = new Set([
  'hidden',
  'submit',
  'button',
  'reset',
  'image',
]);

const EXPERIENCE_TERMS = [
  'experience',
  'work experience',
  'employment',
  'employment history',
  'work history',
  'pengalaman kerja',
];
const EDUCATION_TERMS = [
  'education',
  'education history',
  'academic background',
  'school history',
  'pendidikan',
];

function hashText(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function cleanText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function isNativeControl(control: LiveControl): control is NativeControl {
  return (
    control instanceof HTMLInputElement ||
    control instanceof HTMLTextAreaElement ||
    control instanceof HTMLSelectElement
  );
}

function inputType(control: LiveControl): string {
  if (control instanceof HTMLInputElement) return control.type || 'text';
  if (control instanceof HTMLTextAreaElement) return 'textarea';
  if (control instanceof HTMLSelectElement) return 'select';
  if (
    control.getAttribute('role') === 'combobox' ||
    control.getAttribute('aria-haspopup') === 'listbox'
  ) {
    return 'combobox';
  }
  return control.getAttribute('role') ?? 'custom';
}

function controlKind(control: LiveControl): ControlKind {
  if (control instanceof HTMLTextAreaElement) return 'textarea';
  if (control instanceof HTMLSelectElement) return 'select';
  if (control instanceof HTMLInputElement) {
    if (control.type === 'checkbox') return 'checkbox';
    if (control.type === 'radio') return 'radio';
    if (control.type === 'file') return 'file';
    return 'input';
  }

  const role = control.getAttribute('role');
  if (role === 'checkbox') return 'checkbox';
  if (role === 'radio') return 'radio';
  if (
    role === 'combobox' ||
    control.getAttribute('aria-haspopup') === 'listbox'
  ) {
    return 'select';
  }
  return 'input';
}

function labelledByText(control: LiveControl): string {
  const ids = cleanText(control.getAttribute('aria-labelledby'))
    .split(' ')
    .filter(Boolean);
  if (ids.length === 0) return '';
  return cleanText(
    ids
      .map((id) => control.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' '),
  );
}

function explicitLabel(control: LiveControl): string {
  if (control.id) {
    const matching = control.ownerDocument.querySelector<HTMLLabelElement>(
      `label[for="${CSS.escape(control.id)}"]`,
    );
    if (matching !== null) return cleanText(matching.textContent);
  }

  return (
    cleanText(control.closest('label')?.textContent) ||
    labelledByText(control) ||
    cleanText(control.getAttribute('aria-label'))
  );
}

function radioGroupContainer(control: LiveControl): Element | null {
  return control.closest('[role="radiogroup"], fieldset');
}

function radioGroupLabel(control: LiveControl): string {
  const group = radioGroupContainer(control);
  if (group !== null) {
    const legend = group.querySelector(':scope > legend');
    const label =
      cleanText(legend?.textContent) ||
      cleanText(group.getAttribute('aria-label')) ||
      cleanText(
        group.getAttribute('aria-labelledby')
          ? group.ownerDocument.getElementById(
              group.getAttribute('aria-labelledby') ?? '',
            )?.textContent
          : '',
      );
    if (label) return label;
  }
  return explicitLabel(control);
}

function optionLabel(control: LiveControl): string {
  return (
    explicitLabel(control) ||
    cleanText(control.getAttribute('aria-label')) ||
    cleanText(control.textContent) ||
    (control instanceof HTMLInputElement ? control.value : '')
  );
}

function selectOptions(control: HTMLSelectElement): FieldOption[] {
  return Array.from(control.options).map((option) => ({
    value: option.value,
    label: cleanText(option.textContent),
  }));
}

function customOptions(control: LiveControl): FieldOption[] {
  const controlsId = cleanText(control.getAttribute('aria-controls'));
  const root = controlsId
    ? control.ownerDocument.getElementById(controlsId)
    : control.closest('[role="listbox"]');
  if (root === null) return [];

  return Array.from(root.querySelectorAll<HTMLElement>('[role="option"]')).map(
    (option) => ({
      value:
        cleanText(option.getAttribute('data-value')) ||
        cleanText(option.getAttribute('value')) ||
        cleanText(option.textContent),
      label:
        cleanText(option.getAttribute('aria-label')) ||
        cleanText(option.textContent),
    }),
  );
}

function sectionText(control: LiveControl): string {
  const container = control.closest(
    'section, article, fieldset, [role="group"], [role="radiogroup"]',
  );
  if (container === null) return '';

  const heading = container.querySelector(
    ':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > legend',
  );
  return (
    cleanText(heading?.textContent) ||
    cleanText(container.getAttribute('aria-label'))
  );
}

function formFingerprint(control: LiveControl): string {
  const form = control.closest('form');
  if (form === null) return `form_${hashText('document')}`;

  const heading = form.querySelector(
    ':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > legend',
  );
  const identity: string[] = [
    form.id,
    form.getAttribute('name'),
    form.getAttribute('action'),
    form.getAttribute('method'),
    form.getAttribute('aria-label'),
    heading?.textContent,
  ].map(cleanText);

  if (identity.every((part) => part === '')) {
    const forms = Array.from(control.ownerDocument.querySelectorAll('form'));
    return `form_${hashText([...identity, `index:${forms.indexOf(form)}`].join('::'))}`;
  }

  return `form_${hashText(identity.join('::'))}`;
}

function baseContext(
  control: LiveControl,
  origin: string,
  options: FieldOption[],
  label: string,
): FieldContext {
  const context: FieldContext = {
    controlKind: controlKind(control),
    inputType: inputType(control),
    label,
    name: control.getAttribute('name') ?? '',
    id: control.id,
    placeholder: control.getAttribute('placeholder') ?? '',
    ariaLabel: control.getAttribute('aria-label') ?? '',
    options,
    sectionText: sectionText(control),
    origin,
    formFingerprint: formFingerprint(control),
    fieldFingerprint: '',
  };

  return {
    ...context,
    fieldFingerprint: createFieldFingerprint(context),
  };
}

function isSupported(control: LiveControl): boolean {
  if (control instanceof HTMLInputElement) {
    return !UNSUPPORTED_INPUT_TYPES.has(control.type);
  }
  if (isNativeControl(control)) return true;
  const role = control.getAttribute('role');
  return (
    role === 'combobox' ||
    role === 'checkbox' ||
    role === 'radio' ||
    control.getAttribute('aria-haspopup') === 'listbox'
  );
}

function fieldSignals(context: FieldContext): string {
  return normalizeFieldText(
    [
      context.label,
      context.ariaLabel,
      context.placeholder,
      context.name,
      context.id,
    ].join(' '),
  );
}

function containsAny(value: string, terms: readonly string[]): boolean {
  return terms.some((term) => value.includes(normalizeFieldText(term)));
}

function experienceField(signals: string): ExperienceRecordField | null {
  if (containsAny(signals, ['employment type', 'job type']))
    return 'employmentType';
  if (
    containsAny(signals, [
      'start date',
      'date started',
      'from date',
      'start month',
    ])
  ) {
    return 'startDate';
  }
  if (
    containsAny(signals, ['end date', 'date ended', 'to date', 'end month'])
  ) {
    return 'endDate';
  }
  if (
    containsAny(signals, [
      'currently work',
      'current role',
      'current job',
      'present',
      'still employed',
    ])
  ) {
    return 'current';
  }
  if (
    containsAny(signals, [
      'description',
      'responsibilities',
      'responsibility',
      'achievements',
    ])
  ) {
    return 'description';
  }
  if (containsAny(signals, ['company', 'employer', 'organization']))
    return 'company';
  if (
    containsAny(signals, [
      'job title',
      'position title',
      'position',
      'role',
      'title',
    ])
  ) {
    return 'title';
  }
  if (containsAny(signals, ['location', 'city'])) return 'location';
  return null;
}

function educationField(signals: string): EducationRecordField | null {
  if (containsAny(signals, ['max gpa', 'maximum gpa', 'gpa scale']))
    return 'maxGpa';
  if (containsAny(signals, ['gpa', 'grade point average'])) return 'gpa';
  if (
    containsAny(signals, ['field of study', 'major', 'study field', 'program'])
  ) {
    return 'fieldOfStudy';
  }
  if (
    containsAny(signals, ['institution', 'university', 'college', 'school'])
  ) {
    return 'institution';
  }
  if (containsAny(signals, ['degree', 'qualification'])) return 'degree';
  if (
    containsAny(signals, [
      'start date',
      'date started',
      'from date',
      'start year',
    ])
  ) {
    return 'startDate';
  }
  if (
    containsAny(signals, ['end date', 'graduation date', 'to date', 'end year'])
  ) {
    return 'endDate';
  }
  if (containsAny(signals, ['description', 'activities'])) return 'description';
  if (containsAny(signals, ['location', 'city'])) return 'location';
  return null;
}

type StructuredKind = StructuredRecordContext['kind'];
type StructuredField = ExperienceRecordField | EducationRecordField;

function fieldForKind(
  kind: StructuredKind,
  context: FieldContext,
): StructuredField | null {
  const signals = fieldSignals(context);
  return kind === 'experience'
    ? experienceField(signals)
    : educationField(signals);
}

function hasDirectKindSignal(
  kind: StructuredKind,
  context: FieldContext,
): boolean {
  const signals = normalizeFieldText(
    [context.sectionText, context.name, context.id].join(' '),
  );
  return containsAny(
    signals,
    kind === 'experience' ? EXPERIENCE_TERMS : EDUCATION_TERMS,
  );
}

function rawContextForControl(
  control: LiveControl,
  origin: string,
): FieldContext {
  const options =
    control instanceof HTMLSelectElement
      ? selectOptions(control)
      : control.getAttribute('role') === 'combobox' ||
          control.getAttribute('aria-haspopup') === 'listbox'
        ? customOptions(control)
        : [];
  return baseContext(control, origin, options, explicitLabel(control));
}

function nearestRecordContainer(
  control: LiveControl,
  kind: StructuredKind,
  origin: string,
): Element | null {
  let current = control.parentElement;
  const requiredAnchor =
    kind === 'experience' ? ['company', 'title'] : ['institution', 'degree'];

  while (current !== null && !(current instanceof HTMLFormElement)) {
    const descendants = Array.from(
      current.querySelectorAll<HTMLElement>(CONTROL_SELECTOR),
    ).filter(isSupported);
    if (descendants.length >= 2 && descendants.length <= 12) {
      const fields = new Set(
        descendants
          .map((candidate) =>
            fieldForKind(kind, rawContextForControl(candidate, origin)),
          )
          .filter((field): field is StructuredField => field !== null),
      );
      const hasAnchor = requiredAnchor.some((anchor) =>
        fields.has(anchor as StructuredField),
      );
      if (fields.size >= 2 && hasAnchor) return current;
    }
    current = current.parentElement;
  }

  return null;
}

function explicitRecordIndex(
  control: LiveControl,
  context: FieldContext,
): number | null {
  const identity = `${context.name} ${context.id}`;
  const bracket = /\[(\d+)\]/.exec(identity);
  if (bracket !== null) return Number(bracket[1]);

  const keyword = /(?:experience|employment|education|school)[_-]?(\d+)/i.exec(
    identity,
  );
  if (keyword !== null) return Math.max(0, Number(keyword[1]) - 1);

  const section = /(?:experience|employment|education)\s+(\d+)/i.exec(
    context.sectionText,
  );
  return section === null ? null : Math.max(0, Number(section[1]) - 1);
}

function documentOrder(left: Element, right: Element): number {
  if (left === right) return 0;
  const position = left.compareDocumentPosition(right);
  return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function assignStructuredRecordContexts(
  fields: ScannedDomField[],
  origin: string,
): void {
  for (const kind of ['experience', 'education'] as const) {
    const candidates = fields
      .map((field) => {
        const control = field.controls[0];
        if (control === undefined) return null;
        const structuredField = fieldForKind(kind, field.context);
        if (structuredField === null) return null;
        const container = nearestRecordContainer(control, kind, origin);
        if (!hasDirectKindSignal(kind, field.context) && container === null)
          return null;
        return { field, control, structuredField, container };
      })
      .filter(
        (
          candidate,
        ): candidate is {
          field: ScannedDomField;
          control: LiveControl;
          structuredField: StructuredField;
          container: Element | null;
        } => candidate !== null,
      );

    const containers = Array.from(
      new Set(
        candidates
          .map((candidate) => candidate.container)
          .filter((container): container is Element => container !== null),
      ),
    ).sort(documentOrder);

    for (const candidate of candidates) {
      const explicitIndex = explicitRecordIndex(
        candidate.control,
        candidate.field.context,
      );
      const containerIndex =
        candidate.container === null
          ? 0
          : Math.max(0, containers.indexOf(candidate.container));
      const recordIndex = explicitIndex ?? containerIndex;
      const structuredRecord =
        kind === 'experience'
          ? {
              kind,
              recordIndex,
              field: candidate.structuredField as ExperienceRecordField,
            }
          : {
              kind,
              recordIndex,
              field: candidate.structuredField as EducationRecordField,
            };
      candidate.field.context = {
        ...candidate.field.context,
        structuredRecord,
        fieldFingerprint: '',
      };
      candidate.field.context.fieldFingerprint = createFieldFingerprint(
        candidate.field.context,
      );
    }
  }
}

function radioGroupKey(control: LiveControl): string {
  const formKey = formFingerprint(control);
  if (control instanceof HTMLInputElement && control.name) {
    return `${formKey}::name:${control.name}`;
  }
  const group = radioGroupContainer(control);
  if (group !== null) {
    return `${formKey}::group:${group.id || group.getAttribute('aria-label') || radioGroupLabel(control)}`;
  }
  return `${formKey}::radio:${radioGroupLabel(control)}`;
}

function sameRadioGroup(left: LiveControl, right: LiveControl): boolean {
  return radioGroupKey(left) === radioGroupKey(right);
}

export function scanDomFields(
  root: ParentNode,
  origin: string,
): ScannedDomField[] {
  const controls = Array.from(
    root.querySelectorAll<HTMLElement>(CONTROL_SELECTOR),
  ).filter(isSupported);

  const fields: ScannedDomField[] = [];
  const handledRadioGroups = new Set<string>();

  for (const control of controls) {
    if (controlKind(control) === 'radio') {
      const groupKey = radioGroupKey(control);
      if (handledRadioGroups.has(groupKey)) continue;
      handledRadioGroups.add(groupKey);

      const groupControls = controls.filter(
        (candidate) =>
          controlKind(candidate) === 'radio' &&
          sameRadioGroup(candidate, control),
      );
      const options = groupControls.map((candidate) => ({
        value:
          candidate instanceof HTMLInputElement
            ? candidate.value
            : cleanText(candidate.getAttribute('data-value')) ||
              optionLabel(candidate),
        label: optionLabel(candidate),
      }));
      fields.push({
        context: baseContext(
          control,
          origin,
          options,
          radioGroupLabel(control),
        ),
        controls: groupControls,
      });
      continue;
    }

    const options =
      control instanceof HTMLSelectElement
        ? selectOptions(control)
        : controlKind(control) === 'select'
          ? customOptions(control)
          : [];
    fields.push({
      context: baseContext(control, origin, options, explicitLabel(control)),
      controls: [control],
    });
  }

  assignStructuredRecordContexts(fields, origin);
  return fields;
}

export function extractFieldContexts(
  root: ParentNode,
  origin: string,
): FieldContext[] {
  return scanDomFields(root, origin).map((field) => field.context);
}
