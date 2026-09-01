'use client';

import React from 'react';
import { PublicPlayerState } from '@/game-engine/types';
import { cn } from '@/lib/utils';
import { Bot, User, Flame } from 'lucide-react';

interface OpponentSeatProps {
  player: PublicPlayerState;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right';
  currentEmote?: string | null;
}

export const OpponentSeat: React.FC<OpponentSeatProps> = ({
  player,
  isCurrentTurn,
  position,
  currentEmote,
}) => {
  const isHorizontal = position === 'top';

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 sm:gap-3 transition-all duration-300',
        isHorizontal ? 'flex-col' : position === 'left' ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* Floating Emote Bubble */}
      {currentEmote && (
        <div className="absolute -top-10 z-30 px-3 py-1 rounded-full bg-purple-900/90 border border-purple-400 text-sm font-bold text-white shadow-xl animate-bounce">
          {currentEmote}
        </div>
      )}

      {/* Avatar Container with Turn Glow */}
      <div className="relative">
        <div
          className={cn(
            'w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 transition-all duration-300 bg-slate-800 border-2',
            isCurrentTurn
              ? 'border-purple-400 ring-4 ring-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.7)] scale-110'
              : 'border-slate-700'
          )}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white">
            {player.isBot ? (
              <Bot className="w-6 h-6 text-emerald-400" />
            ) : (
              <User className="w-6 h-6 text-blue-400" />
            )}
          </div>
        </div>

        {/* UNO Called Fire Badge */}
        {player.calledUno && (
          <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full bg-red-600 border border-white text-[9px] font-black text-white shadow-lg flex items-center gap-0.5 animate-pulse">
            <Flame className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
            UNO!
          </div>
        )}
      </div>

      {/* Player Info & Card Count */}
      <div
        className={cn(
          'flex flex-col',
          isHorizontal ? 'items-center text-center' : position === 'left' ? 'items-start text-left' : 'items-end text-right'
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-200 max-w-[90px] sm:max-w-[120px] truncate">
            {player.name}
          </span>
          {player.isBot && (
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
              BOT
            </span>
          )}
        </div>

        {/* Card Count Pill */}
        <div className="mt-1 flex items-center gap-1">
          <div className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400 shadow-inner">
            🎴 {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'}
          </div>
        </div>
      </div>
    </div>
  );
};
