'use client';

import React from 'react';
import { PublicPlayerState } from '@/game-engine/types';
import { Bot, User, Shuffle } from 'lucide-react';

interface SevenSwapModalProps {
  isOpen: boolean;
  players: PublicPlayerState[];
  currentPlayerId: string;
  onSelectTarget: (targetPlayerId: string) => void;
}

export const SevenSwapModal: React.FC<SevenSwapModalProps> = ({
  isOpen,
  players,
  currentPlayerId,
  onSelectTarget,
}) => {
  if (!isOpen) return null;

  const opponents = players.filter((p) => p.id !== currentPlayerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300 mb-3">
          <Shuffle className="w-3.5 h-3.5" />
          <span>7-0 RULE ACTIVATED</span>
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-wide mb-2">
          Swap Hand With Opponent
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          You played a 7! Select any opponent to exchange your entire hand with theirs.
        </p>

        <div className="space-y-3">
          {opponents.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => onSelectTarget(player.id)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 hover:bg-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  {player.isBot ? (
                    <Bot className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <User className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {player.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Holds {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'}
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                Swap
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
