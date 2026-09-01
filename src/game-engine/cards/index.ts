import { Card, CardColor, CardType } from '../types';

let cardSequence = 1;

export function generateCardId(color: CardColor, type: CardType, value?: number): string {
  const valStr = value !== undefined ? `_${value}` : '';
  const seq = (cardSequence++).toString(36);
  return `${color}_${type}${valStr}_${seq}_${Math.random().toString(36).substring(2, 6)}`;
}

export function resetCardSequence(): void {
  cardSequence = 1;
}

export function createNumberCard(color: CardColor, value: number): Card {
  if (color === 'WILD') {
    throw new Error('Number cards cannot have WILD color');
  }
  if (value < 0 || value > 9) {
    throw new Error(`Number card value must be between 0 and 9, got ${value}`);
  }
  return {
    id: generateCardId(color, 'NUMBER', value),
    color,
    type: 'NUMBER',
    value,
    scoreValue: value,
    label: `${color} ${value}`,
  };
}

export function createActionCard(color: CardColor, type: 'SKIP' | 'REVERSE' | 'DRAW_TWO'): Card {
  if (color === 'WILD') {
    throw new Error('Action cards cannot have WILD base color');
  }
  return {
    id: generateCardId(color, type),
    color,
    type,
    scoreValue: 20,
    label: `${color} ${type.replace('_', ' ')}`,
  };
}

export function createWildCard(type: 'WILD' | 'WILD_DRAW_FOUR' = 'WILD'): Card {
  return {
    id: generateCardId('WILD', type),
    color: 'WILD',
    type,
    scoreValue: 50,
    label: type === 'WILD_DRAW_FOUR' ? 'Wild Draw Four' : 'Wild',
  };
}

/**
 * Creates standard 108-card Uno-style deck:
 * - 4 Colors: RED, BLUE, GREEN, YELLOW
 * - Each color has:
 *   - One '0' card
 *   - Two of each '1'-'9' cards (18 cards)
 *   - Two 'Skip' cards (2 cards)
 *   - Two 'Reverse' cards (2 cards)
 *   - Two 'Draw Two' cards (2 cards)
 *   Total per color: 25 cards * 4 = 100 cards
 * - 4 Wild cards
 * - 4 Wild Draw Four cards
 * Total Deck: 108 cards
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  const colors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

  for (const color of colors) {
    // One '0' card
    deck.push(createNumberCard(color, 0));

    // Two of each 1-9
    for (let v = 1; v <= 9; v++) {
      deck.push(createNumberCard(color, v));
      deck.push(createNumberCard(color, v));
    }

    // Two of each Action Card
    deck.push(createActionCard(color, 'SKIP'));
    deck.push(createActionCard(color, 'SKIP'));

    deck.push(createActionCard(color, 'REVERSE'));
    deck.push(createActionCard(color, 'REVERSE'));

    deck.push(createActionCard(color, 'DRAW_TWO'));
    deck.push(createActionCard(color, 'DRAW_TWO'));
  }

  // 4 Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push(createWildCard('WILD'));
  }

  // 4 Wild Draw Four cards
  for (let i = 0; i < 4; i++) {
    deck.push(createWildCard('WILD_DRAW_FOUR'));
  }

  return deck;
}

export function isWildCard(card: Card): boolean {
  return card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR' || card.color === 'WILD';
}

export function isActionCard(card: Card): boolean {
  return card.type === 'SKIP' || card.type === 'REVERSE' || card.type === 'DRAW_TWO';
}

export function areCardsIdentical(a: Card, b: Card): boolean {
  if (a.color !== b.color) return false;
  if (a.type !== b.type) return false;
  if (a.type === 'NUMBER') return a.value === b.value;
  return true;
}
