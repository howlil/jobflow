import {
  SensitiveProfileSchema,
  type SensitiveProfile,
} from '../../domain/profile/profile-schema';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodeVaultProfile(
  profile: SensitiveProfile,
): Uint8Array<ArrayBuffer> {
  return encoder.encode(JSON.stringify(SensitiveProfileSchema.parse(profile)));
}

export function decodeVaultProfile(value: Uint8Array): SensitiveProfile {
  return SensitiveProfileSchema.parse(JSON.parse(decoder.decode(value)));
}
