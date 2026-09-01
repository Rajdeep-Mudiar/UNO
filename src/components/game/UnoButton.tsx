'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, AlertOctagon } from 'lucide-react';

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
  return (
    <div className="relative flex items-center gap-2">
      {/* 1. CALL UNO Button (for human player) */}
      <button
        type="button"
        onClick={canCallUno ? onCallUno : undefined}
        disabled={!canCallUno && !hasCalledUno}
        className={cn(
          'relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-2 select-none focus:outline-none',
          hasCalledUno
            ? 'bg-emerald-600 border-2 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-default'
            : canCallUno
            ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border-2 border-white text-white shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse scale-105 hover:scale-110 active:scale-95 cursor-pointer'
            : 'bg-slate-900 border border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
        )}
      >
        <Flame
          className={cn(
            'w-4 h-4 sm:w-5 sm:h-5',
            canCallUno ? 'fill-yellow-300 text-yellow-300 animate-bounce' : 'text-slate-600'
          )}
        />
        <span>{hasCalledUno ? 'UNO CALLED!' : 'CALL UNO!'}</span>
      </button>

      {/* 2. CATCH UNO Button (when opponent has 1 card and forgot to call UNO) */}
      {canCatchUno && onCatchUno && (
        <button
          type="button"
          onClick={onCatchUno}
          className="relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-2 select-none bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-2 border-white text-white shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-bounce scale-105 hover:scale-110 active:scale-95 cursor-pointer z-30"
        >
          <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>🚨 CATCH UNO! (+2 FINE)</span>
        </button>
      )}
    </div>
  );
};
