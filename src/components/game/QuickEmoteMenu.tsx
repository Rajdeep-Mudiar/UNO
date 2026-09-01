'use client';

import React, { useState } from 'react';
import { Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickEmoteMenuProps {
  onSendEmote: (emote: string) => void;
}

const EMOTES = ['😂', '🔥', '😱', '👏', '😎', 'GG', 'UNO!', 'WOW!'];

export const QuickEmoteMenu: React.FC<QuickEmoteMenuProps> = ({ onSendEmote }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (emote: string) => {
    onSendEmote(emote);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute bottom-12 right-0 z-40 p-2.5 rounded-2xl glass-panel border border-slate-700 shadow-2xl grid grid-cols-4 gap-2 animate-in fade-in zoom-in duration-150">
          {EMOTES.map((emote) => (
            <button
              key={emote}
              type="button"
              onClick={() => handleSelect(emote)}
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-base font-black text-white"
            >
              {emote}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Emotes"
        className={cn(
          'w-10 h-10 rounded-full border transition-all flex items-center justify-center text-slate-300',
          isOpen
            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:text-white'
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
      </button>
    </div>
  );
};
