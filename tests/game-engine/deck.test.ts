import { describe, it, expect } from 'vitest';
import { createStandardDeck, createNumberCard } from '@/game-engine/cards';
import { drawCardsFromPile, initializeGamePiles, shuffleCards } from '@/game-engine/deck';

describe('UNO Deck & Card Construction', () => {
  it('creates standard 108-card deck with correct distributions', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(108);

    const redCards = deck.filter((c) => c.color === 'RED');
    const blueCards = deck.filter((c) => c.color === 'BLUE');
    const greenCards = deck.filter((c) => c.color === 'GREEN');
    const yellowCards = deck.filter((c) => c.color === 'YELLOW');
    const wildCards = deck.filter((c) => c.color === 'WILD');

    expect(redCards).toHaveLength(25);
    expect(blueCards).toHaveLength(25);
    expect(greenCards).toHaveLength(25);
    expect(yellowCards).toHaveLength(25);
    expect(wildCards).toHaveLength(8); // 4 Wild + 4 Wild Draw Four

    // Check 0s: exactly one 0 per color
    ['RED', 'BLUE', 'GREEN', 'YELLOW'].forEach((color) => {
      const zeros = deck.filter((c) => c.color === color && c.type === 'NUMBER' && c.value === 0);
      expect(zeros).toHaveLength(1);
    });

    // Check 1-9: exactly two of each per color
    ['RED', 'BLUE', 'GREEN', 'YELLOW'].forEach((color) => {
      for (let v = 1; v <= 9; v++) {
        const numbers = deck.filter((c) => c.color === color && c.type === 'NUMBER' && c.value === v);
        expect(numbers).toHaveLength(2);
      }
    });

    // Check actions: two Skips, two Reverses, two Draw Twos per color
    ['RED', 'BLUE', 'GREEN', 'YELLOW'].forEach((color) => {
      expect(deck.filter((c) => c.color === color && c.type === 'SKIP')).toHaveLength(2);
      expect(deck.filter((c) => c.color === color && c.type === 'REVERSE')).toHaveLength(2);
      expect(deck.filter((c) => c.color === color && c.type === 'DRAW_TWO')).toHaveLength(2);
    });
  });

  it('assigns unique card IDs to every card', () => {
    const deck = createStandardDeck();
    const idSet = new Set(deck.map((c) => c.id));
    expect(idSet.size).toBe(108);
  });

  it('shuffles cards effectively with Fisher-Yates', () => {
    const deck = createStandardDeck();
    const shuffled = shuffleCards(deck);
    expect(shuffled).toHaveLength(108);
    // Almost certainly not in original sequential order
    const matchCount = deck.filter((c, i) => c.id === shuffled[i]?.id).length;
    expect(matchCount).toBeLessThan(15);
  });

  it('draws cards and recycles discard pile when draw pile is empty', () => {
    const card1 = createNumberCard('RED', 1);
    const card2 = createNumberCard('RED', 2);
    const card3 = createNumberCard('BLUE', 3);
    const topDiscard = createNumberCard('GREEN', 5);

    const drawPile = [card1];
    const discardPile = [card2, card3, topDiscard];

    // Drawing 2 cards will exhaust drawPile (1 card) and recycle card2 & card3 from discard
    const result = drawCardsFromPile(drawPile, discardPile, 2);

    expect(result.drawn).toHaveLength(2);
    expect(result.discardPile).toHaveLength(1);
    expect(result.discardPile[0]!.id).toBe(topDiscard.id); // Top discard preserved
  });

  it('initializes game piles with valid top card (not Wild Draw Four)', () => {
    const { drawPile, discardPile } = initializeGamePiles();
    expect(discardPile).toHaveLength(1);
    expect(discardPile[0]!.type).not.toBe('WILD_DRAW_FOUR');
    expect(drawPile).toHaveLength(107);
  });
});
