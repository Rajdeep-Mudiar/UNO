'use client';

import React from 'react';
import { CardColor } from '@/game-engine/types';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: CardColor) => void;
}

const COLORS: { color: CardColor; label: string; bg: string; border: string; glow: string }[] = [
  {
    color: 'RED',
    label: 'Red',
    bg: 'bg-red-600 hover:bg-red-500',
    border: 'border-red-400',
    glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]',
  },
  {
    color: 'BLUE',
    label: 'Blue',
    bg: 'bg-blue-600 hover:bg-blue-500',
    border: 'border-blue-400',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]',
  },
  {
    color: 'GREEN',
    label: 'Green',
    bg: 'bg-emerald-600 hover:bg-emerald-500',
    border: 'border-emerald-400',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]',
  },
  {
    color: 'YELLOW',
    label: 'Yellow',
    bg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
    border: 'border-amber-300',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.8)]',
  },
];

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onSelectColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6 text-center border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WILD CARD PLAYED</span>
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-wide mb-6">
          Choose Next Active Color
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {COLORS.map(({ color, label, bg, border, glow }) => (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              className={cn(
                'h-24 rounded-2xl border-2 font-black text-lg tracking-wider uppercase transition-all duration-200 flex items-center justify-center text-white shadow-lg active:scale-95',
                bg,
                border,
                glow
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
