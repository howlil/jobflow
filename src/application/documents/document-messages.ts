export const GET_DOCUMENT_FILE_MESSAGE = 'fillio:document/get' as const;

export type GetDocumentFileMessage = {
  type: typeof GET_DOCUMENT_FILE_MESSAGE;
  documentId: string;
};

export type DocumentFilePayload = {
  fileName: string;
  mimeType: string;
  lastModified: number;
  base64: string;
};

export type GetDocumentFileResponse =
  | { ok: true; file: DocumentFilePayload }
  | { ok: false; error: 'not-found' | 'unavailable' };

export function isGetDocumentFileMessage(
  message: unknown,
): message is GetDocumentFileMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === GET_DOCUMENT_FILE_MESSAGE &&
    'documentId' in message &&
    typeof message.documentId === 'string' &&
    message.documentId.length > 0
  );
}
