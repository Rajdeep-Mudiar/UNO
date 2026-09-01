import { describe, it, expect } from 'vitest';
import { createGame } from '@/game-engine/actions';
import { sanitizeGameStateForPlayer, sanitizeGameStateForSpectator } from '@/game-engine/serialization';

describe('State Sanitization & Anti-Cheat Projection', () => {
  it('hides opponent hands from public player projection', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
        { id: 'p3', name: 'Charlie' },
      ],
    });

    const publicState = sanitizeGameStateForPlayer(game, 'p1');

    // Alice sees her own hand
    expect(publicState.myHand).toHaveLength(7);

    // Opponent players do NOT have a `hand` array exposed in PublicPlayerState
    publicState.players.forEach((p) => {
      expect(p.cardCount).toBe(7);
      expect((p as unknown as { hand?: unknown }).hand).toBeUndefined();
    });
  });

  it('hides all hands for spectator projection', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
    });

    const spectatorState = sanitizeGameStateForSpectator(game);
    expect(spectatorState.myHand).toHaveLength(0);
    expect(spectatorState.players).toHaveLength(2);
  });
});
