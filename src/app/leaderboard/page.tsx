'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Search, 
  Gamepad2
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  tier: 'GRANDMASTER' | 'MASTER' | 'DIAMOND' | 'PLATINUM' | 'GOLD';
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  winStreak: number;
  clanTag?: string;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'CardMaster99',
    avatar: '👑',
    tier: 'GRANDMASTER',
    rating: 2480,
    wins: 342,
    losses: 48,
    winRate: 87.7,
    winStreak: 14,
    clanTag: 'ROYAL',
  },
  {
    rank: 2,
    name: 'ViperX',
    avatar: '🐍',
    tier: 'GRANDMASTER',
    rating: 2390,
    wins: 298,
    losses: 52,
    winRate: 85.1,
    winStreak: 8,
    clanTag: 'APEX',
  },
  {
    rank: 3,
    name: 'LunaStar',
    avatar: '✨',
    tier: 'GRANDMASTER',
    rating: 2315,
    wins: 275,
    losses: 60,
    winRate: 82.1,
    winStreak: 6,
    clanTag: 'OWL',
  },
  {
    rank: 4,
    name: 'CyberSamurai',
    avatar: '⚔️',
    tier: 'MASTER',
    rating: 2180,
    wins: 240,
    losses: 71,
    winRate: 77.2,
    winStreak: 4,
    clanTag: 'DRACO',
  },
  {
    rank: 5,
    name: 'ZenMaster',
    avatar: '🧘',
    tier: 'MASTER',
    rating: 2110,
    wins: 210,
    losses: 68,
    winRate: 75.5,
    winStreak: 5,
  },
  {
    rank: 6,
    name: 'BlazeFox',
    avatar: '🦊',
    tier: 'DIAMOND',
    rating: 1980,
    wins: 185,
    losses: 72,
    winRate: 72.0,
    winStreak: 3,
    clanTag: 'APEX',
  },
  {
    rank: 7,
    name: 'Player 1 (You)',
    avatar: '🎮',
    tier: 'DIAMOND',
    rating: 1850,
    wins: 128,
    losses: 42,
    winRate: 75.3,
    winStreak: 7,
    clanTag: 'ROYAL',
  },
  {
    rank: 8,
    name: 'ShadowStrike',
    avatar: '🥷',
    tier: 'PLATINUM',
    rating: 1720,
    wins: 140,
    losses: 80,
    winRate: 63.6,
    winStreak: 2,
  },
];

export default function LeaderboardPage() {
  const [activeTierFilter, setActiveTierFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredData = LEADERBOARD_DATA.filter((p) => {
    if (activeTierFilter !== 'ALL' && p.tier !== activeTierFilter) return false;
    if (
      searchQuery &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.clanTag?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getTierBadge = (tier: LeaderboardEntry['tier']) => {
    switch (tier) {
      case 'GRANDMASTER':
        return 'bg-gradient-to-r from-red-500/20 to-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MASTER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'DIAMOND':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'PLATINUM':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>SEASON 1 RANKED LADDER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            GLOBAL LEADERBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Top card masters ranked by ELO skill rating, win percentage, and tournament glory. Season ends in 18 days.
          </p>
        </div>

        <Link
          href="/play/practice"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all self-start md:self-auto"
        >
          <Gamepad2 className="w-4 h-4 fill-current" />
          Queue Ranked Match
        </Link>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {LEADERBOARD_DATA.slice(0, 3).map((top, idx) => {
          const podiumColor =
            idx === 0
              ? 'from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/50 shadow-amber-900/20'
              : idx === 1
              ? 'from-slate-400/20 via-slate-600/10 to-transparent border-slate-400/40'
              : 'from-amber-700/20 via-amber-900/10 to-transparent border-amber-700/40';

          return (
            <div
              key={top.name}
              className={`glass-panel p-6 rounded-3xl border bg-gradient-to-b ${podiumColor} flex flex-col items-center text-center space-y-4 shadow-xl transform ${
                idx === 0 ? 'md:-translate-y-3' : ''
              }`}
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-4xl shadow-2xl">
                  {top.avatar}
                </div>
                <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                  #{idx + 1}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  {top.clanTag && (
                    <span className="text-[10px] font-mono font-bold text-amber-400">[{top.clanTag}]</span>
                  )}
                  <h3 className="text-lg font-black text-white">{top.name}</h3>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getTierBadge(top.tier)}`}>
                  {top.tier}
                </span>
              </div>

              <div className="w-full pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Rating</span>
                  <span className="text-amber-400 font-black">{top.rating} MMR</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Win Rate</span>
                  <span className="text-emerald-400 font-black">{top.winRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'PLATINUM'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTierFilter(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTierFilter === tier
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player or clan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Ranked Tier</th>
                <th className="py-3.5 px-4 text-right">Rating</th>
                <th className="py-3.5 px-4 text-right">W / L</th>
                <th className="py-3.5 px-4 text-right">Winrate</th>
                <th className="py-3.5 px-4 text-right">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.map((player) => {
                const isYou = player.name.includes('(You)');

                return (
                  <tr
                    key={player.name}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isYou ? 'bg-purple-950/30 font-bold border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-black">
                      {player.rank === 1 && '🥇'}
                      {player.rank === 2 && '🥈'}
                      {player.rank === 3 && '🥉'}
                      {player.rank > 3 && `#${player.rank}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-base">
                          {player.avatar}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {player.clanTag && (
                            <span className="font-mono text-[10px] text-amber-400 font-bold">
                              [{player.clanTag}]
                            </span>
                          )}
                          <span className="text-white font-bold">{player.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getTierBadge(
                          player.tier
                        )}`}
                      >
                        {player.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-amber-400 font-mono">
                      {player.rating}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      <span className="text-emerald-400 font-bold">{player.wins}W</span> /{' '}
                      <span className="text-red-400">{player.losses}L</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {player.winRate}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-purple-400">
                      🔥 {player.winStreak}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
