import { describe, it, expect } from 'vitest';
import { createNumberCard, createActionCard, createWildCard } from '@/game-engine/cards';
import { isCardPlayable, DEFAULT_RULES } from '@/game-engine/rules';
import { CardColor, CardType, GameState } from '@/game-engine/types';

function createMockGameState(
  topCard = createNumberCard('RED', 5),
  currentColor: CardColor = 'RED',
  currentType: CardType = 'NUMBER',
  pendingDrawCount = 0
): GameState {
  return {
    gameId: 'test_game',
    roomId: 'test_room',
    players: [],
    currentPlayerIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [topCard],
    currentColor,
    currentType,
    pendingDrawCount,
    turnNumber: 1,
    phase: 'IN_PROGRESS',
    winnerId: null,
    rules: { ...DEFAULT_RULES },
    turnStartedAt: Date.now(),
    lastAction: null,
    wildChallenge: null,
    pendingColorChoicePlayerId: null,
    pendingSevenSwapPlayerId: null,
  };
}

describe('UNO Rule Validation', () => {
  it('allows playing a card with matching color', () => {
    const gameState = createMockGameState(createNumberCard('RED', 5), 'RED', 'NUMBER');
    const redSeven = createNumberCard('RED', 7);
    const result = isCardPlayable(redSeven, gameState, [redSeven]);
    expect(result.playable).toBe(true);
  });

  it('allows playing a card with matching number on different color', () => {
    const gameState = createMockGameState(createNumberCard('RED', 5), 'RED', 'NUMBER');
    const blueFive = createNumberCard('BLUE', 5);
    const result = isCardPlayable(blueFive, gameState, [blueFive]);
    expect(result.playable).toBe(true);
  });

  it('allows playing matching action cards across colors', () => {
    const gameState = createMockGameState(createActionCard('RED', 'SKIP'), 'RED', 'SKIP');
    const greenSkip = createActionCard('GREEN', 'SKIP');
    const result = isCardPlayable(greenSkip, gameState, [greenSkip]);
    expect(result.playable).toBe(true);
  });

  it('allows playing Wild and Wild Draw Four cards unconditionally', () => {
    const gameState = createMockGameState(createNumberCard('GREEN', 2), 'GREEN', 'NUMBER');
    const wild = createWildCard('WILD');
    const wild4 = createWildCard('WILD_DRAW_FOUR');

    expect(isCardPlayable(wild, gameState, [wild]).playable).toBe(true);
    expect(isCardPlayable(wild4, gameState, [wild4]).playable).toBe(true);
  });

  it('rejects completely non-matching cards', () => {
    const gameState = createMockGameState(createNumberCard('RED', 5), 'RED', 'NUMBER');
    const blueSeven = createNumberCard('BLUE', 7);
    const result = isCardPlayable(blueSeven, gameState, [blueSeven]);
    expect(result.playable).toBe(false);
  });

  it('enforces draw stacking rules when pending draw count > 0', () => {
    const gameState = createMockGameState(createActionCard('RED', 'DRAW_TWO'), 'RED', 'DRAW_TWO', 2);
    const blueDrawTwo = createActionCard('BLUE', 'DRAW_TWO');
    const redFive = createNumberCard('RED', 5);

    // Can stack +2 on +2
    expect(isCardPlayable(blueDrawTwo, gameState, [blueDrawTwo]).playable).toBe(true);
    // Cannot play normal color-matching card while +2 is pending
    expect(isCardPlayable(redFive, gameState, [redFive]).playable).toBe(false);
  });
});
