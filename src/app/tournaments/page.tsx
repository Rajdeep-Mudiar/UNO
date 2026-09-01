'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Swords, 
  Medal
} from 'lucide-react';

interface BracketMatch {
  id: string;
  round: number;
  matchIndex: number;
  player1: { name: string; avatar: string; score: number; isWinner?: boolean };
  player2: { name: string; avatar: string; score: number; isWinner?: boolean };
  status: 'COMPLETED' | 'LIVE' | 'UPCOMING';
}

interface TournamentItem {
  id: string;
  title: string;
  subtitle: string;
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'SWISS';
  formatLabel: string;
  status: 'REGISTRATION' | 'LIVE' | 'UPCOMING' | 'FINISHED';
  prizeCoins: number;
  prizeGems: number;
  entryFeeCoins: number;
  registeredCount: number;
  maxPlayers: number;
  startsAt: string;
  tier: 'PRO' | 'CHAMPION' | 'OPEN' | 'BLITZ';
  rulesSummary: string;
  matches: BracketMatch[];
  champion?: { name: string; avatar: string };
}

const SAMPLE_TOURNAMENTS: TournamentItem[] = [
  {
    id: 'tourn-1',
    title: 'Season 1 Grand Championship',
    subtitle: '16-Player Single Elimination showdown for the seasonal crown & exclusive Golden Crown Frame.',
    format: 'SINGLE_ELIMINATION',
    formatLabel: 'Single Elimination (16P)',
    status: 'LIVE',
    prizeCoins: 25000,
    prizeGems: 150,
    entryFeeCoins: 500,
    registeredCount: 16,
    maxPlayers: 16,
    startsAt: 'In Progress • Finals Round',
    tier: 'CHAMPION',
    rulesSummary: '+2/+4 Stack, 10s Blitz Timer, Jump-In Disabled',
    champion: { name: 'CardMaster99', avatar: '👑' },
    matches: [
      // Quarterfinals
      {
        id: 'q1',
        round: 1,
        matchIndex: 0,
        player1: { name: 'CardMaster99', avatar: '👑', score: 2, isWinner: true },
        player2: { name: 'ShadowStrike', avatar: '🥷', score: 0 },
        status: 'COMPLETED',
      },
      {
        id: 'q2',
        round: 1,
        matchIndex: 1,
        player1: { name: 'ViperX', avatar: '🐍', score: 2, isWinner: true },
        player2: { name: 'CyberSamurai', avatar: '⚔️', score: 1 },
        status: 'COMPLETED',
      },
      {
        id: 'q3',
        round: 1,
        matchIndex: 2,
        player1: { name: 'LunaStar', avatar: '✨', score: 2, isWinner: true },
        player2: { name: 'BlazeFox', avatar: '🦊', score: 1 },
        status: 'COMPLETED',
      },
      {
        id: 'q4',
        round: 1,
        matchIndex: 3,
        player1: { name: 'IronClad', avatar: '🛡️', score: 0 },
        player2: { name: 'ZenMaster', avatar: '🧘', score: 2, isWinner: true },
        status: 'COMPLETED',
      },
      // Semifinals
      {
        id: 's1',
        round: 2,
        matchIndex: 0,
        player1: { name: 'CardMaster99', avatar: '👑', score: 2, isWinner: true },
        player2: { name: 'ViperX', avatar: '🐍', score: 1 },
        status: 'COMPLETED',
      },
      {
        id: 's2',
        round: 2,
        matchIndex: 1,
        player1: { name: 'LunaStar', avatar: '✨', score: 1 },
        player2: { name: 'ZenMaster', avatar: '🧘', score: 2, isWinner: true },
        status: 'COMPLETED',
      },
      // Grand Finals
      {
        id: 'f1',
        round: 3,
        matchIndex: 0,
        player1: { name: 'CardMaster99', avatar: '👑', score: 3, isWinner: true },
        player2: { name: 'ZenMaster', avatar: '🧘', score: 2 },
        status: 'COMPLETED',
      },
    ],
  },
  {
    id: 'tourn-2',
    title: 'Midnight Blitz Cup #42',
    subtitle: 'Rapid 7-second turn timers with +2/+4 stacking enabled. Fast paced, zero hesitation.',
    format: 'SINGLE_ELIMINATION',
    formatLabel: 'Single Elimination (8P)',
    status: 'REGISTRATION',
    prizeCoins: 10000,
    prizeGems: 50,
    entryFeeCoins: 100,
    registeredCount: 6,
    maxPlayers: 8,
    startsAt: 'Starts in 18 minutes',
    tier: 'BLITZ',
    rulesSummary: '+2/+4 Stack, 7s Ultra Blitz, Bluff Challenge Allowed',
    matches: [
      {
        id: 'b-q1',
        round: 1,
        matchIndex: 0,
        player1: { name: 'Player 1 (You)', avatar: '🎮', score: 0 },
        player2: { name: 'SpeedDemon', avatar: '⚡', score: 0 },
        status: 'UPCOMING',
      },
      {
        id: 'b-q2',
        round: 1,
        matchIndex: 1,
        player1: { name: 'NeonRider', avatar: '🏍️', score: 0 },
        player2: { name: 'PixelKing', avatar: '👾', score: 0 },
        status: 'UPCOMING',
      },
      {
        id: 'b-s1',
        round: 2,
        matchIndex: 0,
        player1: { name: 'TBD', avatar: '❓', score: 0 },
        player2: { name: 'TBD', avatar: '❓', score: 0 },
        status: 'UPCOMING',
      },
    ],
  },
  {
    id: 'tourn-3',
    title: 'Sunday Swiss Open — Community Brawl',
    subtitle: 'Everyone plays 5 rounds regardless of wins. Accumulate match points for tiered reward crates.',
    format: 'SWISS',
    formatLabel: 'Swiss System (32P)',
    status: 'UPCOMING',
    prizeCoins: 15000,
    prizeGems: 75,
    entryFeeCoins: 0,
    registeredCount: 22,
    maxPlayers: 32,
    startsAt: 'Sunday at 18:00 UTC',
    tier: 'OPEN',
    rulesSummary: 'Standard Rules, 15s Timer, 5 Guaranteed Rounds',
    matches: [],
  },
];

export default function TournamentsPage() {
  const [tournaments] = useState<TournamentItem[]>(SAMPLE_TOURNAMENTS);
  const [selectedTournament, setSelectedTournament] = useState<TournamentItem>(SAMPLE_TOURNAMENTS[0]!);
  const [filterTab, setFilterTab] = useState<'ALL' | 'LIVE' | 'REGISTRATION' | 'UPCOMING'>('ALL');
  const [registeredIds, setRegisteredIds] = useState<Record<string, boolean>>({ 'tourn-2': true });

  const handleToggleRegister = (tournId: string) => {
    setRegisteredIds((prev) => {
      const newState = !prev[tournId];
      return { ...prev, [tournId]: newState };
    });
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (filterTab === 'LIVE') return t.status === 'LIVE';
    if (filterTab === 'REGISTRATION') return t.status === 'REGISTRATION';
    if (filterTab === 'UPCOMING') return t.status === 'UPCOMING';
    return true;
  });

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>OFFICIAL BRACKET SYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            LIVE TOURNAMENTS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compete in Single Elimination and Swiss tournaments for coins, gems, exclusive card titles, and seasonal leaderboard ranking.
          </p>
        </div>

        {/* User Stats Card */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Medal className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400">Tournament Rating</span>
            <span className="text-sm font-black text-white">1,340 ELO</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400">Cups Won</span>
            <span className="text-sm font-black text-amber-400">🏆 3</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {(['ALL', 'LIVE', 'REGISTRATION', 'UPCOMING'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === tab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab === 'ALL' && 'All Tournaments'}
            {tab === 'LIVE' && '🔴 Live In Progress'}
            {tab === 'REGISTRATION' && '📝 Open Registration'}
            {tab === 'UPCOMING' && '⏰ Upcoming Cups'}
          </button>
        ))}
      </div>

      {/* Featured Bracket Inspector (if selected) */}
      {selectedTournament && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-slate-900/90 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                  {selectedTournament.tier}
                </span>
                <span className="text-xs font-semibold text-purple-400">{selectedTournament.formatLabel}</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-semibold text-emerald-400">{selectedTournament.startsAt}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedTournament.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">{selectedTournament.subtitle}</p>
            </div>

            {/* Prize Pool Box */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coins Prize</span>
                <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                  🪙 {selectedTournament.prizeCoins.toLocaleString()}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gems Pool</span>
                <span className="text-lg font-black text-purple-400 flex items-center justify-center gap-1">
                  💎 {selectedTournament.prizeGems}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <button
                type="button"
                onClick={() => handleToggleRegister(selectedTournament.id)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                  registeredIds[selectedTournament.id]
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 hover:scale-105'
                }`}
              >
                {registeredIds[selectedTournament.id] ? '✓ Registered' : 'Register Now'}
              </button>
            </div>
          </div>

          {/* Interactive Bracket Visual Tree */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" />
                Live Bracket Tree Progression
              </h3>
              {selectedTournament.champion && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 animate-pulse">
                  <span>🏆 Champion:</span>
                  <span className="text-white font-black">{selectedTournament.champion.name}</span>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 overflow-x-auto">
              <div className="min-w-[700px] grid grid-cols-3 gap-6 items-center">
                {/* Round 1: Quarterfinals */}
                <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block text-center mb-2">
                    Round 1 — Quarterfinals
                  </span>
                  {selectedTournament.matches
                    .filter((m) => m.round === 1)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 shadow hover:border-slate-700 transition-colors"
                      >
                        <div
                          className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg ${
                            m.player1.isWinner ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{m.player1.avatar}</span>
                            <span>{m.player1.name}</span>
                          </span>
                          <span className="font-mono font-black">{m.player1.score}</span>
                        </div>
                        <div
                          className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg ${
                            m.player2.isWinner ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{m.player2.avatar}</span>
                            <span>{m.player2.name}</span>
                          </span>
                          <span className="font-mono font-black">{m.player2.score}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Round 2: Semifinals */}
                <div className="space-y-8">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block text-center mb-2">
                    Round 2 — Semifinals
                  </span>
                  {selectedTournament.matches
                    .filter((m) => m.round === 2)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 space-y-1 shadow hover:border-purple-500/50 transition-colors"
                      >
                        <div
                          className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg ${
                            m.player1.isWinner ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{m.player1.avatar}</span>
                            <span>{m.player1.name}</span>
                          </span>
                          <span className="font-mono font-black">{m.player1.score}</span>
                        </div>
                        <div
                          className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg ${
                            m.player2.isWinner ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{m.player2.avatar}</span>
                            <span>{m.player2.name}</span>
                          </span>
                          <span className="font-mono font-black">{m.player2.score}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Round 3: Grand Finals */}
                <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block text-center mb-2">
                    🏆 Grand Finals
                  </span>
                  {selectedTournament.matches
                    .filter((m) => m.round === 3)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/50 space-y-2 shadow-xl"
                      >
                        <div
                          className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-lg ${
                            m.player1.isWinner ? 'bg-amber-500/20 font-black text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span>{m.player1.avatar}</span>
                            <span>{m.player1.name}</span>
                          </span>
                          <span className="font-mono font-black">{m.player1.score}</span>
                        </div>
                        <div
                          className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-lg ${
                            m.player2.isWinner ? 'bg-amber-500/20 font-black text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span>{m.player2.avatar}</span>
                            <span>{m.player2.name}</span>
                          </span>
                          <span className="font-mono font-black">{m.player2.score}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tournaments Directory Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">
          Active & Upcoming Tournaments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tourn) => {
            const isSelected = selectedTournament?.id === tourn.id;
            const isUserRegistered = registeredIds[tourn.id];

            return (
              <div
                key={tourn.id}
                onClick={() => setSelectedTournament(tourn)}
                className={`glass-panel p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'border-amber-500/60 bg-slate-900/90 shadow-lg shadow-amber-950/30'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-black">
                      {tourn.formatLabel}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        tourn.status === 'LIVE'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                          : tourn.status === 'REGISTRATION'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {tourn.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {tourn.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{tourn.subtitle}</p>

                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 font-bold border border-slate-800">
                      🪙 {tourn.prizeCoins.toLocaleString()}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-purple-400 font-bold border border-slate-800">
                      💎 {tourn.prizeGems}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 font-semibold border border-slate-800">
                      👥 {tourn.registeredCount}/{tourn.maxPlayers}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold">{tourn.startsAt}</span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRegister(tourn.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isUserRegistered
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-200'
                    }`}
                  >
                    {isUserRegistered ? 'Registered ✓' : 'Join Cup'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
