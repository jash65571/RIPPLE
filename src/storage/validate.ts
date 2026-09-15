import { PRODUCT } from '../config/product';
import { campaign } from '../content/campaign';
import type { Plan } from '../game/model';
import { validatePlan } from '../game/validate';
import {
  DEFAULT_SETTINGS,
  GAME_RULE_VERSION,
  LEVEL_ONE_TUTORIAL_COMPLETE_STEP,
  SAVE_LIMITS,
  SAVE_SCHEMA_VERSION,
  type PlayerSettings,
  type SaveDocument,
  type SavedPlan,
} from './model';

export class SaveValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaveValidationError';
  }
}

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const migrateSaveDocument = (value: unknown): unknown => {
  if (!isRecord(value) || value.schemaVersion !== 0) return value;
  const legacySettings = isRecord(value.settings) ? value.settings : {};
  return { ...value, schemaVersion: SAVE_SCHEMA_VERSION, settings: { ...DEFAULT_SETTINGS, ...legacySettings } };
};

const assertNoDangerousKeys = (value: unknown, depth = 0): void => {
  if (depth > 12) throw new SaveValidationError('The save is nested too deeply.');
  if (Array.isArray(value)) {
    value.forEach((item) => assertNoDangerousKeys(item, depth + 1));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new SaveValidationError('The save contains a forbidden key.');
    assertNoDangerousKeys(item, depth + 1);
  }
};

const parseSettings = (value: unknown): PlayerSettings => {
  if (!isRecord(value) || typeof value.effects !== 'boolean' || typeof value.music !== 'boolean' || typeof value.reducedMotion !== 'boolean') {
    throw new SaveValidationError('The save has invalid settings.');
  }
  if (value.textScale !== 1 && value.textScale !== 1.125 && value.textScale !== 1.25) {
    throw new SaveValidationError('The save has an unsupported text size.');
  }
  return {
    effects: value.effects,
    music: value.music,
    reducedMotion: value.reducedMotion,
    textScale: value.textScale,
  };
};

const parseHistory = (value: unknown, levelId: string): readonly Plan[] => {
  if (!Array.isArray(value) || value.length > SAVE_LIMITS.historyEntries) {
    throw new SaveValidationError(`Level ${levelId} has invalid plan history.`);
  }
  const level = campaign.find((candidate) => candidate.id === levelId)!;
  return value.map((plan) => {
    if (!isRecord(plan)) throw new SaveValidationError(`Level ${levelId} has an invalid plan.`);
    return validatePlan(level, plan as Plan);
  });
};

const parseSavedPlan = (value: unknown, levelId: string): SavedPlan => {
  if (!isRecord(value) || !isRecord(value.plan) || !Number.isInteger(value.revision) || Number(value.revision) < 0) {
    throw new SaveValidationError(`Level ${levelId} has invalid plan state.`);
  }
  if (value.tutorialStep !== undefined && (!Number.isInteger(value.tutorialStep) || Number(value.tutorialStep) < 0 || Number(value.tutorialStep) > LEVEL_ONE_TUTORIAL_COMPLETE_STEP)) {
    throw new SaveValidationError(`Level ${levelId} has invalid tutorial progress.`);
  }
  const level = campaign.find((candidate) => candidate.id === levelId)!;
  return {
    plan: validatePlan(level, value.plan as Plan),
    undo: parseHistory(value.undo, levelId),
    redo: parseHistory(value.redo, levelId),
    revision: Number(value.revision),
    ...(value.tutorialStep === undefined ? {} : { tutorialStep: Number(value.tutorialStep) }),
  };
};

export const parseSaveDocument = (value: unknown): SaveDocument => {
  assertNoDangerousKeys(value);
  value = migrateSaveDocument(value);
  if (!isRecord(value)) throw new SaveValidationError('The save must be a JSON object.');
  if (value.productId !== PRODUCT.productId) throw new SaveValidationError('This save belongs to a different game.');
  if (value.schemaVersion !== SAVE_SCHEMA_VERSION) {
    const direction = typeof value.schemaVersion === 'number' && value.schemaVersion > SAVE_SCHEMA_VERSION ? 'newer' : 'unsupported';
    throw new SaveValidationError(`This save uses a ${direction} save format.`);
  }
  if (value.gameRuleVersion !== GAME_RULE_VERSION) throw new SaveValidationError('This save uses different game rules.');
  if (!Number.isInteger(value.revision) || Number(value.revision) < 0 || typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt))) {
    throw new SaveValidationError('The save has invalid version or time information.');
  }
  const levelIds = new Set(campaign.map((level) => level.id));
  if (typeof value.currentLevelId !== 'string' || !levelIds.has(value.currentLevelId)) {
    throw new SaveValidationError('The current puzzle is not part of this campaign.');
  }
  if (!Array.isArray(value.completedLevelIds) || value.completedLevelIds.length > SAVE_LIMITS.levelRecords || !value.completedLevelIds.every((id) => typeof id === 'string' && levelIds.has(id))) {
    throw new SaveValidationError('The completed puzzle list is invalid.');
  }
  if (new Set(value.completedLevelIds).size !== value.completedLevelIds.length) {
    throw new SaveValidationError('The completed puzzle list contains duplicates.');
  }
  if (!isRecord(value.plans) || Object.keys(value.plans).length > SAVE_LIMITS.levelRecords) {
    throw new SaveValidationError('The saved plan list is invalid.');
  }
  const plans: Record<string, SavedPlan> = {};
  for (const [levelId, plan] of Object.entries(value.plans)) {
    if (!levelIds.has(levelId)) throw new SaveValidationError(`The save contains unknown level ${levelId}.`);
    plans[levelId] = parseSavedPlan(plan, levelId);
  }
  return {
    productId: PRODUCT.productId,
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameRuleVersion: GAME_RULE_VERSION,
    revision: Number(value.revision),
    savedAt: value.savedAt,
    currentLevelId: value.currentLevelId,
    completedLevelIds: [...value.completedLevelIds] as string[],
    plans,
    settings: parseSettings(value.settings),
  };
};

export const parseSaveJson = (json: string): SaveDocument => {
  if (new TextEncoder().encode(json).byteLength > SAVE_LIMITS.importBytes) {
    throw new SaveValidationError('The save file is larger than 256 KiB.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new SaveValidationError('The save file is not valid JSON.');
  }
  return parseSaveDocument(parsed);
};
