import type {
  DocumentBlobRepository,
  StoredDocumentBlob,
} from '../../application/documents/document-blob-repository';

const DATABASE_NAME = 'jobflow-documents';
const LEGACY_DATABASE_NAME = 'fillio-documents';
const DATABASE_VERSION = 1;
const STORE_NAME = 'documents';

type DocumentRecord = {
  id: string;
  fileName: string;
  mimeType: string;
  lastModified: number;
  blob: Blob;
};

function openDatabase(name = DATABASE_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, DATABASE_VERSION);
    request.onerror = () =>
      reject(request.error ?? new Error('Could not open document storage.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
  databaseName = DATABASE_NAME,
): Promise<T> {
  const database = await openDatabase(databaseName);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));

    request.onerror = () =>
      reject(request.error ?? new Error('Document storage request failed.'));
    request.onsuccess = () => resolve(request.result);
    transaction.onabort = () =>
      reject(
        transaction.error ?? new Error('Document storage transaction aborted.'),
      );
    transaction.oncomplete = () => database.close();
  });
}

export class IndexedDbDocumentRepository implements DocumentBlobRepository {
  async save(id: string, file: File): Promise<void> {
    const record: DocumentRecord = {
      id,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
      blob: file.slice(0, file.size, file.type || 'application/octet-stream'),
    };
    await runTransaction('readwrite', (store) => store.put(record));
  }

  async get(id: string): Promise<StoredDocumentBlob | null> {
    const result = await runTransaction<DocumentRecord | undefined>(
      'readonly',
      (store) => store.get(id),
    );
    if (result !== undefined) return result;

    const legacyResult = await runTransaction<DocumentRecord | undefined>(
      'readonly',
      (store) => store.get(id),
      LEGACY_DATABASE_NAME,
    );
    if (legacyResult !== undefined) {
      await runTransaction('readwrite', (store) => store.put(legacyResult));
    }
    return legacyResult ?? null;
  }

  async remove(id: string): Promise<void> {
    await runTransaction('readwrite', (store) => store.delete(id));
  }

  async has(id: string): Promise<boolean> {
    return (await this.get(id)) !== null;
  }
}
