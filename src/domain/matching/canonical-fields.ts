export const CANONICAL_FIELDS = [
  'personal.legalName.first',
  'personal.legalName.middle',
  'personal.legalName.last',
  'personal.preferredName',
  'contact.email.primary',
  'contact.phone.primary',
  'contact.whatsapp',
  'contact.address.city',
  'contact.address.state',
  'contact.address.country',
  'contact.address.postalCode',
  'links.linkedin',
  'links.github',
  'links.portfolio',
  'professional.headline',
  'jobPreferences.willingToRelocate',
  'jobPreferences.willingToTravel',
  'jobPreferences.availabilityDate',
] as const;

export type CanonicalField = (typeof CANONICAL_FIELDS)[number];

export function isCanonicalField(value: unknown): value is CanonicalField {
  return (
    typeof value === 'string' &&
    CANONICAL_FIELDS.some((candidate) => candidate === value)
  );
}
