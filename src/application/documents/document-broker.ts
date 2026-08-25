import type { DocumentBlobRepository } from './document-blob-repository';
import {
  isGetDocumentFileMessage,
  type GetDocumentFileResponse,
} from './document-messages';

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

export function createDocumentBroker(repository: DocumentBlobRepository) {
  return {
    async handle(
      message: unknown,
    ): Promise<GetDocumentFileResponse | undefined> {
      if (!isGetDocumentFileMessage(message)) return undefined;
      try {
        const stored = await repository.get(message.documentId);
        if (stored === null) return { ok: false, error: 'not-found' };
        const bytes = new Uint8Array(await stored.blob.arrayBuffer());
        return {
          ok: true,
          file: {
            fileName: stored.fileName,
            mimeType: stored.mimeType,
            lastModified: stored.lastModified,
            base64: encodeBase64(bytes),
          },
        };
      } catch {
        return { ok: false, error: 'unavailable' };
      }
    },
  };
}
