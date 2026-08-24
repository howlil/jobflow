import type { SensitiveProfile } from './profile-schema';

export function createEmptySensitiveProfile(): SensitiveProfile {
  return {
    personal: {
      gender: '',
      birthPlace: '',
      birthDate: '',
      nationality: '',
      maritalStatus: '',
    },
    identity: {
      nationalId: '',
      passport: '',
      taxId: '',
      otherGovernmentIds: [],
    },
    compensation: {
      current: { amount: null, currency: '', payPeriod: '' },
      expected: { amount: null, currency: '', payPeriod: '' },
      negotiable: false,
    },
    workEligibility: {
      citizenships: [],
      authorizations: [],
      visaStatus: '',
      sponsorshipRequired: null,
    },
    references: [],
    family: [],
    emergencyContact: null,
    drivingLicences: [],
    physical: {
      heightCm: null,
      weightKg: null,
    },
    demographics: {},
    sensitiveDocuments: [],
  };
}
