import { Card } from '../types';
import { createStandardDeck } from '../cards';

/**
 * Fisher-Yates (Knuth) Shuffle algorithm.
 * Shuffles an array in place with O(n) complexity.
 */
export function shuffleCards(deck: Card[], randomFn: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

export interface DeckState {
  drawPile: Card[];
  discardPile: Card[];
}

/**
 * Draws `count` cards from the draw pile. If draw pile runs low,
 * it recycles the discard pile (excluding the top card) and shuffles it.
 */
export function drawCardsFromPile(
  drawPile: Card[],
  discardPile: Card[],
  count: number
): { drawn: Card[]; drawPile: Card[]; discardPile: Card[] } {
  let currentDraw = [...drawPile];
  let currentDiscard = [...discardPile];
  const drawn: Card[] = [];

  for (let i = 0; i < count; i++) {
    if (currentDraw.length === 0) {
      if (currentDiscard.length <= 1) {
        // No cards left to draw in either pile
        break;
      }
      // Keep top card on discard pile
      const topDiscard = currentDiscard[currentDiscard.length - 1]!;
      const cardsToRecycle = currentDiscard.slice(0, currentDiscard.length - 1);
      currentDraw = shuffleCards(cardsToRecycle);
      currentDiscard = [topDiscard];
    }

    const card = currentDraw.pop();
    if (card) {
      drawn.push(card);
    }
  }

  return {
    drawn,
    drawPile: currentDraw,
    discardPile: currentDiscard,
  };
}

/**
 * Prepares initial game deck and starting discard pile.
 * Ensures the first card on the discard pile is valid (never a Wild Draw Four).
 */
export function initializeGamePiles(
  customDeck?: Card[]
): { drawPile: Card[]; discardPile: Card[] } {
  let drawPile = shuffleCards(customDeck ?? createStandardDeck());
  const discardPile: Card[] = [];

  // Find first card that is NOT Wild Draw Four
  let initialCardIndex = -1;
  for (let i = drawPile.length - 1; i >= 0; i--) {
    if (drawPile[i]!.type !== 'WILD_DRAW_FOUR') {
      initialCardIndex = i;
      break;
    }
  }

  if (initialCardIndex === -1) {
    // Edge case with custom deck containing only Wild Draw Fours
    initialCardIndex = drawPile.length - 1;
  }

  const [initialCard] = drawPile.splice(initialCardIndex, 1);
  if (initialCard) {
    discardPile.push(initialCard);
  }

  return {
    drawPile,
    discardPile,
  };
}
