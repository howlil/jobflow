import type { FieldContext } from '../forms/field-context';
import { normalizeFieldText } from './normalize-field-text';
import {
  findSensitiveFieldMatch,
  type SensitiveCanonicalField,
} from './sensitive-fields';

export type CanonicalField =
  | 'personal.legalName.first'
  | 'personal.legalName.middle'
  | 'personal.legalName.last'
  | 'personal.preferredName'
  | 'contact.email.primary'
  | 'contact.phone.primary'
  | 'contact.whatsapp'
  | 'contact.address.city'
  | 'contact.address.state'
  | 'contact.address.country'
  | 'contact.address.postalCode'
  | 'links.linkedin'
  | 'links.github'
  | 'links.portfolio'
  | 'professional.headline'
  | 'jobPreferences.willingToRelocate'
  | 'jobPreferences.willingToTravel'
  | 'jobPreferences.availabilityDate';

export type CandidateMatch = {
  field: CanonicalField;
  score: number;
};

export type MatchResult =
  | {
      status: 'ready';
      field: CanonicalField;
      reason: 'exact-alias' | 'structured-heuristic';
      sensitivity: 'normal';
    }
  | {
      status: 'review';
      candidates: CandidateMatch[];
      reason: 'ambiguous-heuristic';
      sensitivity: 'normal';
    }
  | {
      status: 'unknown';
      reason: 'file-input' | 'no-match';
    }
  | {
      status: 'sensitive';
      field: SensitiveCanonicalField;
      reason: 'exact-sensitive-alias';
      sensitivity: 'sensitive';
    };

type AliasDefinition = {
  field: CanonicalField;
  aliases: string[];
};

const ALIASES: AliasDefinition[] = [
  {
    field: 'personal.legalName.first',
    aliases: ['first name', 'given name', 'nama depan'],
  },
  {
    field: 'personal.legalName.middle',
    aliases: ['middle name', 'nama tengah'],
  },
  {
    field: 'personal.legalName.last',
    aliases: ['last name', 'surname', 'family name', 'nama belakang'],
  },
  {
    field: 'personal.preferredName',
    aliases: ['preferred name', 'display name', 'nama panggilan'],
  },
  {
    field: 'contact.email.primary',
    aliases: [
      'email',
      'email address',
      'e-mail address',
      'e mail',
      'alamat email',
    ],
  },
  {
    field: 'contact.phone.primary',
    aliases: [
      'phone',
      'phone number',
      'mobile',
      'mobile number',
      'telephone',
      'nomor hp',
      'no hp',
      'nomor telepon',
    ],
  },
  {
    field: 'contact.whatsapp',
    aliases: ['whatsapp', 'whatsapp number', 'nomor whatsapp'],
  },
  {
    field: 'contact.address.city',
    aliases: [
      'city',
      'current city',
      'city of residence',
      'kota',
      'kota domisili',
    ],
  },
  {
    field: 'contact.address.state',
    aliases: ['state', 'province', 'state province', 'provinsi'],
  },
  {
    field: 'contact.address.country',
    aliases: ['country', 'country of residence', 'negara'],
  },
  {
    field: 'contact.address.postalCode',
    aliases: ['postal code', 'zip code', 'postcode', 'kode pos'],
  },
  {
    field: 'links.linkedin',
    aliases: ['linkedin', 'linkedin profile', 'linkedin url'],
  },
  {
    field: 'links.github',
    aliases: ['github', 'github profile', 'github url'],
  },
  {
    field: 'links.portfolio',
    aliases: [
      'portfolio',
      'portfolio url',
      'personal website',
      'website portfolio',
    ],
  },
  {
    field: 'professional.headline',
    aliases: ['professional headline', 'career headline', 'headline'],
  },
  {
    field: 'jobPreferences.willingToRelocate',
    aliases: [
      'willing to relocate',
      'are you willing to relocate',
      'bersedia relokasi',
      'bersedia untuk relokasi',
    ],
  },
  {
    field: 'jobPreferences.willingToTravel',
    aliases: [
      'willing to travel',
      'are you willing to travel',
      'bersedia perjalanan dinas',
    ],
  },
  {
    field: 'jobPreferences.availabilityDate',
    aliases: [
      'availability date',
      'available from',
      'available start date',
      'tanggal mulai tersedia',
    ],
  },
];

const MATCHER_CONFIG = {
  reviewScore: 0.55,
  readyScore: 0.82,
  readyGap: 0.18,
} as const;

const NORMALIZED_ALIASES = ALIASES.map((definition) => ({
  field: definition.field,
  aliases: definition.aliases.map(normalizeFieldText),
}));

function signals(context: FieldContext): string[] {
  return [
    context.label,
    context.ariaLabel,
    context.placeholder,
    context.name,
    context.sectionText,
  ]
    .map(normalizeFieldText)
    .filter(Boolean);
}

function tokenScore(signal: string, alias: string): number {
  if (signal === alias) return 1;
  if (!signal || !alias) return 0;

  const signalTokens = new Set(signal.split(' '));
  const aliasTokens = new Set(alias.split(' '));
  const intersection = [...aliasTokens].filter((token) =>
    signalTokens.has(token),
  );
  if (intersection.length === 0) return 0;

  const precision = intersection.length / signalTokens.size;
  const recall = intersection.length / aliasTokens.size;
  return (2 * precision * recall) / (precision + recall);
}

function exactAlias(values: string[]): CanonicalField | null {
  for (const definition of NORMALIZED_ALIASES) {
    if (definition.aliases.some((alias) => values.includes(alias))) {
      return definition.field;
    }
  }
  return null;
}

function heuristicCandidates(values: string[]): CandidateMatch[] {
  const candidates = NORMALIZED_ALIASES.map((definition) => ({
    field: definition.field,
    score: Math.max(
      ...definition.aliases.flatMap((alias) =>
        values.map((value) => tokenScore(value, alias)),
      ),
      0,
    ),
  })).filter((candidate) => candidate.score >= MATCHER_CONFIG.reviewScore);

  return candidates.sort((left, right) => right.score - left.score);
}

export function matchField(context: FieldContext): MatchResult {
  if (context.controlKind === 'file' || context.inputType === 'file') {
    return { status: 'unknown', reason: 'file-input' };
  }

  const normalizedSignals = signals(context);
  const sensitive = findSensitiveFieldMatch(normalizedSignals);
  if (sensitive !== null) {
    return {
      status: 'sensitive',
      field: sensitive,
      reason: 'exact-sensitive-alias',
      sensitivity: 'sensitive',
    };
  }

  const exact = exactAlias(normalizedSignals);
  if (exact !== null) {
    return {
      status: 'ready',
      field: exact,
      reason: 'exact-alias',
      sensitivity: 'normal',
    };
  }

  if (context.inputType === 'email') {
    return {
      status: 'ready',
      field: 'contact.email.primary',
      reason: 'structured-heuristic',
      sensitivity: 'normal',
    };
  }

  if (context.inputType === 'tel') {
    return {
      status: 'ready',
      field: 'contact.phone.primary',
      reason: 'structured-heuristic',
      sensitivity: 'normal',
    };
  }

  const primaryLabel = normalizeFieldText(context.label || context.ariaLabel);
  if (primaryLabel === 'name' || primaryLabel === 'nama') {
    return {
      status: 'review',
      candidates: [
        { field: 'personal.legalName.first', score: 0.6 },
        { field: 'personal.legalName.last', score: 0.6 },
      ],
      reason: 'ambiguous-heuristic',
      sensitivity: 'normal',
    };
  }

  const candidates = heuristicCandidates(normalizedSignals);
  const best = candidates[0];
  const second = candidates[1];
  if (
    best !== undefined &&
    best.score >= MATCHER_CONFIG.readyScore &&
    best.score - (second?.score ?? 0) >= MATCHER_CONFIG.readyGap
  ) {
    return {
      status: 'ready',
      field: best.field,
      reason: 'structured-heuristic',
      sensitivity: 'normal',
    };
  }

  if (best !== undefined) {
    return {
      status: 'review',
      candidates: candidates.slice(0, 3),
      reason: 'ambiguous-heuristic',
      sensitivity: 'normal',
    };
  }

  return { status: 'unknown', reason: 'no-match' };
}
