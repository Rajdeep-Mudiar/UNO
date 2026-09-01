export type CardColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'WILD';

export type GameMode =
  | 'CASUAL'
  | 'RANKED'
  | 'PRIVATE_ROOM'
  | 'FRIENDS'
  | 'BOTS'
  | 'QUICK_MATCH'
  | 'TOURNAMENT'
  | 'TEAM_MODE'
  | 'SURVIVAL'
  | 'BLITZ'
  | 'CHAOS'
  | 'CUSTOM'
  | 'PRACTICE'
  | 'SPECTATOR';

export type CardType = 
  | 'NUMBER'
  | 'SKIP'
  | 'REVERSE'
  | 'DRAW_TWO'
  | 'WILD'
  | 'WILD_DRAW_FOUR'
  | 'CUSTOM';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0-9 for NUMBER cards
  scoreValue: number; // 0-9 face value, 20 for Action (+2, Skip, Reverse), 50 for Wild/Wild+4
  customEffect?: string;
  label?: string;
}

export type GameDirection = 1 | -1; // 1 = Clockwise, -1 = Counter-Clockwise

export type GamePhase = 
  | 'WAITING_TO_START'
  | 'IN_PROGRESS'
  | 'AWAITING_COLOR_CHOICE'
  | 'AWAITING_WILD_FOUR_CHALLENGE'
  | 'AWAITING_SEVEN_SWAP'
  | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isBot: boolean;
  hand: Card[];
  cardCount: number; // Keep synced with hand.length
  calledUno: boolean;
  score: number;
  rank?: number;
  isDisconnected?: boolean;
}

export interface GameRuleSet {
  startingHandSize: number; // Default: 7
  maxPlayers: number; // Default: 4 (2 to 10)
  turnTimerSec: number; // Default: 15
  stackDrawTwo: boolean; // Default: true (respond to +2 with +2)
  stackWildDrawFour: boolean; // Default: true (respond to +4 with +4)
  jumpIn: boolean; // Default: false (play exact same card out of turn)
  sevenZero: boolean; // Default: false (7 = swap hands with player, 0 = rotate all hands)
  forcePlay: boolean; // Default: false (if drawn card is playable, must play it)
  drawUntilPlayable: boolean; // Default: false (keep drawing until a legal card is drawn)
  wildDrawFourChallenge: boolean; // Default: true (bluff challenge on +4)
  allowSpectators: boolean; // Default: true
  allowBots: boolean; // Default: true
  autoPlayOnTimeout: boolean; // Default: true
}

export interface WildChallengeContext {
  challengerId: string;
  challengedPlayerId: string;
  wildCardId: string;
  previousColor: CardColor; // Color before the wild card was played
}

export interface GameActionRecord {
  type: string;
  playerId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface GameState {
  gameId: string;
  roomId: string;
  players: Player[];
  currentPlayerIndex: number;
  direction: GameDirection;
  drawPile: Card[];
  discardPile: Card[];
  currentColor: CardColor;
  currentType: CardType;
  pendingDrawCount: number; // Accumulated draw stack (+2 or +4)
  turnNumber: number;
  phase: GamePhase;
  winnerId: string | null;
  rules: GameRuleSet;
  turnStartedAt: number;
  lastAction: GameActionRecord | null;
  wildChallenge: WildChallengeContext | null;
  pendingColorChoicePlayerId: string | null;
  pendingSevenSwapPlayerId: string | null;
}

export interface PublicPlayerState {
  id: string;
  name: string;
  avatar?: string;
  isBot: boolean;
  cardCount: number;
  calledUno: boolean;
  score: number;
  rank?: number;
  isDisconnected?: boolean;
}

export interface PublicGameState {
  gameId: string;
  roomId: string;
  players: PublicPlayerState[];
  myHand: Card[];
  currentPlayerId: string;
  direction: GameDirection;
  topCard: Card;
  currentColor: CardColor;
  pendingDrawCount: number;
  turnNumber: number;
  phase: GamePhase;
  winnerId: string | null;
  rules: GameRuleSet;
  canCallUno: boolean;
  canCatchUno: boolean;
  canJumpIn: boolean;
  legalCardIds: string[];
}

// Action Payloads
export type EngineAction =
  | { type: 'PLAY_CARD'; playerId: string; cardId: string; chosenColor?: CardColor; targetSwapPlayerId?: string }
  | { type: 'DRAW_CARD'; playerId: string }
  | { type: 'PASS_TURN'; playerId: string }
  | { type: 'CHOOSE_COLOR'; playerId: string; chosenColor: CardColor }
  | { type: 'CALL_UNO'; playerId: string }
  | { type: 'CATCH_UNO_FAILURE'; callerPlayerId: string; targetPlayerId: string }
  | { type: 'CHALLENGE_WILD_FOUR'; challengerId: string; challenge: boolean }
  | { type: 'SEVEN_SWAP_HAND'; playerId: string; targetPlayerId: string }
  | { type: 'JUMP_IN'; playerId: string; cardId: string; chosenColor?: CardColor }
  | { type: 'TIMEOUT_AUTO_PLAY'; playerId: string };

export interface ActionValidationResult {
  valid: boolean;
  error?: string;
}

export interface ActionResult {
  success: boolean;
  state: GameState;
  events: GameEventPayload[];
  error?: string;
}

export interface GameEventPayload {
  eventType: string;
  playerId?: string;
  data: Record<string, unknown>;
  timestamp: number;
}
