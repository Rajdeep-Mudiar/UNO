'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface UnoButtonProps {
  canCallUno: boolean;
  canCatchUno: boolean;
  onCallUno: () => void;
  onCatchUno?: () => void;
  hasCalledUno?: boolean;
}

export const UnoButton: React.FC<UnoButtonProps> = ({
  canCallUno,
  canCatchUno,
  onCallUno,
  onCatchUno,
  hasCalledUno = false,
}) => {
  const isUrgent = canCallUno || canCatchUno;

  const handleClick = () => {
    if (canCallUno) {
      onCallUno();
    } else if (canCatchUno && onCatchUno) {
      onCatchUno();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={!isUrgent && !hasCalledUno}
        className={cn(
          'relative px-5 py-3 rounded-2xl font-black text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-2 select-none focus:outline-none',
          hasCalledUno
            ? 'bg-emerald-600 border-2 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-default'
            : isUrgent
            ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border-2 border-white text-white shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse scale-105 hover:scale-110 active:scale-95 cursor-pointer'
            : 'bg-slate-900 border border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
        )}
      >
        <Flame
          className={cn(
            'w-5 h-5',
            isUrgent ? 'fill-yellow-300 text-yellow-300 animate-bounce' : 'text-slate-600'
          )}
        />
        <span>{hasCalledUno ? 'UNO CALLED!' : canCatchUno ? 'CATCH UNO!' : 'CALL UNO!'}</span>
      </button>

      {isUrgent && !hasCalledUno && (
        <span className="mt-1 text-[10px] font-extrabold text-amber-400 animate-pulse tracking-wide">
          {canCatchUno ? 'OPPONENT FORGOT!' : 'TAP BEFORE PLAYING!'}
        </span>
      )}
    </div>
  );
};
