import { describe, it, expect } from 'vitest';
import { getNextPlayerIndex, processReverseCard } from '@/game-engine/turns';

describe('Turn Progression & Order', () => {
  it('advances clockwise (direction = 1) and wraps around', () => {
    const playerCount = 4;
    expect(getNextPlayerIndex(0, playerCount, 1, 1)).toBe(1);
    expect(getNextPlayerIndex(1, playerCount, 1, 1)).toBe(2);
    expect(getNextPlayerIndex(2, playerCount, 1, 1)).toBe(3);
    expect(getNextPlayerIndex(3, playerCount, 1, 1)).toBe(0);
  });

  it('advances counter-clockwise (direction = -1) and wraps around', () => {
    const playerCount = 4;
    expect(getNextPlayerIndex(0, playerCount, -1, 1)).toBe(3);
    expect(getNextPlayerIndex(3, playerCount, -1, 1)).toBe(2);
    expect(getNextPlayerIndex(2, playerCount, -1, 1)).toBe(1);
    expect(getNextPlayerIndex(1, playerCount, -1, 1)).toBe(0);
  });

  it('handles Skip action step count = 2', () => {
    const playerCount = 4;
    expect(getNextPlayerIndex(0, playerCount, 1, 2)).toBe(2);
    expect(getNextPlayerIndex(2, playerCount, 1, 2)).toBe(0);
  });

  it('inverts direction for 3+ players on Reverse', () => {
    const rev = processReverseCard(4, 1);
    expect(rev.newDirection).toBe(-1);
    expect(rev.stepCount).toBe(1);
  });

  it('treats Reverse as Skip (step 2) in 2-player game', () => {
    const rev = processReverseCard(2, 1);
    expect(rev.newDirection).toBe(-1);
    expect(rev.stepCount).toBe(2); // Step 2 in 2-player game returns turn to original player
  });
});
