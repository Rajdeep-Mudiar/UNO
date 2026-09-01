import { Card, CardColor, EngineAction, GameState, Player } from '@/game-engine/types';
import { isCardPlayable } from '@/game-engine/rules';
import { isWildCard } from '@/game-engine/cards';
import { BotStrategyConfig, DEFAULT_BOT_PROFILES } from './types';

/**
 * Calculates dominant color in bot hand.
 */
export function chooseDominantColor(hand: Card[], fallbackColor: CardColor = 'RED'): CardColor {
  const counts: Record<CardColor, number> = {
    RED: 0,
    BLUE: 0,
    GREEN: 0,
    YELLOW: 0,
    WILD: 0,
  };

  hand.forEach((card) => {
    if (card.color !== 'WILD') {
      counts[card.color]++;
    }
  });

  let bestColor: CardColor = fallbackColor;
  let maxCount = -1;

  const validColors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
  for (const col of validColors) {
    if (counts[col] > maxCount) {
      maxCount = counts[col];
      bestColor = col;
    }
  }

  return bestColor;
}

/**
 * Finds the opponent with the fewest cards (threat leader).
 */
export function findLeadingOpponent(players: Player[], botId: string): Player | null {
  const opponents = players.filter((p) => p.id !== botId);
  if (opponents.length === 0) return null;

  return opponents.reduce((leader, current) =>
    current.hand.length < leader.hand.length ? current : leader
  );
}

/**
 * Evaluates the next move for an AI bot given the current authoritative GameState.
 */
export function evaluateBotAction(
  gameState: GameState,
  botPlayer: Player,
  customConfig?: Partial<BotStrategyConfig>
): EngineAction {
  const difficulty = customConfig?.difficulty ?? 'MEDIUM';
  const config: BotStrategyConfig = {
    ...DEFAULT_BOT_PROFILES[difficulty],
    ...customConfig,
  };

  const { hand } = botPlayer;
  const legalCards = hand.filter((c) => isCardPlayable(c, gameState, hand).playable);

  // 1. Check if bot needs to stack on an active Draw Stack (+2 / +4)
  if (gameState.pendingDrawCount > 0) {
    const stackingCard = legalCards.find(
      (c) => c.type === 'DRAW_TWO' || c.type === 'WILD_DRAW_FOUR'
    );
    if (stackingCard) {
      const chosenColor = isWildCard(stackingCard)
        ? chooseDominantColor(hand, gameState.currentColor)
        : undefined;
      return {
        type: 'PLAY_CARD',
        playerId: botPlayer.id,
        cardId: stackingCard.id,
        chosenColor,
      };
    }
    // Must draw accumulated penalty
    return { type: 'DRAW_CARD', playerId: botPlayer.id };
  }

  // 2. No legal cards -> Must draw
  if (legalCards.length === 0) {
    return { type: 'DRAW_CARD', playerId: botPlayer.id };
  }

  // 3. Easy difficulty: Pick first legal card or random legal card
  if (config.difficulty === 'EASY' || config.personality === 'RANDOM') {
    const randomCard = legalCards[Math.floor(Math.random() * legalCards.length)]!;
    const chosenColor = isWildCard(randomCard)
      ? chooseDominantColor(hand, gameState.currentColor)
      : undefined;

    return {
      type: 'PLAY_CARD',
      playerId: botPlayer.id,
      cardId: randomCard.id,
      chosenColor,
    };
  }

  // 4. Medium / Hard / Expert Heuristic Move Scoring
  const leadingOpponent = findLeadingOpponent(gameState.players, botPlayer.id);
  const leadingOpponentCardCount = leadingOpponent?.hand.length ?? 7;
  const isOpponentThreat = leadingOpponentCardCount <= 2;

  // Score legal moves based on strategy weights
  const scoredMoves = legalCards.map((card) => {
    let score = 0;

    // Favor high-score number cards to reduce end-game penalty
    if (card.type === 'NUMBER') {
      score += (card.value ?? 0) * 1.5;
      if (card.color === chooseDominantColor(hand)) {
        score += 5; // Color synergy
      }
      if (gameState.rules.sevenZero && card.value === 7 && isOpponentThreat) {
        score += 30; // 7 Hand swap is huge when opponent is low on cards
      }
    }

    // Action cards: Skip, Reverse, Draw Two
    if (card.type === 'SKIP' || card.type === 'REVERSE' || card.type === 'DRAW_TWO') {
      if (isOpponentThreat) {
        // High urgency to attack leading opponent
        score += 25 * config.attackBias;
      } else {
        score += 10 * config.aggression;
      }
    }

    // Wild cards
    if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') {
      if (card.type === 'WILD_DRAW_FOUR') {
        score += isOpponentThreat ? 35 * config.attackBias : 8 * config.riskTolerance;
      } else {
        score += isOpponentThreat ? 20 : 6 * config.riskTolerance;
      }
      // If we hold normal cards of the current color, preserve wild card if defenseBias is high
      const hasMatchingColor = hand.some((c) => c.color === gameState.currentColor && !isWildCard(c));
      if (hasMatchingColor) {
        score -= 15 * config.defenseBias;
      }
    }

    return { card, score };
  });

  // Sort descending by score
  scoredMoves.sort((a, b) => b.score - a.score);
  const bestCard = scoredMoves[0]!.card;

  const chosenColor = isWildCard(bestCard)
    ? (config.preferredColor ?? chooseDominantColor(hand, gameState.currentColor))
    : undefined;

  let targetSwapPlayerId: string | undefined = undefined;
  if (gameState.rules.sevenZero && bestCard.type === 'NUMBER' && bestCard.value === 7) {
    if (leadingOpponent && leadingOpponent.hand.length < hand.length) {
      targetSwapPlayerId = leadingOpponent.id;
    }
  }

  return {
    type: 'PLAY_CARD',
    playerId: botPlayer.id,
    cardId: bestCard.id,
    chosenColor,
    targetSwapPlayerId,
  };
}
