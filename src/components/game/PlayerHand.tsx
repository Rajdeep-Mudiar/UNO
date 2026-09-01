'use client';

import React from 'react';
import { Card } from '@/game-engine/types';
import { GameCard, CardSizeType } from '@/components/cards/GameCard';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
  hand: Card[];
  legalCardIds: string[];
  isMyTurn: boolean;
  onPlayCard: (card: Card) => void;
  selectedCardId?: string | null;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  legalCardIds,
  isMyTurn,
  onPlayCard,
  selectedCardId,
}) => {
  const count = hand.length;

  // 1. Determine optimal card size based on hand size
  let cardSize: CardSizeType = 'normal';
  if (count > 18) {
    cardSize = 'mini';
  } else if (count > 12) {
    cardSize = 'compact';
  } else if (count > 7) {
    cardSize = 'medium';
  }

  // 2. Determine dynamic horizontal overlap spacing
  const overlapClasses = (() => {
    if (count <= 4) return '-space-x-4 sm:-space-x-6';
    if (count <= 7) return '-space-x-8 sm:-space-x-12';
    if (count <= 10) return '-space-x-10 sm:-space-x-14';
    if (count <= 15) return '-space-x-12 sm:-space-x-16';
    if (count <= 22) return '-space-x-14 sm:-space-x-18';
    return '-space-x-16 sm:-space-x-20';
  })();

  // Maximum rotation angle per card decreases with more cards to keep fan clean
  const maxArcAngle = count > 15 ? 10 : 15;
  const angleStep = count > 1 ? Math.min(2.5, (maxArcAngle * 2) / (count - 1)) : 0;

  return (
    <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 flex flex-col items-center justify-center">
      {/* Hand status & card count indicator if large */}
      {count > 8 && (
        <div className="mb-2 px-3 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-400">
          Your Hand ({count} cards)
        </div>
      )}

      {/* Horizontal scroll container with auto-fit centering */}
      <div className="w-full overflow-x-auto overflow-y-visible py-6 px-4 flex items-center justify-center scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className={cn('flex items-center justify-center transition-all duration-300', overlapClasses)}>
          {hand.map((card, index) => {
            const isPlayable = isMyTurn && legalCardIds.includes(card.id);
            const isSelected = selectedCardId === card.id;

            // Compute fan arc angle
            const offset = index - (count - 1) / 2;
            const rotationAngle = Math.max(-maxArcAngle, Math.min(maxArcAngle, offset * angleStep));

            return (
              <div
                key={card.id}
                className={cn(
                  'relative transform transition-all duration-200 z-10 origin-bottom',
                  isPlayable ? 'hover:z-50 cursor-pointer' : 'hover:z-40'
                )}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                }}
              >
                <GameCard
                  card={card}
                  size={cardSize}
                  isPlayable={isPlayable}
                  isSelected={isSelected}
                  onClick={isPlayable ? () => onPlayCard(card) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
