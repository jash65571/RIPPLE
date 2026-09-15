import type { Plan } from '../game/model';

export const SAVE_SCHEMA_VERSION = 1;
export const GAME_RULE_VERSION = 1;
export const LEVEL_ONE_TUTORIAL_COMPLETE_STEP = 7;
export const SAVE_LIMITS = {
  importBytes: 256 * 1024,
  historyEntries: 40,
  levelRecords: 10,
} as const;

export interface SavedPlan {
  readonly plan: Plan;
  readonly undo: readonly Plan[];
  readonly redo: readonly Plan[];
  readonly revision: number;
  readonly tutorialStep?: number;
}

export interface PlayerSettings {
  readonly effects: boolean;
  readonly music: boolean;
  readonly reducedMotion: boolean;
  readonly textScale: 1 | 1.125 | 1.25;
}

export interface SaveDocument {
  readonly productId: string;
  readonly schemaVersion: number;
  readonly gameRuleVersion: number;
  readonly revision: number;
  readonly savedAt: string;
  readonly currentLevelId: string;
  readonly completedLevelIds: readonly string[];
  readonly plans: Readonly<Record<string, SavedPlan>>;
  readonly settings: PlayerSettings;
}

export const DEFAULT_SETTINGS: PlayerSettings = {
  effects: true,
  music: false,
  reducedMotion: false,
  textScale: 1,
};
