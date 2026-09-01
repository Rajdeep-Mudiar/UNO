'use client';

import React from 'react';
import { ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

interface WildChallengeModalProps {
  isOpen: boolean;
  onDecide: (challenge: boolean) => void;
}

export const WildChallengeModal: React.FC<WildChallengeModalProps> = ({
  isOpen,
  onDecide,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-300 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>WILD DRAW FOUR CHALLENGE</span>
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-wide mb-2">
          Do You Suspect a Bluff?
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The previous player played a Wild Draw Four. If they held a matching color card in their hand, they were bluffing!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onDecide(false)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all text-white"
          >
            <CheckCircle className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="font-bold text-sm">Accept +4</span>
            <span className="text-[10px] text-slate-400">Draw 4 cards safely</span>
          </button>

          <button
            type="button"
            onClick={() => onDecide(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-600/20 border-2 border-red-500 hover:bg-red-600/30 transition-all text-white shadow-lg"
          >
            <HelpCircle className="w-6 h-6 text-red-400 mb-1" />
            <span className="font-bold text-sm">Challenge Bluff!</span>
            <span className="text-[10px] text-red-300">Bluffer draws 4 or you draw 6</span>
          </button>
        </div>
      </div>
    </div>
  );
};
