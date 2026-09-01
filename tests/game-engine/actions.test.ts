import { describe, it, expect } from 'vitest';
import { createGame, processAction } from '@/game-engine/actions';
import { createNumberCard } from '@/game-engine/cards';

describe('Game Actions & State Transitions', () => {
  it('creates and starts a 4-player game with 7 cards each', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
        { id: 'p3', name: 'Charlie' },
        { id: 'p4', name: 'Diana' },
      ],
    });

    expect(game.players).toHaveLength(4);
    game.players.forEach((p) => {
      expect(p.hand).toHaveLength(7);
      expect(p.cardCount).toBe(7);
    });
    expect(game.discardPile).toHaveLength(1);
    expect(game.phase).toBe('IN_PROGRESS');
    expect(game.winnerId).toBeNull();
  });

  it('plays a valid card, removes it from player hand, and updates top of discard', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
    });

    // Rig active starting player hand
    const activePlayer = game.players[game.currentPlayerIndex]!;
    const matchingCard = createNumberCard(game.currentColor === 'WILD' ? 'RED' : game.currentColor, 9);
    activePlayer.hand = [matchingCard];
    activePlayer.cardCount = 1;

    const result = processAction(game, {
      type: 'PLAY_CARD',
      playerId: activePlayer.id,
      cardId: matchingCard.id,
    });

    expect(result.success).toBe(true);
    expect(result.state.phase).toBe('GAME_OVER');
    expect(result.state.winnerId).toBe(activePlayer.id);
  });

  it('draws a penalty card when +2 is pending and passes turn', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
    });

    game.currentPlayerIndex = 0;
    game.pendingDrawCount = 2;
    const initialHandSize = game.players[0]!.hand.length;

    const result = processAction(game, {
      type: 'DRAW_CARD',
      playerId: 'p1',
    });

    expect(result.success).toBe(true);
    expect(result.state.players[0]!.hand.length).toBe(initialHandSize + 2);
    expect(result.state.pendingDrawCount).toBe(0);
    expect(result.state.currentPlayerIndex).toBe(1); // Turn advanced
  });

  it('handles UNO declaration and catches UNO failure penalty', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
    });

    // Alice has 1 card but forgot to call UNO
    game.players[0]!.hand = [createNumberCard('RED', 1)];
    game.players[0]!.cardCount = 1;
    game.players[0]!.calledUno = false;

    // Bob catches Alice's UNO failure
    const result = processAction(game, {
      type: 'CATCH_UNO_FAILURE',
      callerPlayerId: 'p2',
      targetPlayerId: 'p1',
    });

    expect(result.success).toBe(true);
    // Alice penalized with 2 cards (total: 3)
    expect(result.state.players[0]!.cardCount).toBe(3);
  });

  it('handles 7-0 hand swapping when 7 card is played with sevenZero rule', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
      customRules: { sevenZero: true },
    });

    game.currentPlayerIndex = 0;
    game.pendingDrawCount = 0;
    game.currentColor = 'RED';
    game.currentType = 'NUMBER';
    game.discardPile = [createNumberCard('RED', 5)];

    const card7 = createNumberCard('RED', 7);
    const aliceExtra = createNumberCard('BLUE', 1);
    const bobCard1 = createNumberCard('GREEN', 2);
    const bobCard2 = createNumberCard('GREEN', 3);
    const bobCard3 = createNumberCard('GREEN', 4);

    game.players[0]!.hand = [card7, aliceExtra];
    game.players[0]!.cardCount = 2;
    game.players[1]!.hand = [bobCard1, bobCard2, bobCard3];
    game.players[1]!.cardCount = 3;

    const result = processAction(game, {
      type: 'PLAY_CARD',
      playerId: 'p1',
      cardId: card7.id,
      targetSwapPlayerId: 'p2',
    });

    expect(result.success).toBe(true);
    // Alice played 7, then swapped remaining 1 card with Bob's 3 cards
    expect(result.state.players[0]!.hand.length).toBe(3);
    expect(result.state.players[1]!.hand.length).toBe(1);
  });
});
