import { describe, it, expect } from 'vitest';
import { calculateCardScore, calculateHandScore, calculateEndGameScores } from '@/game-engine/scoring';
import { createNumberCard, createActionCard, createWildCard } from '@/game-engine/cards';
import { Player } from '@/game-engine/types';

describe('Scoring Engine', () => {
  it('correctly values number cards, action cards, and wilds', () => {
    expect(calculateCardScore(createNumberCard('RED', 0))).toBe(0);
    expect(calculateCardScore(createNumberCard('RED', 7))).toBe(7);
    expect(calculateCardScore(createActionCard('BLUE', 'SKIP'))).toBe(20);
    expect(calculateCardScore(createActionCard('GREEN', 'REVERSE'))).toBe(20);
    expect(calculateCardScore(createActionCard('YELLOW', 'DRAW_TWO'))).toBe(20);
    expect(calculateCardScore(createWildCard('WILD'))).toBe(50);
    expect(calculateCardScore(createWildCard('WILD_DRAW_FOUR'))).toBe(50);
  });

  it('aggregates hand score correctly', () => {
    const hand = [
      createNumberCard('RED', 5),
      createActionCard('BLUE', 'SKIP'),
      createWildCard('WILD_DRAW_FOUR'),
    ];
    // 5 + 20 + 50 = 75
    expect(calculateHandScore(hand)).toBe(75);
  });

  it('awards winner sum of all opponent remaining points', () => {
    const players: Player[] = [
      {
        id: 'p1',
        name: 'Winner',
        isBot: false,
        hand: [],
        cardCount: 0,
        calledUno: true,
        score: 0,
      },
      {
        id: 'p2',
        name: 'Opponent 1',
        isBot: false,
        hand: [createNumberCard('RED', 5), createActionCard('BLUE', 'SKIP')], // 5 + 20 = 25
        cardCount: 2,
        calledUno: false,
        score: 0,
      },
      {
        id: 'p3',
        name: 'Opponent 2',
        isBot: false,
        hand: [createWildCard('WILD')], // 50
        cardCount: 1,
        calledUno: false,
        score: 0,
      },
    ];

    const result = calculateEndGameScores(players, 'p1');
    expect(result.winnerId).toBe('p1');
    expect(result.pointsAwarded).toBe(75); // 25 + 50
    expect(result.playerRankings[0]!.playerId).toBe('p1');
    expect(result.playerRankings[0]!.rank).toBe(1);
  });
});
