import { Card, CardColor, GameRuleSet, GameState, Player } from '../types';
import { areCardsIdentical, isWildCard } from '../cards';

export const DEFAULT_RULES: GameRuleSet = {
  startingHandSize: 7,
  maxPlayers: 4,
  turnTimerSec: 15,
  stackDrawTwo: true,
  stackWildDrawFour: true,
  jumpIn: false,
  sevenZero: false,
  forcePlay: false,
  drawUntilPlayable: false,
  wildDrawFourChallenge: true,
  allowSpectators: true,
  allowBots: true,
  autoPlayOnTimeout: true,
};

/**
 * Checks whether a specific card is legally playable given current game state.
 */
export function isCardPlayable(
  card: Card,
  gameState: GameState,
  _playerHand: Card[]
): { playable: boolean; reason?: string } {
  const { currentColor, currentType, discardPile, pendingDrawCount, rules } = gameState;
  const topCard = discardPile[discardPile.length - 1];

  if (!topCard) {
    return { playable: true };
  }

  // 1. If there's an active Draw Stack (+2 or +4 accumulated)
  if (pendingDrawCount > 0) {
    if (topCard.type === 'DRAW_TWO' && rules.stackDrawTwo) {
      if (card.type === 'DRAW_TWO') {
        return { playable: true };
      }
      return { playable: false, reason: 'Must stack a Draw Two or draw accumulated cards' };
    }

    if (topCard.type === 'WILD_DRAW_FOUR' && rules.stackWildDrawFour) {
      if (card.type === 'WILD_DRAW_FOUR') {
        return { playable: true };
      }
      return { playable: false, reason: 'Must stack a Wild Draw Four or draw accumulated cards' };
    }

    return { playable: false, reason: 'Cannot play non-stacking card on pending draw' };
  }

  // 2. Wild cards are always technically playable
  if (card.type === 'WILD' || card.color === 'WILD') {
    return { playable: true };
  }

  if (card.type === 'WILD_DRAW_FOUR') {
    return { playable: true };
  }

  // 3. Color matching
  if (card.color === currentColor) {
    return { playable: true };
  }

  // 4. Value / Type matching
  if (card.type === 'NUMBER' && topCard.type === 'NUMBER' && card.value === topCard.value) {
    return { playable: true };
  }

  if (card.type !== 'NUMBER' && card.type === currentType) {
    return { playable: true };
  }

  return {
    playable: false,
    reason: `Card does not match active color (${currentColor}) or card symbol (${currentType})`,
  };
}

/**
 * Checks if a player legitimately played a Wild Draw Four without bluffing.
 * According to official rules, Wild Draw Four is only legal if the player does NOT hold any card
 * of the currently active color.
 */
export function isWildDrawFourBluff(
  playerHand: Card[],
  activeColorBeforePlay: CardColor
): boolean {
  return playerHand.some((c) => c.color === activeColorBeforePlay && c.type !== 'WILD_DRAW_FOUR');
}

/**
 * Checks if a player can perform a Jump-In move.
 * Valid when Jump-In rule is enabled and player has a card identical to top card.
 */
export function canPlayerJumpIn(
  player: Player,
  gameState: GameState
): { canJump: boolean; matchingCard?: Card } {
  if (!gameState.rules.jumpIn) {
    return { canJump: false };
  }

  if (gameState.phase !== 'IN_PROGRESS' || gameState.pendingDrawCount > 0) {
    return { canJump: false };
  }

  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  if (!topCard || isWildCard(topCard)) {
    return { canJump: false };
  }

  const matchingCard = player.hand.find((c) => areCardsIdentical(c, topCard));
  if (matchingCard) {
    return { canJump: true, matchingCard };
  }

  return { canJump: false };
}

/**
 * Returns list of playable card IDs from player hand.
 */
export function getLegalCardIds(playerHand: Card[], gameState: GameState): string[] {
  return playerHand
    .filter((card) => isCardPlayable(card, gameState, playerHand).playable)
    .map((card) => card.id);
}
