'use client';

import React from 'react';
import { Card, CardColor } from '@/game-engine/types';
import { cn } from '@/lib/utils';

export type CardSizeType = 'normal' | 'medium' | 'compact' | 'mini';

interface GameCardProps {
  card: Card;
  isPlayable?: boolean;
  isSelected?: boolean;
  isSmall?: boolean;
  size?: CardSizeType;
  isFaceDown?: boolean;
  onClick?: () => void;
  className?: string;
}

const COLOR_MAP: Record<CardColor, { bg: string; border: string; glow: string; text: string; badge: string }> = {
  RED: {
    bg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
    border: 'border-red-400/80',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    text: 'text-red-500',
    badge: 'bg-red-500 text-white',
  },
  BLUE: {
    bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
    border: 'border-blue-400/80',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    text: 'text-blue-500',
    badge: 'bg-blue-500 text-white',
  },
  GREEN: {
    bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700',
    border: 'border-emerald-400/80',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500 text-white',
  },
  YELLOW: {
    bg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600',
    border: 'border-amber-300/80',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    text: 'text-amber-500',
    badge: 'bg-amber-400 text-slate-950 font-black',
  },
  WILD: {
    bg: 'bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900',
    border: 'border-purple-400/80',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
    text: 'text-purple-400',
    badge: 'bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 text-white font-black',
  },
};

export const GameCard: React.FC<GameCardProps> = ({
  card,
  isPlayable = false,
  isSelected = false,
  isSmall = false,
  size = 'normal',
  isFaceDown = false,
  onClick,
  className,
}) => {
  const colorStyles = COLOR_MAP[card.color] || COLOR_MAP.WILD;

  // Resolve effective size classes
  const effectiveSize: CardSizeType = isSmall ? 'mini' : size;

  const sizeClasses = {
    normal: 'w-24 h-36 sm:w-28 sm:h-40 p-2',
    medium: 'w-20 h-30 sm:w-24 sm:h-36 p-1.5',
    compact: 'w-16 h-24 sm:w-20 sm:h-30 p-1',
    mini: 'w-12 h-18 sm:w-14 sm:h-22 p-1',
  }[effectiveSize];

  if (isFaceDown) {
    return (
      <div
        className={cn(
          'relative rounded-xl border-2 border-slate-700 bg-slate-900 shadow-md transition-all select-none overflow-hidden shrink-0',
          sizeClasses,
          className
        )}
      >
        <div className="absolute inset-1 rounded-lg border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-purple-500/40 bg-purple-950/40 flex items-center justify-center">
            <span className="text-[10px] font-black tracking-widest text-purple-400">UNO</span>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (card.type) {
      case 'NUMBER':
        return (
          <div className="flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-black drop-shadow-md text-white tracking-tighter',
                effectiveSize === 'normal' && 'text-4xl sm:text-5xl',
                effectiveSize === 'medium' && 'text-3xl sm:text-4xl',
                effectiveSize === 'compact' && 'text-2xl sm:text-3xl',
                effectiveSize === 'mini' && 'text-lg sm:text-xl'
              )}
            >
              {card.value}
            </span>
          </div>
        );
      case 'SKIP':
        return (
          <div className="flex flex-col items-center justify-center">
            <svg
              className={cn(
                'text-white drop-shadow-md',
                effectiveSize === 'normal' && 'w-10 h-10 sm:w-12 sm:h-12',
                effectiveSize === 'medium' && 'w-8 h-8 sm:w-10 sm:h-10',
                effectiveSize === 'compact' && 'w-6 h-6 sm:w-8 sm:h-8',
                effectiveSize === 'mini' && 'w-4 h-4 sm:w-5 sm:h-5'
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
        );
      case 'REVERSE':
        return (
          <div className="flex flex-col items-center justify-center">
            <svg
              className={cn(
                'text-white drop-shadow-md',
                effectiveSize === 'normal' && 'w-10 h-10 sm:w-12 sm:h-12',
                effectiveSize === 'medium' && 'w-8 h-8 sm:w-10 sm:h-10',
                effectiveSize === 'compact' && 'w-6 h-6 sm:w-8 sm:h-8',
                effectiveSize === 'mini' && 'w-4 h-4 sm:w-5 sm:h-5'
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16V4M7 4L3 8M7 4L11 8" />
              <path d="M17 8V20M17 20L21 16M17 20L13 16" />
            </svg>
          </div>
        );
      case 'DRAW_TWO':
        return (
          <div className="flex flex-col items-center justify-center">
            <span
              className={cn(
                'font-black drop-shadow-md text-white tracking-tight',
                effectiveSize === 'normal' && 'text-3xl sm:text-4xl',
                effectiveSize === 'medium' && 'text-2xl sm:text-3xl',
                effectiveSize === 'compact' && 'text-xl sm:text-2xl',
                effectiveSize === 'mini' && 'text-sm sm:text-base'
              )}
            >
              +2
            </span>
          </div>
        );
      case 'WILD':
        return (
          <div className="relative flex items-center justify-center">
            <div
              className={cn(
                'rounded-full grid grid-cols-2 overflow-hidden shadow-inner border border-white/20',
                effectiveSize === 'normal' && 'w-12 h-12 sm:w-14 sm:h-14',
                effectiveSize === 'medium' && 'w-10 h-10 sm:w-12 sm:h-12',
                effectiveSize === 'compact' && 'w-7 h-7 sm:w-9 sm:h-9',
                effectiveSize === 'mini' && 'w-5 h-5 sm:w-6 sm:h-6'
              )}
            >
              <div className="bg-red-500" />
              <div className="bg-blue-500" />
              <div className="bg-amber-400" />
              <div className="bg-emerald-500" />
            </div>
          </div>
        );
      case 'WILD_DRAW_FOUR':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={cn(
                'rounded-full grid grid-cols-2 overflow-hidden shadow-inner border border-white/20 absolute opacity-70',
                effectiveSize === 'normal' && 'w-14 h-14 sm:w-16 sm:h-16',
                effectiveSize === 'medium' && 'w-11 h-11 sm:w-13 sm:h-13',
                effectiveSize === 'compact' && 'w-8 h-8 sm:w-10 sm:h-10',
                effectiveSize === 'mini' && 'w-6 h-6 sm:w-7 sm:h-7'
              )}
            >
              <div className="bg-red-500" />
              <div className="bg-blue-500" />
              <div className="bg-amber-400" />
              <div className="bg-emerald-500" />
            </div>
            <span
              className={cn(
                'relative font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white z-10',
                effectiveSize === 'normal' && 'text-3xl sm:text-4xl',
                effectiveSize === 'medium' && 'text-2xl sm:text-3xl',
                effectiveSize === 'compact' && 'text-xl sm:text-2xl',
                effectiveSize === 'mini' && 'text-sm sm:text-base'
              )}
            >
              +4
            </span>
          </div>
        );
      default:
        return <span className="font-bold text-white text-xs">{card.type}</span>;
    }
  };

  const cornerLabel = () => {
    if (card.type === 'NUMBER') return card.value;
    if (card.type === 'DRAW_TWO') return '+2';
    if (card.type === 'WILD_DRAW_FOUR') return '+4';
    if (card.type === 'SKIP') return '⊘';
    if (card.type === 'REVERSE') return '⇄';
    if (card.type === 'WILD') return '★';
    return '';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={`${card.color} ${card.type} ${card.value !== undefined ? card.value : ''}`}
      className={cn(
        'relative rounded-xl border-2 shadow-lg transition-all duration-200 select-none overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/80 shrink-0',
        colorStyles.bg,
        colorStyles.border,
        sizeClasses,
        isSelected && '-translate-y-5 ring-4 ring-white shadow-2xl scale-110 z-40',
        isPlayable && !isSelected && 'hover:-translate-y-3 hover:shadow-xl hover:scale-105 cursor-pointer z-30',
        !isPlayable && onClick && 'opacity-60 cursor-not-allowed filter grayscale-[20%]',
        className
      )}
    >
      {/* Gloss reflection layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />

      {/* Top Left Corner */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center">
        <span
          className={cn(
            'font-black text-white drop-shadow-sm',
            effectiveSize === 'normal' && 'text-xs sm:text-sm',
            effectiveSize === 'medium' && 'text-[11px] sm:text-xs',
            effectiveSize === 'compact' && 'text-[9px] sm:text-[10px]',
            effectiveSize === 'mini' && 'text-[8px]'
          )}
        >
          {cornerLabel()}
        </span>
      </div>

      {/* Center Oval Emblem */}
      <div className="absolute inset-x-1.5 inset-y-2.5 sm:inset-x-2.5 sm:inset-y-3.5 rounded-[40%] bg-black/25 backdrop-blur-[1px] border border-white/20 flex items-center justify-center transform -rotate-12">
        <div className="transform rotate-12 flex items-center justify-center">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center transform rotate-180">
        <span
          className={cn(
            'font-black text-white drop-shadow-sm',
            effectiveSize === 'normal' && 'text-xs sm:text-sm',
            effectiveSize === 'medium' && 'text-[11px] sm:text-xs',
            effectiveSize === 'compact' && 'text-[9px] sm:text-[10px]',
            effectiveSize === 'mini' && 'text-[8px]'
          )}
        >
          {cornerLabel()}
        </span>
      </div>
    </button>
  );
};
