import { normalizeFieldText } from './normalize-field-text';

export type SensitiveCanonicalField =
  | 'personal.gender'
  | 'personal.birthPlace'
  | 'personal.birthDate'
  | 'personal.nationality'
  | 'personal.maritalStatus'
  | 'identity.nationalId'
  | 'identity.passport'
  | 'identity.taxId'
  | 'compensation.current.amount'
  | 'compensation.expected.amount'
  | 'workEligibility.sponsorshipRequired';

type SensitiveAliasDefinition = {
  field: SensitiveCanonicalField;
  aliases: string[];
};

const SENSITIVE_ALIASES: SensitiveAliasDefinition[] = [
  {
    field: 'personal.birthDate',
    aliases: ['date of birth', 'birth date', 'dob', 'tanggal lahir'],
  },
  {
    field: 'personal.birthPlace',
    aliases: ['place of birth', 'birth place', 'tempat lahir'],
  },
  {
    field: 'personal.gender',
    aliases: ['gender', 'sex', 'jenis kelamin'],
  },
  {
    field: 'personal.nationality',
    aliases: ['nationality', 'citizenship', 'kewarganegaraan'],
  },
  {
    field: 'personal.maritalStatus',
    aliases: ['marital status', 'status perkawinan'],
  },
  {
    field: 'identity.nationalId',
    aliases: [
      'nik',
      'national id',
      'national identity number',
      'identity number',
      'nomor ktp',
    ],
  },
  {
    field: 'identity.passport',
    aliases: ['passport', 'passport number', 'nomor paspor'],
  },
  {
    field: 'identity.taxId',
    aliases: ['tax id', 'tax number', 'npwp'],
  },
  {
    field: 'compensation.current.amount',
    aliases: ['current salary', 'current compensation', 'gaji saat ini'],
  },
  {
    field: 'compensation.expected.amount',
    aliases: [
      'expected salary',
      'expected compensation',
      'gaji yang diharapkan',
    ],
  },
  {
    field: 'workEligibility.sponsorshipRequired',
    aliases: [
      'sponsorship required',
      'visa sponsorship required',
      'require sponsorship',
    ],
  },
];

const NORMALIZED_SENSITIVE_ALIASES = SENSITIVE_ALIASES.map((definition) => ({
  field: definition.field,
  aliases: definition.aliases.map(normalizeFieldText),
}));

export function findSensitiveFieldMatch(
  values: string[],
): SensitiveCanonicalField | null {
  for (const definition of NORMALIZED_SENSITIVE_ALIASES) {
    if (definition.aliases.some((alias) => values.includes(alias))) {
      return definition.field;
    }
  }

  for (const value of values) {
    for (const definition of NORMALIZED_SENSITIVE_ALIASES) {
      if (definition.aliases.some((alias) => containsAlias(value, alias))) {
        return definition.field;
      }
    }
  }

  return null;
}

function containsAlias(value: string, alias: string): boolean {
  return (
    value.includes(` ${alias} `) ||
    value.startsWith(`${alias} `) ||
    value.endsWith(` ${alias}`)
  );
}
