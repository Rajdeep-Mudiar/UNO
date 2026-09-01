'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Trophy, 
  Plus, 
  Coins, 
  Gem, 
  ArrowLeft, 
  Play, 
  Trash2,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  creatorName: string;
  matches: BracketMatch[];
  registeredPlayers: Array<{ id: string; name: string; avatar: string }>;
  champion?: { name: string; avatar: string };
}

const STORAGE_KEY = 'uno_tournaments';

export default function TournamentsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<TournamentItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'REGISTRATION' | 'MY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for Tournament Creation
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formFormat, setFormFormat] = useState<'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'SWISS'>('SINGLE_ELIMINATION');
  const [formTier, setFormTier] = useState<'OPEN' | 'PRO' | 'CHAMPION' | 'BLITZ'>('OPEN');
  const [formMaxPlayers, setFormMaxPlayers] = useState(8);
  const [formPrizeCoins, setFormPrizeCoins] = useState(5000);
  const [formPrizeGems, setFormPrizeGems] = useState(50);
  const [formEntryFee, setFormEntryFee] = useState(100);
  const [formRulesSummary, setFormRulesSummary] = useState('+2/+4 Stack, 15s Turn Timer, Jump-In Enabled');

  // Load tournaments from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setTournaments(JSON.parse(saved));
        } catch {
          setTournaments([]);
        }
      } else {
        setTournaments([]);
      }
    }
  }, []);

  // Save tournaments to localStorage
  const saveTournaments = (updated: TournamentItem[]) => {
    setTournaments(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const getPlayerIdentity = () => {
    return {
      id: session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_id') || 'player_1' : 'player_1'),
      name: session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_name') || 'You' : 'You'),
      avatar: session?.user?.image || '👑',
    };
  };

  // Generate initial bracket matches based on player count
  const generateBracketMatches = (maxPlayers: number, hostPlayer: { name: string; avatar: string }): BracketMatch[] => {
    const matches: BracketMatch[] = [];
    const numRounds = Math.log2(maxPlayers);
    let matchCounter = 1;

    // Round 1 (e.g. 4 matches for 8 players)
    const round1Count = maxPlayers / 2;
    for (let i = 0; i < round1Count; i++) {
      matches.push({
        id: `m_${matchCounter++}`,
        round: 1,
        matchIndex: i,
        player1: i === 0 ? { name: hostPlayer.name, avatar: hostPlayer.avatar, score: 0 } : { name: `Player ${i * 2 + 1}`, avatar: '👤', score: 0 },
        player2: { name: `Player ${i * 2 + 2}`, avatar: '👤', score: 0 },
        status: i === 0 ? 'LIVE' : 'UPCOMING',
      });
    }

    // Subsequent Rounds (Semifinals, Finals)
    for (let r = 2; r <= numRounds; r++) {
      const roundCount = maxPlayers / Math.pow(2, r);
      for (let i = 0; i < roundCount; i++) {
        matches.push({
          id: `m_${matchCounter++}`,
          round: r,
          matchIndex: i,
          player1: { name: 'TBD', avatar: '⏳', score: 0 },
          player2: { name: 'TBD', avatar: '⏳', score: 0 },
          status: 'UPCOMING',
        });
      }
    }

    return matches;
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const host = getPlayerIdentity();

    const newTournament: TournamentItem = {
      id: `tourn_${Date.now()}`,
      title: formTitle || 'Custom Championship',
      subtitle: formSubtitle || `${formMaxPlayers}-Player showdown for glory and coin rewards.`,
      format: formFormat,
      formatLabel: `${formFormat.replace('_', ' ')} (${formMaxPlayers}P)`,
      status: 'REGISTRATION',
      prizeCoins: Number(formPrizeCoins),
      prizeGems: Number(formPrizeGems),
      entryFeeCoins: Number(formEntryFee),
      registeredCount: 1,
      maxPlayers: Number(formMaxPlayers),
      startsAt: 'Registration Open',
      tier: formTier,
      rulesSummary: formRulesSummary,
      creatorName: host.name,
      registeredPlayers: [host],
      matches: generateBracketMatches(Number(formMaxPlayers), host),
    };

    const updated = [newTournament, ...tournaments];
    saveTournaments(updated);
    setShowCreateModal(false);
    setSelectedTournament(newTournament);

    // Reset Form
    setFormTitle('');
    setFormSubtitle('');
  };

  const handleRegister = (tournamentId: string) => {
    const player = getPlayerIdentity();
    const updated = tournaments.map((t) => {
      if (t.id === tournamentId) {
        if (t.registeredPlayers.some((p) => p.id === player.id || p.name === player.name)) {
          return t;
        }
        const newRegistered = [...t.registeredPlayers, player];
        const isFull = newRegistered.length >= t.maxPlayers;
        return {
          ...t,
          registeredPlayers: newRegistered,
          registeredCount: newRegistered.length,
          status: (isFull ? 'LIVE' : t.status) as TournamentItem['status'],
          startsAt: isFull ? 'In Progress • Round 1' : t.startsAt,
        };
      }
      return t;
    });

    saveTournaments(updated);
    const updatedTarget = updated.find((t) => t.id === tournamentId);
    if (updatedTarget) setSelectedTournament(updatedTarget);
  };

  const handleDeleteTournament = (id: string) => {
    const updated = tournaments.filter((t) => t.id !== id);
    saveTournaments(updated);
    if (selectedTournament?.id === id) {
      setSelectedTournament(null);
    }
  };

  const handleLaunchMatch = (tournament: TournamentItem) => {
    router.push(`/rooms?mode=tournament&tournId=${tournament.id}`);
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (activeFilter === 'LIVE') return t.status === 'LIVE';
    if (activeFilter === 'REGISTRATION') return t.status === 'REGISTRATION';
    if (activeFilter === 'MY') {
      const myName = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_name') : '');
      return t.creatorName === myName || t.registeredPlayers.some((p) => p.name === myName);
    }
    if (searchQuery.trim()) {
      return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.rulesSummary.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getRoundsList = (matches: BracketMatch[]) => {
    const rounds: Record<number, BracketMatch[]> = {};
    matches.forEach((m) => {
      if (!rounds[m.round]) rounds[m.round] = [];
      rounds[m.round]!.push(m);
    });
    return Object.entries(rounds).sort(([a], [b]) => Number(a) - Number(b));
  };

  const getRoundName = (roundNum: number, totalRounds: number) => {
    if (roundNum === totalRounds) return 'FINALS';
    if (roundNum === totalRounds - 1) return 'SEMIFINALS';
    if (roundNum === totalRounds - 2) return 'QUARTERFINALS';
    return `ROUND ${roundNum}`;
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>COMPETITIVE BRACKET TOURNAMENTS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            TOURNAMENT ARENA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Host custom bracket tournaments, compete for seasonal glory, coin prizes, and climb the championship leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Tournament
          </button>
        </div>
      </div>

      {/* If a Tournament is Selected -> Display Live Bracket View */}
      {selectedTournament ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedTournament(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tournaments
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDeleteTournament(selectedTournament.id)}
                className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Delete Tournament"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tournament Details Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-slate-900/90 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white">{selectedTournament.title}</h2>
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                    {selectedTournament.tier}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedTournament.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    ● {selectedTournament.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedTournament.subtitle}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Prize Pool</div>
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <Coins className="w-4 h-4" />
                    <span>{selectedTournament.prizeCoins.toLocaleString()}</span>
                    {selectedTournament.prizeGems > 0 && (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Gem className="w-3.5 h-3.5" />
                        {selectedTournament.prizeGems}
                      </span>
                    )}
                  </div>
                </div>

                {selectedTournament.status === 'REGISTRATION' ? (
                  <button
                    type="button"
                    onClick={() => handleRegister(selectedTournament.id)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    Register ({selectedTournament.registeredCount}/{selectedTournament.maxPlayers})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLaunchMatch(selectedTournament)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Launch Next Match
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                Format: <strong>{selectedTournament.formatLabel}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                Rules: <strong>{selectedTournament.rulesSummary}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                Host: <strong>{selectedTournament.creatorName}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Bracket Grid */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/60 overflow-x-auto space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Tournament Elimination Bracket
            </h3>

            <div className="flex items-center justify-between min-w-[700px] gap-8 py-4">
              {getRoundsList(selectedTournament.matches).map(([roundNumStr, matches]) => {
                const roundNum = Number(roundNumStr);
                const totalRounds = Math.log2(selectedTournament.maxPlayers);
                return (
                  <div key={roundNum} className="flex-1 space-y-4">
                    <div className="text-center">
                      <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-black text-purple-400 tracking-wider">
                        {getRoundName(roundNum, totalRounds)}
                      </span>
                    </div>

                    <div className="space-y-6 flex flex-col justify-around min-h-[300px]">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className="glass-panel p-3 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2 hover:border-purple-500/40 transition-colors"
                        >
                          {/* Player 1 */}
                          <div className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                            match.player1.isWinner ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-950/60 text-slate-300'
                          }`}>
                            <div className="flex items-center gap-2 truncate">
                              <span>{match.player1.avatar}</span>
                              <span className="truncate">{match.player1.name}</span>
                            </div>
                            <span className="font-mono">{match.player1.score}</span>
                          </div>

                          {/* Player 2 */}
                          <div className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                            match.player2.isWinner ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-950/60 text-slate-300'
                          }`}>
                            <div className="flex items-center gap-2 truncate">
                              <span>{match.player2.avatar}</span>
                              <span className="truncate">{match.player2.name}</span>
                            </div>
                            <span className="font-mono">{match.player2.score}</span>
                          </div>

                          <div className="text-right">
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                              match.status === 'LIVE' ? 'text-emerald-400 animate-pulse' : match.status === 'COMPLETED' ? 'text-slate-500' : 'text-slate-600'
                            }`}>
                              ● {match.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Tournaments List */}
      {!selectedTournament && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              {(['ALL', 'REGISTRATION', 'LIVE', 'MY'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === filter
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter === 'ALL' && 'All Tournaments'}
                  {filter === 'REGISTRATION' && '📝 Open Registration'}
                  {filter === 'LIVE' && '🔥 Live In Progress'}
                  {filter === 'MY' && '👑 My Tournaments'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tournaments Grid */}
          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTournaments.map((tourn) => (
                <div
                  key={tourn.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase">
                        {tourn.tier} TIER
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tourn.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {tourn.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {tourn.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{tourn.subtitle}</p>
                    </div>

                    {/* Prize & Format */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Prize Pool</span>
                        <div className="flex items-center gap-1 font-black text-amber-400">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{tourn.prizeCoins.toLocaleString()}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block">Players</span>
                        <span className="font-bold text-slate-200">
                          {tourn.registeredCount} / {tourn.maxPlayers}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block">Entry Fee</span>
                        <span className="font-bold text-slate-300">
                          {tourn.entryFeeCoins > 0 ? `${tourn.entryFeeCoins} Coins` : 'FREE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                      By {tourn.creatorName}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedTournament(tourn)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md group-hover:scale-105"
                    >
                      View Bracket →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No active tournaments right now</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Be the first to host an elimination bracket tournament and compete with your friends or club members!
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg"
              >
                + Create Tournament
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">CREATE TOURNAMENT</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-5">
              {/* Tournament Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tournament Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Midnight Championship Showdown"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Subtitle / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. 8-Player single elimination bracket for top glory"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Format & Player Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Format</label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="SINGLE_ELIMINATION">Single Elimination</option>
                    <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                    <option value="SWISS">Swiss Rounds</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Bracket Size (Players)</label>
                  <select
                    value={formMaxPlayers}
                    onChange={(e) => setFormMaxPlayers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={4}>4 Players (Semi + Finals)</option>
                    <option value={8}>8 Players (Quarter + Semi + Finals)</option>
                    <option value={16}>16 Players (Full Bracket)</option>
                    <option value={32}>32 Players (Grand Tournament)</option>
                  </select>
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tournament Tier</label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="OPEN">Open (All Ranks)</option>
                  <option value="PRO">Pro (Gold+)</option>
                  <option value="CHAMPION">Champion (Master+)</option>
                  <option value="BLITZ">Blitz (Speed 7s)</option>
                </select>
              </div>

              {/* Prizes & Entry Fee */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Prize Coins</label>
                  <input
                    type="number"
                    min={0}
                    value={formPrizeCoins}
                    onChange={(e) => setFormPrizeCoins(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Prize Gems</label>
                  <input
                    type="number"
                    min={0}
                    value={formPrizeGems}
                    onChange={(e) => setFormPrizeGems(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Entry Fee</label>
                  <input
                    type="number"
                    min={0}
                    value={formEntryFee}
                    onChange={(e) => setFormEntryFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Rules Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Rules Summary</label>
                <input
                  type="text"
                  value={formRulesSummary}
                  onChange={(e) => setFormRulesSummary(e.target.value)}
                  placeholder="e.g. +2/+4 Stack, 10s Blitz Timer, Jump-In"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  Launch Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
