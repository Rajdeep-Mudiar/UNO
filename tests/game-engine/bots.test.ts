import { describe, it, expect } from 'vitest';
import { evaluateBotAction, chooseDominantColor, findLeadingOpponent } from '@/bots/strategy';
import { createGame } from '@/game-engine/actions';
import { createNumberCard, createActionCard, createWildCard } from '@/game-engine/cards';
import { Player } from '@/game-engine/types';

describe('Bot Strategy & AI Decision Engine', () => {
  it('identifies dominant color correctly in hand', () => {
    const hand = [
      createNumberCard('RED', 1),
      createNumberCard('RED', 5),
      createNumberCard('BLUE', 3),
      createWildCard('WILD'),
    ];
    expect(chooseDominantColor(hand)).toBe('RED');
  });

  it('identifies the leading opponent threat with fewest cards', () => {
    const players: Player[] = [
      { id: 'bot', name: 'Bot', isBot: true, hand: [createNumberCard('RED', 1), createNumberCard('RED', 2)], cardCount: 2, calledUno: false, score: 0 },
      { id: 'p1', name: 'Player 1', isBot: false, hand: [createNumberCard('BLUE', 1)], cardCount: 1, calledUno: true, score: 0 },
      { id: 'p2', name: 'Player 2', isBot: false, hand: [createNumberCard('GREEN', 1), createNumberCard('GREEN', 2), createNumberCard('GREEN', 3)], cardCount: 3, calledUno: false, score: 0 },
    ];

    const leader = findLeadingOpponent(players, 'bot');
    expect(leader?.id).toBe('p1');
  });

  it('evaluates and stacks Draw Two when pending draw count exists', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'bot', name: 'Bot', isBot: true },
      ],
    });

    game.pendingDrawCount = 2;
    game.discardPile = [createActionCard('RED', 'DRAW_TWO')];
    game.currentColor = 'RED';
    game.currentType = 'DRAW_TWO';
    const botDrawTwo = createActionCard('BLUE', 'DRAW_TWO');
    const botNumber = createNumberCard('RED', 3);
    const botPlayer = game.players[1]!;
    botPlayer.hand = [botDrawTwo, botNumber];
    botPlayer.cardCount = 2;

    const action = evaluateBotAction(game, botPlayer, { difficulty: 'HARD' });
    expect(action.type).toBe('PLAY_CARD');
    if (action.type === 'PLAY_CARD') {
      expect(action.cardId).toBe(botDrawTwo.id);
    }
  });

  it('draws card if no legal card can be played', () => {
    const game = createGame({
      gameId: 'g1',
      roomId: 'r1',
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'bot', name: 'Bot', isBot: true },
      ],
    });

    game.currentColor = 'RED';
    game.currentType = 'NUMBER';
    game.discardPile = [createNumberCard('RED', 0)];

    const botPlayer = game.players[1]!;
    botPlayer.hand = [createNumberCard('BLUE', 5), createNumberCard('GREEN', 7)];
    botPlayer.cardCount = 2;

    const action = evaluateBotAction(game, botPlayer, { difficulty: 'HARD' });
    expect(action.type).toBe('DRAW_CARD');
  });
});
