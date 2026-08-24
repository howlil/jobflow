import { describe, expect, it } from 'vitest';

import { SensitiveProfileSchema } from './profile-schema';
import { createEmptySensitiveProfile } from './create-empty-sensitive-profile';

describe('empty sensitive profile', () => {
  it('creates the complete sensitive profile shape with empty values', () => {
    const profile = createEmptySensitiveProfile();

    expect(SensitiveProfileSchema.parse(profile)).toEqual(profile);
    expect(profile.identity).toEqual({
      nationalId: '',
      passport: '',
      taxId: '',
      otherGovernmentIds: [],
    });
    expect(profile.compensation.current.amount).toBeNull();
    expect(profile.compensation.expected.amount).toBeNull();
    expect(profile.references).toEqual([]);
    expect(profile.family).toEqual([]);
    expect(profile.sensitiveDocuments).toEqual([]);
  });
});
