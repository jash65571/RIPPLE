import type { LevelDefinition } from '../game/model';
import type { PlayerSettings, SavedPlan } from '../storage/model';
import { CampaignLevelScreen } from './CampaignLevelScreen';
import { LevelOneScreen } from './LevelOneScreen';

export interface LevelScreenProps {
  readonly level: LevelDefinition;
  readonly onComplete: (levelId: string) => void;
  readonly onChapters: () => void;
  readonly onNext: () => void;
  readonly savedPlan?: SavedPlan;
  readonly saveStatus: 'saved' | 'saving' | 'failed' | 'conflict';
  readonly onPlanChange: (levelId: string, plan: SavedPlan) => void;
  readonly onTutorialProgress: (levelId: string, tutorialStep: number) => void;
  readonly offlineReady: boolean;
  readonly onDismissOffline: () => void;
  readonly updateReady: boolean;
  readonly onUpdate: () => void;
  readonly settings: PlayerSettings;
  readonly onOpenSettings: () => void;
}

export function LevelScreen(props: LevelScreenProps) {
  return props.level.id === '01' ? <LevelOneScreen {...props} /> : <CampaignLevelScreen {...props} />;
}
