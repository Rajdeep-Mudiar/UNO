import { GameDirection, GameState } from '../types';

/**
 * Calculates the next active player index given current index, direction, and step count.
 */
export function getNextPlayerIndex(
  currentIndex: number,
  playerCount: number,
  direction: GameDirection,
  stepCount = 1
): number {
  if (playerCount <= 0) return 0;
  const rawNext = currentIndex + direction * stepCount;
  return ((rawNext % playerCount) + playerCount) % playerCount;
}

/**
 * Handles Reverse card direction change and step resolution.
 * - In a 2-player game: Reverse reverses direction AND acts as a Skip (same player plays again).
 * - In 3+ players: Direction is simply inverted.
 */
export function processReverseCard(
  playerCount: number,
  currentDirection: GameDirection
): { newDirection: GameDirection; stepCount: number } {
  const newDirection = (currentDirection * -1) as GameDirection;
  if (playerCount === 2) {
    // 2 players: Reverse skips other player (step of 2 in new direction)
    return { newDirection, stepCount: 2 };
  }
  return { newDirection, stepCount: 1 };
}

/**
 * Advances turn state on the game object.
 */
export function advanceTurn(gameState: GameState, stepCount = 1): GameState {
  const playerCount = gameState.players.length;
  const nextIndex = getNextPlayerIndex(
    gameState.currentPlayerIndex,
    playerCount,
    gameState.direction,
    stepCount
  );

  return {
    ...gameState,
    currentPlayerIndex: nextIndex,
    turnNumber: gameState.turnNumber + 1,
    turnStartedAt: Date.now(),
  };
}
