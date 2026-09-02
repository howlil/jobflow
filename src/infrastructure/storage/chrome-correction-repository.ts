import { browser } from 'wxt/browser';

import type {
  CorrectionKey,
  CorrectionRepository,
} from '../../application/corrections/correction-repository';
import {
  createEmptyStoredCorrections,
  parseStoredCorrections,
  type FieldCorrection,
  type StoredCorrectionEnvelope,
} from '../../domain/corrections/correction-schema';

export const CORRECTION_STORAGE_KEY = 'jobflow.corrections';
const LEGACY_CORRECTION_STORAGE_KEY = 'fillio.corrections';

export class ChromeCorrectionRepository implements CorrectionRepository {
  private async load(): Promise<StoredCorrectionEnvelope> {
    const stored = await browser.storage.local.get([
      CORRECTION_STORAGE_KEY,
      LEGACY_CORRECTION_STORAGE_KEY,
    ]);
    const value =
      stored[CORRECTION_STORAGE_KEY] ?? stored[LEGACY_CORRECTION_STORAGE_KEY];
    if (value === undefined) return createEmptyStoredCorrections();

    const envelope = parseStoredCorrections(value);
    if (
      stored[CORRECTION_STORAGE_KEY] === undefined ||
      value.schemaVersion !== envelope.schemaVersion
    ) {
      await this.save(envelope.entries);
    }
    return envelope;
  }

  private async save(entries: FieldCorrection[]): Promise<void> {
    await browser.storage.local.set({
      [CORRECTION_STORAGE_KEY]: { schemaVersion: 2, entries },
    });
  }

  async listAll(): Promise<FieldCorrection[]> {
    const stored = await this.load();
    return [...stored.entries];
  }

  async listForOrigin(origin: string): Promise<FieldCorrection[]> {
    const stored = await this.load();
    return stored.entries.filter((entry) => entry.origin === origin);
  }

  async upsert(correction: FieldCorrection): Promise<void> {
    const stored = await this.load();
    const entries = stored.entries.filter(
      (entry) =>
        entry.origin !== correction.origin ||
        entry.formFingerprint !== correction.formFingerprint ||
        entry.fieldFingerprint !== correction.fieldFingerprint,
    );
    entries.push(correction);
    await this.save(entries);
  }

  async remove(key: CorrectionKey): Promise<void> {
    const stored = await this.load();
    await this.save(
      stored.entries.filter(
        (entry) =>
          entry.origin !== key.origin ||
          entry.formFingerprint !== key.formFingerprint ||
          entry.fieldFingerprint !== key.fieldFingerprint,
      ),
    );
  }

  async removeForOrigin(origin: string): Promise<void> {
    const stored = await this.load();
    await this.save(stored.entries.filter((entry) => entry.origin !== origin));
  }

  async clear(): Promise<void> {
    await this.save([]);
  }
}
