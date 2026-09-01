import { CardColor } from '@/game-engine/types';

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type BotPersonality =
  | 'AGGRESSIVE'
  | 'DEFENSIVE'
  | 'STRATEGIC'
  | 'RISKY'
  | 'BALANCED'
  | 'RANDOM';

export interface BotStrategyConfig {
  id?: string;
  name: string;
  avatar?: string;
  difficulty: BotDifficulty;
  personality: BotPersonality;
  aggression: number; // 0.0 to 1.0 (prefers playing action/+2/+4 cards immediately)
  riskTolerance: number; // 0.0 to 1.0 (plays wild cards or bluffs early)
  defenseBias: number; // 0.0 to 1.0 (saves wild/+2 cards for defense/retaliation)
  attackBias: number; // 0.0 to 1.0 (targets the leading player with skips)
  bluffBias: number; // 0.0 to 1.0 (willingness to play Wild Draw Four illegally)
  preferredColor?: CardColor;
}

export const DEFAULT_BOT_PROFILES: Record<BotDifficulty, BotStrategyConfig> = {
  EASY: {
    name: 'Casual Bot',
    difficulty: 'EASY',
    personality: 'RANDOM',
    aggression: 0.2,
    riskTolerance: 0.2,
    defenseBias: 0.1,
    attackBias: 0.1,
    bluffBias: 0.0,
  },
  MEDIUM: {
    name: 'Tactical Bot',
    difficulty: 'MEDIUM',
    personality: 'BALANCED',
    aggression: 0.5,
    riskTolerance: 0.4,
    defenseBias: 0.5,
    attackBias: 0.5,
    bluffBias: 0.1,
  },
  HARD: {
    name: 'Grandmaster Bot',
    difficulty: 'HARD',
    personality: 'STRATEGIC',
    aggression: 0.8,
    riskTolerance: 0.6,
    defenseBias: 0.7,
    attackBias: 0.9,
    bluffBias: 0.2,
  },
  EXPERT: {
    name: 'Apex AI',
    difficulty: 'EXPERT',
    personality: 'AGGRESSIVE',
    aggression: 0.95,
    riskTolerance: 0.8,
    defenseBias: 0.85,
    attackBias: 1.0,
    bluffBias: 0.3,
  },
};
