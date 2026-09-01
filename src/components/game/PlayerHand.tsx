'use client';

import React from 'react';
import { Card } from '@/game-engine/types';
import { GameCard } from '@/components/cards/GameCard';
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
  return (
    <div className="relative w-full overflow-x-auto pb-4 pt-8 px-4 flex items-center justify-center">
      <div className="flex items-center -space-x-8 sm:-space-x-12 hover:-space-x-4 transition-all duration-300">
        {hand.map((card, index) => {
          const isPlayable = isMyTurn && legalCardIds.includes(card.id);
          const isSelected = selectedCardId === card.id;

          // Compute subtle fan arc angle
          const offset = index - (hand.length - 1) / 2;
          const rotationAngle = Math.max(-15, Math.min(15, offset * 2.5));

          return (
            <div
              key={card.id}
              className={cn(
                'relative transform transition-all duration-200 z-10',
                isPlayable ? 'hover:z-30' : 'hover:z-20'
              )}
              style={{
                transform: `rotate(${rotationAngle}deg)`,
              }}
            >
              <GameCard
                card={card}
                isPlayable={isPlayable}
                isSelected={isSelected}
                onClick={isPlayable ? () => onPlayCard(card) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
