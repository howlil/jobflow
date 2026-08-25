import type { FieldCorrection } from '../../domain/corrections/correction-schema';

export type CorrectionKey = Pick<
  FieldCorrection,
  'origin' | 'formFingerprint' | 'fieldFingerprint'
>;

export interface CorrectionRepository {
  listAll(): Promise<FieldCorrection[]>;
  listForOrigin(origin: string): Promise<FieldCorrection[]>;
  upsert(correction: FieldCorrection): Promise<void>;
  remove(key: CorrectionKey): Promise<void>;
  removeForOrigin(origin: string): Promise<void>;
  clear(): Promise<void>;
}
