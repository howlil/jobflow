import { describe, expect, it, vi } from 'vitest';

import type { DocumentBlobRepository } from './document-blob-repository';
import { createDocumentBroker } from './document-broker';
import { GET_DOCUMENT_FILE_MESSAGE } from './document-messages';

function repository(
  record: Awaited<ReturnType<DocumentBlobRepository['get']>>,
): DocumentBlobRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(record),
    remove: vi.fn().mockResolvedValue(undefined),
    has: vi.fn().mockResolvedValue(record !== null),
  };
}

describe('document broker', () => {
  it('returns only the explicitly requested document', async () => {
    const broker = createDocumentBroker(
      repository({
        id: 'resume-1',
        fileName: 'backend.txt',
        mimeType: 'text/plain',
        lastModified: 123,
        blob: new Blob(['resume data'], { type: 'text/plain' }),
      }),
    );

    const response = await broker.handle({
      type: GET_DOCUMENT_FILE_MESSAGE,
      documentId: 'resume-1',
    });

    expect(response?.ok).toBe(true);
    if (response?.ok) {
      expect(response.file.fileName).toBe('backend.txt');
      expect(atob(response.file.base64)).toBe('resume data');
    }
  });

  it('fails closed when the stored blob is missing', async () => {
    const broker = createDocumentBroker(repository(null));
    await expect(
      broker.handle({
        type: GET_DOCUMENT_FILE_MESSAGE,
        documentId: 'missing',
      }),
    ).resolves.toEqual({ ok: false, error: 'not-found' });
  });
});
