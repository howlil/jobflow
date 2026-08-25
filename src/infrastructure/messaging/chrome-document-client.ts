import { browser } from 'wxt/browser';

import {
  GET_DOCUMENT_FILE_MESSAGE,
  type GetDocumentFileResponse,
} from '../../application/documents/document-messages';

function decodeBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

export class ChromeDocumentClient {
  async getFile(documentId: string): Promise<File | null> {
    const response = (await browser.runtime.sendMessage({
      type: GET_DOCUMENT_FILE_MESSAGE,
      documentId,
    })) as GetDocumentFileResponse | undefined;

    if (response === undefined || !response.ok) return null;
    const buffer = decodeBase64(response.file.base64);
    return new File([buffer], response.file.fileName, {
      type: response.file.mimeType,
      lastModified: response.file.lastModified,
    });
  }
}
