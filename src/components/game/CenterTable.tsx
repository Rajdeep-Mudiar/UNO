'use client';

import React from 'react';
import { Card, CardColor, GameDirection } from '@/game-engine/types';
import { GameCard } from '@/components/cards/GameCard';
import { cn } from '@/lib/utils';
import { RotateCw, RotateCcw, Flame, Timer } from 'lucide-react';

interface CenterTableProps {
  topCard: Card;
  currentColor: CardColor;
  direction: GameDirection;
  pendingDrawCount: number;
  isMyTurn: boolean;
  onDrawCard: () => void;
  drawPileCount?: number;
  turnSecondsRemaining?: number;
}

const COLOR_RING_MAP: Record<CardColor, string> = {
  RED: 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.6)]',
  BLUE: 'border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.6)]',
  GREEN: 'border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.6)]',
  YELLOW: 'border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.6)]',
  WILD: 'border-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.6)]',
};

export const CenterTable: React.FC<CenterTableProps> = ({
  topCard,
  currentColor,
  direction,
  pendingDrawCount,
  isMyTurn,
  onDrawCard,
  drawPileCount = 80,
  turnSecondsRemaining,
}) => {
  return (
    <div className="relative flex items-center justify-center p-6 sm:p-10">
      {/* Outer Active Color Glow Ring & Direction Orbit */}
      <div
        className={cn(
          'absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 transition-all duration-500 bg-slate-950/60 backdrop-blur-md flex items-center justify-center pointer-events-none',
          COLOR_RING_MAP[currentColor] || COLOR_RING_MAP.WILD
        )}
      >
        {/* Direction & Live Turn Timer Badges */}
        <div className="absolute -top-5 flex items-center gap-2">
          {/* Direction Indicator */}
          <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-md">
            {direction === 1 ? (
              <>
                <RotateCw className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Clockwise</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
                <span>Counter-Clockwise</span>
              </>
            )}
          </div>

          {/* Turn Countdown Timer */}
          {turnSecondsRemaining !== undefined && (
            <div
              className={cn(
                'px-3 py-1 rounded-full border text-[11px] font-black flex items-center gap-1.5 shadow-lg transition-all',
                turnSecondsRemaining <= 4
                  ? 'bg-red-500/30 border-red-500 text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)] scale-105'
                  : turnSecondsRemaining <= 8
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-purple-950/80 border-purple-500/40 text-purple-300'
              )}
            >
              <Timer className={cn('w-3.5 h-3.5', turnSecondsRemaining <= 4 ? 'text-red-400 animate-bounce' : 'text-purple-400')} />
              <span>{turnSecondsRemaining}s left</span>
            </div>
          )}
        </div>

        {/* Pending Draw Penalty Stack Banner */}
        {pendingDrawCount > 0 && (
          <div className="absolute -bottom-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 border-2 border-white text-xs font-black text-white shadow-xl animate-bounce flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" />
            <span>+{pendingDrawCount} PENDING STACK</span>
          </div>
        )}
      </div>

      {/* Center Table Cards Area */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-8">
        {/* Draw Pile (Stacked 3D Visual) */}
        <div className="relative group">
          {/* Visual Stack Layers */}
          <div className="absolute top-2 -left-1 w-24 h-36 sm:w-28 sm:h-40 rounded-xl bg-slate-800 border border-slate-700 pointer-events-none transform -rotate-3" />
          <div className="absolute top-1 -left-0.5 w-24 h-36 sm:w-28 sm:h-40 rounded-xl bg-slate-850 border border-slate-700 pointer-events-none transform rotate-2" />

          {/* Top Draw Card */}
          <button
            type="button"
            onClick={onDrawCard}
            disabled={!isMyTurn}
            aria-label="Draw a card"
            className={cn(
              'relative transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-4 focus:ring-purple-400/80 rounded-xl',
              isMyTurn && 'hover:scale-105 hover:-translate-y-2 cursor-pointer',
              !isMyTurn && 'opacity-80 cursor-not-allowed'
            )}
          >
            <GameCard card={topCard} isFaceDown isPlayable={isMyTurn} />
            
            {/* Draw Pile Badge */}
            <div className="absolute bottom-2 inset-x-2 text-center">
              <span className="px-2 py-0.5 rounded bg-black/75 border border-slate-700 text-[10px] font-bold text-slate-300">
                {drawPileCount} left
              </span>
            </div>
          </button>
        </div>

        {/* Discard Pile */}
        <div className="relative">
          <div className="transform rotate-1 transition-transform">
            <GameCard card={topCard} />
          </div>
        </div>
      </div>
    </div>
  );
};
