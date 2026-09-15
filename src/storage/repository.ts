import { PRODUCT } from '../config/product';
import {
  DEFAULT_SETTINGS,
  GAME_RULE_VERSION,
  SAVE_SCHEMA_VERSION,
  type SaveDocument,
} from './model';
import { parseSaveDocument, parseSaveJson } from './validate';

const DATABASE_NAME = `${PRODUCT.productId}.saves`;
const DATABASE_VERSION = 1;
const STATE_STORE = 'state';
const BACKUP_STORE = 'backups';
const ACTIVE_KEY = 'active';
const BACKUP_KEY = 'before-import';
const CHANNEL_NAME = `${PRODUCT.productId}.save-events`;

interface StoredRecord {
  readonly id: string;
  readonly document: SaveDocument;
}

export class SaveConflictError extends Error {
  readonly latest: SaveDocument;

  constructor(latest: SaveDocument) {
    super('A newer save exists in another tab. Reload before saving again.');
    this.name = 'SaveConflictError';
    this.latest = latest;
  }
}

const requestResult = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error ?? new Error('IndexedDB request failed.')));
  });

const transactionDone = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve());
    transaction.addEventListener('abort', () => reject(transaction.error ?? new Error('IndexedDB transaction was interrupted.')));
    transaction.addEventListener('error', () => reject(transaction.error ?? new Error('IndexedDB transaction failed.')));
  });

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener('upgradeneeded', () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STATE_STORE)) database.createObjectStore(STATE_STORE, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(BACKUP_STORE)) database.createObjectStore(BACKUP_STORE, { keyPath: 'id' });
    });
    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error ?? new Error('Could not open browser storage.')));
    request.addEventListener('blocked', () => reject(new Error('Browser storage is blocked by another tab.')));
  });

export const createEmptySave = (now = new Date()): SaveDocument => ({
  productId: PRODUCT.productId,
  schemaVersion: SAVE_SCHEMA_VERSION,
  gameRuleVersion: GAME_RULE_VERSION,
  revision: 0,
  savedAt: now.toISOString(),
  currentLevelId: '01',
  completedLevelIds: [],
  plans: {},
  settings: DEFAULT_SETTINGS,
});

export class SaveRepository {
  readonly #database: IDBDatabase;
  readonly #channel: BroadcastChannel | null;

  private constructor(database: IDBDatabase) {
    this.#database = database;
    this.#channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);
  }

  static async open(): Promise<SaveRepository> {
    return new SaveRepository(await openDatabase());
  }

  async load(): Promise<SaveDocument> {
    const transaction = this.#database.transaction(STATE_STORE, 'readonly');
    const stored = await requestResult(transaction.objectStore(STATE_STORE).get(ACTIVE_KEY) as IDBRequest<StoredRecord | undefined>);
    await transactionDone(transaction);
    return stored === undefined ? createEmptySave() : parseSaveDocument(stored.document);
  }

  async save(document: SaveDocument, expectedRevision: number): Promise<SaveDocument> {
    const transaction = this.#database.transaction(STATE_STORE, 'readwrite');
    const store = transaction.objectStore(STATE_STORE);
    const existing = await requestResult(store.get(ACTIVE_KEY) as IDBRequest<StoredRecord | undefined>);
    if (existing !== undefined && existing.document.revision !== expectedRevision) {
      transaction.abort();
      throw new SaveConflictError(parseSaveDocument(existing.document));
    }
    const next = parseSaveDocument({
      ...document,
      revision: expectedRevision + 1,
      savedAt: new Date().toISOString(),
    });
    store.put({ id: ACTIVE_KEY, document: next } satisfies StoredRecord);
    await transactionDone(transaction);
    this.#channel?.postMessage({ type: 'saved', revision: next.revision });
    return next;
  }

  async importJson(json: string, expectedRevision: number): Promise<SaveDocument> {
    const imported = parseSaveJson(json);
    const transaction = this.#database.transaction([STATE_STORE, BACKUP_STORE], 'readwrite');
    const stateStore = transaction.objectStore(STATE_STORE);
    const existing = await requestResult(stateStore.get(ACTIVE_KEY) as IDBRequest<StoredRecord | undefined>);
    if (existing !== undefined && existing.document.revision !== expectedRevision) {
      transaction.abort();
      throw new SaveConflictError(parseSaveDocument(existing.document));
    }
    if (existing !== undefined) {
      transaction.objectStore(BACKUP_STORE).put({ id: BACKUP_KEY, document: existing.document } satisfies StoredRecord);
    }
    const next = parseSaveDocument({ ...imported, revision: expectedRevision + 1, savedAt: new Date().toISOString() });
    stateStore.put({ id: ACTIVE_KEY, document: next } satisfies StoredRecord);
    await transactionDone(transaction);
    this.#channel?.postMessage({ type: 'imported', revision: next.revision });
    return next;
  }

  exportJson(document: SaveDocument): string {
    return `${JSON.stringify(parseSaveDocument(document), null, 2)}\n`;
  }

  onExternalSave(listener: (revision: number) => void): () => void {
    if (this.#channel === null) return () => undefined;
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (typeof event.data === 'object' && event.data !== null && 'revision' in event.data && Number.isInteger(event.data.revision)) {
        listener(Number(event.data.revision));
      }
    };
    this.#channel.addEventListener('message', handleMessage);
    return () => this.#channel?.removeEventListener('message', handleMessage);
  }

  close(): void {
    this.#channel?.close();
    this.#database.close();
  }
}
