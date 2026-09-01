import { Card, Player } from '../types';

/**
 * Calculates total point value of a single card.
 */
export function calculateCardScore(card: Card): number {
  if (card.scoreValue !== undefined) {
    return card.scoreValue;
  }
  if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') {
    return 50;
  }
  if (card.type === 'SKIP' || card.type === 'REVERSE' || card.type === 'DRAW_TWO') {
    return 20;
  }
  if (card.type === 'NUMBER' && card.value !== undefined) {
    return card.value;
  }
  return 0;
}

/**
 * Calculates the total score of all cards in a player's hand.
 */
export function calculateHandScore(hand: Card[]): number {
  return hand.reduce((total, card) => total + calculateCardScore(card), 0);
}

export interface GameScoreResult {
  winnerId: string;
  pointsAwarded: number;
  playerRankings: {
    playerId: string;
    rank: number;
    handCount: number;
    handPoints: number;
  }[];
}

/**
 * Computes official game resolution scores and player rankings.
 * The winner scores the sum of all points from opponents' remaining cards.
 */
export function calculateEndGameScores(
  players: Player[],
  winnerId: string
): GameScoreResult {
  let totalWinnerPoints = 0;

  const playerStats = players.map((player) => {
    const isWinner = player.id === winnerId;
    const handPoints = calculateHandScore(player.hand);
    if (!isWinner) {
      totalWinnerPoints += handPoints;
    }
    return {
      playerId: player.id,
      handCount: player.hand.length,
      handPoints: isWinner ? 0 : handPoints,
    };
  });

  // Sort rankings: Winner is rank 1, then fewest cards, then lowest points
  const sorted = [...playerStats].sort((a, b) => {
    if (a.playerId === winnerId) return -1;
    if (b.playerId === winnerId) return 1;
    if (a.handCount !== b.handCount) return a.handCount - b.handCount;
    return a.handPoints - b.handPoints;
  });

  const playerRankings = sorted.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));

  return {
    winnerId,
    pointsAwarded: totalWinnerPoints,
    playerRankings,
  };
}
