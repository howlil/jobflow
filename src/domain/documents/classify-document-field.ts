import type { FieldContext } from '../forms/field-context';

export type DocumentFieldIntent =
  | 'resume'
  | 'cover_letter'
  | 'portfolio'
  | 'transcript'
  | 'certificate'
  | 'unknown';

export type DocumentFieldIntentResult = {
  intent: DocumentFieldIntent;
  evidence: string[];
};

type IntentRule = {
  intent: Exclude<DocumentFieldIntent, 'unknown'>;
  aliases: string[];
};

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'cover_letter',
    aliases: ['cover letter', 'motivation letter', 'application letter'],
  },
  {
    intent: 'transcript',
    aliases: ['academic transcript', 'transcript', 'grade report'],
  },
  {
    intent: 'certificate',
    aliases: ['professional certificate', 'certificate', 'certification'],
  },
  {
    intent: 'portfolio',
    aliases: ['portfolio', 'work sample', 'work samples'],
  },
  {
    intent: 'resume',
    aliases: ['curriculum vitae', 'resume', 'cv'],
  },
];

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAlias(value: string, alias: string): boolean {
  const normalizedAlias = normalize(alias);
  if (normalizedAlias === '') return false;
  return ` ${value} `.includes(` ${normalizedAlias} `);
}

export function classifyDocumentFieldIntent(
  field: FieldContext,
): DocumentFieldIntentResult {
  if (field.controlKind !== 'file') {
    return { intent: 'unknown', evidence: [] };
  }

  const signals = [
    ['label', field.label],
    ['aria', field.ariaLabel],
    ['name', field.name],
    ['id', field.id],
    ['placeholder', field.placeholder],
    ['section', field.sectionText],
  ] as const;

  for (const rule of INTENT_RULES) {
    const evidence = signals.flatMap(([source, rawValue]) => {
      const value = normalize(rawValue);
      if (value === '') return [];
      const alias = rule.aliases.find((candidate) =>
        containsAlias(value, candidate),
      );
      return alias === undefined ? [] : [`${source}:${normalize(alias)}`];
    });

    if (evidence.length > 0) {
      return { intent: rule.intent, evidence };
    }
  }

  return { intent: 'unknown', evidence: [] };
}
