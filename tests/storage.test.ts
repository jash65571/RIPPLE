import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { PRODUCT } from '../src/config/product';
import { campaign } from '../src/content/campaign';
import { createEmptySave, SaveConflictError, SaveRepository } from '../src/storage/repository';
import { GAME_RULE_VERSION, SAVE_SCHEMA_VERSION } from '../src/storage/model';
import { parseSaveJson, SaveValidationError } from '../src/storage/validate';

const deleteDatabase = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(`${PRODUCT.productId}.saves`);
    request.addEventListener('success', () => resolve());
    request.addEventListener('error', () => reject(request.error));
  });

afterEach(async () => {
  await deleteDatabase();
});

describe('save repository', () => {
  it('saves and reloads a validated document', async () => {
    const repository = await SaveRepository.open();
    const initial = await repository.load();
    const saved = await repository.save({ ...initial, completedLevelIds: ['01'], currentLevelId: '02' }, initial.revision);
    expect(saved.revision).toBe(1);
    expect(await repository.load()).toEqual(saved);
    repository.close();
  });

  it('rejects stale writes from another repository instance', async () => {
    const first = await SaveRepository.open();
    const second = await SaveRepository.open();
    const firstSnapshot = await first.load();
    const secondSnapshot = await second.load();
    await first.save(firstSnapshot, firstSnapshot.revision);
    await expect(second.save(secondSnapshot, secondSnapshot.revision)).rejects.toBeInstanceOf(SaveConflictError);
    first.close();
    second.close();
  });

  it('exports and imports without losing validated progress', async () => {
    const repository = await SaveRepository.open();
    const initial = createEmptySave(new Date('2026-09-15T12:00:00.000Z'));
    const document = {
      ...initial,
      plans: { '01': { plan: { 'R.route': 'garden' }, undo: [], redo: [], revision: 1 } },
    };
    const json = repository.exportJson(document);
    const imported = await repository.importJson(json, 0);
    expect(imported.plans['01']?.plan).toEqual({ 'R.route': 'garden' });
    repository.close();
  });

  it('keeps the committed save when a later transaction is interrupted', async () => {
    const repository = await SaveRepository.open();
    const initial = await repository.load();
    const saved = await repository.save({ ...initial, completedLevelIds: ['01'] }, initial.revision);
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(`${PRODUCT.productId}.saves`, 1);
      request.addEventListener('success', () => resolve(request.result));
      request.addEventListener('error', () => reject(request.error));
    });
    const transaction = database.transaction('state', 'readwrite');
    transaction.objectStore('state').put({ id: 'active', document: { ...saved, completedLevelIds: ['02'] } });
    transaction.abort();
    expect((await repository.load()).completedLevelIds).toEqual(['01']);
    database.close();
    repository.close();
  });
});

describe('save validation', () => {
  const valid = () => ({
    productId: PRODUCT.productId,
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameRuleVersion: GAME_RULE_VERSION,
    revision: 0,
    savedAt: new Date().toISOString(),
    currentLevelId: campaign[0]!.id,
    completedLevelIds: [],
    plans: {},
    settings: { effects: true, music: false, reducedMotion: false, textScale: 1 },
  });

  it('rejects corrupt JSON, future schemas, and invalid plan edits', () => {
    expect(() => parseSaveJson('{')).toThrow(SaveValidationError);
    expect(() => parseSaveJson(JSON.stringify({ ...valid(), schemaVersion: 99 }))).toThrow(/newer save format/i);
    expect(() => parseSaveJson(JSON.stringify({
      ...valid(),
      plans: { '01': { plan: { 'B.route': 'main' }, undo: [], redo: [], revision: 1 } },
    }))).toThrow(/not allowed/i);
  });

  it('rejects oversized files before parsing', () => {
    expect(() => parseSaveJson(`{"padding":"${'x'.repeat(270_000)}"}`)).toThrow(/larger than 256 KiB/i);
  });

  it('rejects dangerous keys', () => {
    expect(() => parseSaveJson(`{"__proto__":{},"productId":"${PRODUCT.productId}"}`)).toThrow(/forbidden key/i);
  });

  it('migrates a legacy save with current defaults', () => {
    const legacy = { ...valid(), schemaVersion: 0, settings: { effects: true, music: false, textScale: 1 } };
    const migrated = parseSaveJson(JSON.stringify(legacy));
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.settings.reducedMotion).toBe(false);
  });
});
