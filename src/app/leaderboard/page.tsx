'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Trophy, 
  Search, 
  Gamepad2, 
  Flame 
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
  isCurrentUser?: boolean;
}

const STORAGE_LEADERBOARD_KEY = 'uno_leaderboard_data';

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [activeTierFilter, setActiveTierFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LEADERBOARD_KEY);
      const userName = session?.user?.name || localStorage.getItem('uno_player_name') || 'You';
      const userAvatar = session?.user?.image || '👑';

      const currentUserEntry: LeaderboardEntry = {
        rank: 1,
        name: userName,
        avatar: userAvatar,
        tier: 'GOLD',
        rating: 1200,
        wins: Number(localStorage.getItem('uno_user_wins') || 0),
        losses: Number(localStorage.getItem('uno_user_losses') || 0),
        winRate: 100,
        winStreak: Number(localStorage.getItem('uno_user_streak') || 0),
        clanTag: localStorage.getItem('uno_my_club_tag') || undefined,
        isCurrentUser: true,
      };

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLeaderboard(parsed);
            return;
          }
        } catch {
          // fallback
        }
      }

      setLeaderboard([currentUserEntry]);
    }
  }, [session]);

  const filteredData = leaderboard.filter((p) => {
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
      case 'GOLD':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  const getRankDecoration = (rank: number) => {
    if (rank === 1) return 'text-amber-400 font-black text-lg';
    if (rank === 2) return 'text-slate-300 font-black text-lg';
    if (rank === 3) return 'text-amber-600 font-black text-lg';
    return 'text-slate-500 font-bold text-sm';
  };

  const renderAvatar = (avatar: string, name: string) => {
    if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/'))) {
      return (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    return <span>{avatar || '🎮'}</span>;
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>GLOBAL RANKED ELO SYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            GLOBAL LEADERBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track real player ratings, win streaks, and seasonal tiers across all multiplayer matches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/play/practice"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            Play Ranked Match
          </Link>
        </div>
      </div>

      {/* Search & Tier Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tier Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'PLATINUM', 'GOLD'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTierFilter(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTierFilter === tier
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tier === 'ALL' && 'All Tiers'}
              {tier === 'GRANDMASTER' && '👑 Grandmaster'}
              {tier === 'MASTER' && '💎 Master'}
              {tier === 'DIAMOND' && '💠 Diamond'}
              {tier === 'PLATINUM' && '🛡️ Platinum'}
              {tier === 'GOLD' && '⚔️ Gold'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by player or clan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Player</th>
                <th className="py-4 px-6">Tier</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6 text-center">Wins / Losses</th>
                <th className="py-4 px-6 text-center">Win Rate</th>
                <th className="py-4 px-6 text-center">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-semibold">
              {filteredData.map((player) => (
                <tr
                  key={player.rank}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    player.isCurrentUser ? 'bg-purple-950/30 border-l-4 border-l-purple-500' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className={getRankDecoration(player.rank)}>#{player.rank}</span>
                    </div>
                  </td>

                  {/* Player Name & Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                        {renderAvatar(player.avatar, player.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white hover:text-purple-300 transition-colors">
                            {player.name}
                          </span>
                          {player.isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black">
                              YOU
                            </span>
                          )}
                          {player.clanTag && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-purple-400 text-[10px] font-mono font-bold">
                              [{player.clanTag}]
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black ${getTierBadge(player.tier)}`}>
                      {player.tier}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-6">
                    <span className="font-black text-sm text-white font-mono">{player.rating}</span>
                  </td>

                  {/* Wins / Losses */}
                  <td className="py-4 px-6 text-center font-mono">
                    <span className="text-emerald-400">{player.wins}W</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-red-400">{player.losses}L</span>
                  </td>

                  {/* Win Rate */}
                  <td className="py-4 px-6 text-center font-mono text-slate-200">
                    {player.winRate.toFixed(1)}%
                  </td>

                  {/* Win Streak */}
                  <td className="py-4 px-6 text-center">
                    {player.winStreak > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {player.winStreak} streak
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
