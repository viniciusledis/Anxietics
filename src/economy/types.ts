import { GameId } from '../minigames/types';
import { SlotId } from './catalog';
export type AchievementId = 'first-step' | 'explorer' | 'my-corner';
export type RewardLine = {
  eventId: string;
  label: string;
  seeds: number;
  xp: number;
};
export type RewardReceipt = {
  sessionId: string;
  completed: string[];
  lines: RewardLine[];
  achievements: AchievementId[];
  levelBefore: number;
  levelAfter: number;
};
export type Economy = {
  seeds: number;
  xp: number;
  ownedItemIds: string[];
  equipped: { grassTool: string | null; grassAppearance: string | null };
  garden: Record<SlotId, string | null>;
  processedEventIds: string[];
  completedGameIds: GameId[];
  achievementIds: AchievementId[];
  receipts: RewardReceipt[];
};
