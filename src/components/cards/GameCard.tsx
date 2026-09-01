'use client';

import React from 'react';
import { Card, CardColor } from '@/game-engine/types';
import { cn } from '@/lib/utils';

interface GameCardProps {
  card: Card;
  isPlayable?: boolean;
  isSelected?: boolean;
  isSmall?: boolean;
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
  isFaceDown = false,
  onClick,
  className,
}) => {
  const colorStyles = COLOR_MAP[card.color] || COLOR_MAP.WILD;

  if (isFaceDown) {
    return (
      <div
        className={cn(
          'relative rounded-xl border-2 border-slate-700 bg-slate-900 shadow-md transition-all select-none overflow-hidden',
          isSmall ? 'w-10 h-14' : 'w-24 h-36 sm:w-28 sm:h-40',
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
            <span className={cn('font-black drop-shadow-md text-white tracking-tighter', isSmall ? 'text-lg' : 'text-4xl sm:text-5xl')}>
              {card.value}
            </span>
          </div>
        );
      case 'SKIP':
        return (
          <div className="flex flex-col items-center justify-center">
            <svg
              className={cn('text-white drop-shadow-md', isSmall ? 'w-5 h-5' : 'w-10 h-10 sm:w-12 sm:h-12')}
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
              className={cn('text-white drop-shadow-md', isSmall ? 'w-5 h-5' : 'w-10 h-10 sm:w-12 sm:h-12')}
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
            <span className={cn('font-black drop-shadow-md text-white tracking-tight', isSmall ? 'text-base' : 'text-3xl sm:text-4xl')}>
              +2
            </span>
          </div>
        );
      case 'WILD':
        return (
          <div className="relative flex items-center justify-center">
            <div className={cn('rounded-full grid grid-cols-2 overflow-hidden shadow-inner border border-white/20', isSmall ? 'w-6 h-6' : 'w-12 h-12 sm:w-14 sm:h-14')}>
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
            <div className={cn('rounded-full grid grid-cols-2 overflow-hidden shadow-inner border border-white/20 absolute opacity-70', isSmall ? 'w-6 h-6' : 'w-14 h-14 sm:w-16 sm:h-16')}>
              <div className="bg-red-500" />
              <div className="bg-blue-500" />
              <div className="bg-amber-400" />
              <div className="bg-emerald-500" />
            </div>
            <span className={cn('relative font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white z-10', isSmall ? 'text-base' : 'text-3xl sm:text-4xl')}>
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
        'relative rounded-xl border-2 shadow-lg transition-all duration-200 select-none overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/80',
        colorStyles.bg,
        colorStyles.border,
        isSmall ? 'w-10 h-14 p-1' : 'w-24 h-36 sm:w-28 sm:h-40 p-2',
        isSelected && '-translate-y-4 ring-4 ring-white shadow-2xl scale-105',
        isPlayable && !isSelected && 'hover:-translate-y-2 hover:shadow-xl hover:scale-102 cursor-pointer',
        !isPlayable && onClick && 'opacity-60 cursor-not-allowed filter grayscale-[20%]',
        className
      )}
    >
      {/* Gloss reflection layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />

      {/* Top Left Corner */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center">
        <span className={cn('font-black text-white drop-shadow-sm', isSmall ? 'text-[9px]' : 'text-xs sm:text-sm')}>
          {cornerLabel()}
        </span>
      </div>

      {/* Center Oval Emblem */}
      <div className="absolute inset-x-2 inset-y-3 sm:inset-x-3 sm:inset-y-4 rounded-[40%] bg-black/25 backdrop-blur-[1px] border border-white/20 flex items-center justify-center transform -rotate-12">
        <div className="transform rotate-12 flex items-center justify-center">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center transform rotate-180">
        <span className={cn('font-black text-white drop-shadow-sm', isSmall ? 'text-[9px]' : 'text-xs sm:text-sm')}>
          {cornerLabel()}
        </span>
      </div>
    </button>
  );
};
