'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Home, Sparkles } from 'lucide-react';
import { GameScoreResult } from '@/game-engine/scoring';

interface GameOverModalProps {
  isOpen: boolean;
  scoreResult: GameScoreResult | null;
  humanPlayerId: string;
  players: { id: string; name: string; isBot: boolean }[];
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  scoreResult,
  humanPlayerId,
  players,
  onPlayAgain,
  onReturnHome,
}) => {
  useEffect(() => {
    if (isOpen && scoreResult && scoreResult.winnerId === humanPlayerId) {
      // Fire confetti burst for human victory
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      });
    }
  }, [isOpen, scoreResult, humanPlayerId]);

  if (!isOpen || !scoreResult) return null;

  const isWinner = scoreResult.winnerId === humanPlayerId;
  const winner = players.find((p) => p.id === scoreResult.winnerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.4)]">
        {/* Victory Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-xl ${
              isWinner
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
            {isWinner ? 'VICTORY!' : 'GAME OVER'}
          </h2>
          <p className="text-xs text-slate-400">
            {isWinner
              ? 'Congratulations! You dominated the match!'
              : `${winner?.name ?? 'Opponent'} took 1st place.`}
          </p>
        </div>

        {/* Rewards Breakdown Banner */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 block leading-none">XP EARNED</span>
              <span className="text-sm font-black text-purple-300">+{isWinner ? 250 : 75} XP</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 block leading-none">COINS WON</span>
              <span className="text-sm font-black text-amber-300">+{isWinner ? scoreResult.pointsAwarded * 2 : 20} 🪙</span>
            </div>
          </div>
        </div>

        {/* Placement Leaderboard */}
        <div className="space-y-2 mb-6">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block text-left">
            Final Match Standings
          </span>
          {scoreResult.playerRankings.map((rankInfo) => {
            const player = players.find((p) => p.id === rankInfo.playerId);
            const isMe = rankInfo.playerId === humanPlayerId;

            return (
              <div
                key={rankInfo.playerId}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isMe
                    ? 'bg-purple-950/40 border-purple-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      rankInfo.rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : rankInfo.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rankInfo.rank}
                  </span>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">
                      {player?.name} {isMe && '(You)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {rankInfo.handCount} {rankInfo.handCount === 1 ? 'card' : 'cards'} left
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-amber-400">
                    {rankInfo.rank === 1 ? `+${scoreResult.pointsAwarded} pts` : `${rankInfo.handPoints} pts`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnHome}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors font-bold text-xs text-slate-300 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 font-bold text-xs text-white shadow-lg hover:scale-102 transition-transform flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
