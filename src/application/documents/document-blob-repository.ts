export type StoredDocumentBlob = {
  id: string;
  fileName: string;
  mimeType: string;
  lastModified: number;
  blob: Blob;
};

export interface DocumentBlobRepository {
  save(id: string, file: File): Promise<void>;
  get(id: string): Promise<StoredDocumentBlob | null>;
  remove(id: string): Promise<void>;
  has(id: string): Promise<boolean>;
}
