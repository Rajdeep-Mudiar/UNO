'use client';

import React, { useState } from 'react';

interface MatchHistoryRecord {
  id: string;
  mode: string;
  result: 'VICTORY' | 'DEFEAT' | '2ND' | '3RD';
  score: number;
  cardsPlayed: number;
  coinsEarned: number;
  xpEarned: number;
  duration: string;
  date: string;
}

const SAMPLE_MATCH_HISTORY: MatchHistoryRecord[] = [
  {
    id: 'm-1',
    mode: 'Competitive Ranked',
    result: 'VICTORY',
    score: 185,
    cardsPlayed: 14,
    coinsEarned: 150,
    xpEarned: 220,
    duration: '4m 12s',
    date: '10 mins ago',
  },
  {
    id: 'm-2',
    mode: 'Casual 4-Player',
    result: 'VICTORY',
    score: 240,
    cardsPlayed: 18,
    coinsEarned: 90,
    xpEarned: 140,
    duration: '6m 45s',
    date: '2 hours ago',
  },
  {
    id: 'm-3',
    mode: 'Blitz Tournament',
    result: '2ND',
    score: 95,
    cardsPlayed: 12,
    coinsEarned: 40,
    xpEarned: 80,
    duration: '3m 10s',
    date: 'Yesterday',
  },
  {
    id: 'm-4',
    mode: 'Chaos 7-0 Custom',
    result: 'VICTORY',
    score: 310,
    cardsPlayed: 24,
    coinsEarned: 120,
    xpEarned: 180,
    duration: '8m 20s',
    date: '2 days ago',
  },
];

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewardCoins: number;
}

const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-1',
    title: 'Wild Draw Four Specialist',
    description: 'Play 50 Wild Draw Four cards in ranked or tournament matches.',
    icon: '🌈',
    progress: 50,
    maxProgress: 50,
    unlocked: true,
    rewardCoins: 500,
  },
  {
    id: 'ach-2',
    title: 'Bluff Buster',
    description: 'Successfully challenge an opponent bluffing on a Wild Draw Four 10 times.',
    icon: '🕵️',
    progress: 10,
    maxProgress: 10,
    unlocked: true,
    rewardCoins: 300,
  },
  {
    id: 'ach-3',
    title: 'Lightning Reaction Jump-In',
    description: 'Jump-in out of turn 25 times.',
    icon: '⚡',
    progress: 18,
    maxProgress: 25,
    unlocked: false,
    rewardCoins: 400,
  },
  {
    id: 'ach-4',
    title: 'Grandmaster Ascent',
    description: 'Reach Grandmaster ranked tier (2,200+ MMR).',
    icon: '👑',
    progress: 1850,
    maxProgress: 2200,
    unlocked: false,
    rewardCoins: 1500,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'STATS' | 'HISTORY' | 'ACHIEVEMENTS'>('STATS');

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Profile Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-blue-600 p-1 shadow-2xl">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl">
                🎮
              </div>
            </div>

            {/* User Meta */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white">Player 1</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black">
                  Lv. 24
                </span>
              </div>
              <p className="text-xs font-semibold text-purple-400">Grand Tactician • [ROYAL] The Wild Kings</p>
              
              {/* XP Progress Bar */}
              <div className="pt-2 w-48 sm:w-64 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>XP: 7,420 / 10,000</span>
                  <span className="text-emerald-400">74%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[74%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Rank & Wallet Box */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rank Tier</span>
              <span className="text-base font-black text-cyan-400 flex items-center justify-center gap-1 mt-0.5">
                💎 Diamond (1,850)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Treasury</span>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-black">
                <span className="text-amber-400">🪙 1,450</span>
                <span className="text-slate-600">|</span>
                <span className="text-purple-400">💎 35</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'STATS', label: '📊 Career Stats' },
          { id: 'HISTORY', label: '📜 Match History' },
          { id: 'ACHIEVEMENTS', label: '🏆 Achievements' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Career Stats */}
      {activeTab === 'STATS' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Total Matches</span>
            <span className="text-2xl font-black text-white block">170</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Victories</span>
            <span className="text-2xl font-black text-emerald-400 block">128</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Win Rate</span>
            <span className="text-2xl font-black text-cyan-400 block">75.3%</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Best Win Streak</span>
            <span className="text-2xl font-black text-amber-400 block">🔥 14</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Cards Played</span>
            <span className="text-2xl font-black text-purple-400 block">1,480</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Wild Cards Played</span>
            <span className="text-2xl font-black text-pink-400 block">210</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">UNO Calls Called</span>
            <span className="text-2xl font-black text-amber-300 block">95</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Opponent Catches</span>
            <span className="text-2xl font-black text-rose-400 block">38</span>
          </div>
        </div>
      )}

      {/* Tab 2: Match History */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {SAMPLE_MATCH_HISTORY.map((match) => (
            <div
              key={match.id}
              className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${
                    match.result === 'VICTORY'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {match.result === 'VICTORY' ? 'WIN' : match.result}
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{match.mode}</h4>
                  <p className="text-xs text-slate-400">
                    {match.date} • Duration: {match.duration} • Cards Played: {match.cardsPlayed}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-amber-400">+🪙 {match.coinsEarned}</span>
                <span className="text-purple-400">+⭐ {match.xpEarned} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Achievements */}
      {activeTab === 'ACHIEVEMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{ach.title}</h4>
                    <p className="text-xs text-slate-400">{ach.description}</p>
                  </div>
                </div>

                <span className="text-xs font-black text-amber-400 shrink-0">
                  +🪙 {ach.rewardCoins}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>
                    Progress: {ach.progress} / {ach.maxProgress}
                  </span>
                  <span className={ach.unlocked ? 'text-emerald-400' : 'text-slate-500'}>
                    {ach.unlocked ? 'Unlocked ✓' : 'In Progress'}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full ${
                      ach.unlocked ? 'bg-emerald-500' : 'bg-purple-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
