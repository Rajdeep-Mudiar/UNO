'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Plus, 
  Swords, 
  Flame, 
  Check, 
  Search, 
  Gift
} from 'lucide-react';

interface ClubItem {
  id: string;
  name: string;
  tag: string;
  emblem: string;
  description: string;
  level: number;
  xp: number;
  maxXp: number;
  membersCount: number;
  maxMembers: number;
  minRating: number;
  isPublic: boolean;
  weeklyPoints: number;
  warScore?: number;
  perks: string[];
}

const INITIAL_CLUBS: ClubItem[] = [
  {
    id: 'club-1',
    name: 'The Wild Kings',
    tag: 'ROYAL',
    emblem: '👑',
    description: 'Elite competitive clan focused on tournament brackets and weekly clan war domination.',
    level: 9,
    xp: 18400,
    maxXp: 20000,
    membersCount: 28,
    maxMembers: 30,
    minRating: 1200,
    isPublic: true,
    weeklyPoints: 48500,
    warScore: 1420,
    perks: ['+15% Coins on Win', 'Exclusive Gold Card Frame', 'Weekly Clan Chest (Tier 5)'],
  },
  {
    id: 'club-2',
    name: 'Apex Stacking Guild',
    tag: 'APEX',
    emblem: '⚡',
    description: 'Masters of +2/+4 chaining and lightning reaction jump-ins. Active daily voice rooms.',
    level: 8,
    xp: 14200,
    maxXp: 18000,
    membersCount: 26,
    maxMembers: 30,
    minRating: 1000,
    isPublic: true,
    weeklyPoints: 41200,
    warScore: 1380,
    perks: ['+10% Coins on Win', 'Apex Guild Banner', 'Tier 4 Clan Chest'],
  },
  {
    id: 'club-3',
    name: 'Night Owls Syndicate',
    tag: 'OWL',
    emblem: '🦉',
    description: 'Midnight grinders and casual party rooms. Friendly vibes, zero toxicity.',
    level: 6,
    xp: 9100,
    maxXp: 12000,
    membersCount: 19,
    maxMembers: 30,
    minRating: 0,
    isPublic: true,
    weeklyPoints: 23100,
    perks: ['+5% XP Boost', 'Night Owl Emote Pack'],
  },
  {
    id: 'club-4',
    name: 'Dragon Clan Esports',
    tag: 'DRACO',
    emblem: '🐉',
    description: 'Ranked tryhards and ladder pushers. Must be Platinum tier or higher.',
    level: 10,
    xp: 25000,
    maxXp: 25000,
    membersCount: 30,
    maxMembers: 30,
    minRating: 1400,
    isPublic: false,
    weeklyPoints: 62000,
    perks: ['+20% Coins on Win', 'Dragon Flame Card Skin', 'Tier 5 Max Clan Chest'],
  },
];

export default function ClubsPage() {
  const [clubs, setClubs] = useState<ClubItem[]>(INITIAL_CLUBS);
  const [myClubId, setMyClubId] = useState<string | null>('club-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formEmblem, setFormEmblem] = useState('👑');
  const [formDescription, setFormDescription] = useState('');
  const [formMinRating, setFormMinRating] = useState(0);

  const myClub = clubs.find((c) => c.id === myClubId);

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    const newClub: ClubItem = {
      id: `club-${Date.now()}`,
      name: formName || 'New Guild',
      tag: formTag.toUpperCase() || 'GUILD',
      emblem: formEmblem,
      description: formDescription || 'A welcoming clan for passionate card arena players.',
      level: 1,
      xp: 0,
      maxXp: 2500,
      membersCount: 1,
      maxMembers: 30,
      minRating: formMinRating,
      isPublic: true,
      weeklyPoints: 500,
      perks: ['+5% Coins on Win', 'Club Chat Access'],
    };

    setClubs([newClub, ...clubs]);
    setMyClubId(newClub.id);
    setShowCreateModal(false);
  };

  const handleJoinClub = (clubId: string) => {
    setMyClubId(clubId);
  };

  const handleLeaveClub = () => {
    setMyClubId(null);
  };

  const filteredClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-300 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>CLAN GUILDS & SYNDICATES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            CLUBS & CLAN WARS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Join or form a club with friends, level up together for coin multipliers, and compete in weekend Clan Wars.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 via-purple-600 to-blue-600 hover:from-red-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Form a Club
        </button>
      </div>

      {/* Active Club Dashboard (If User in a Club) */}
      {myClub && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/30 bg-slate-900/90 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-purple-600/20 border border-red-500/40 flex items-center justify-center text-3xl shadow-inner">
                {myClub.emblem}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40">
                    [{myClub.tag}]
                  </span>
                  <h2 className="text-2xl font-black text-white">{myClub.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                    Lv. {myClub.level}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">{myClub.description}</p>
                <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                  <span>
                    Members: <strong className="text-white">{myClub.membersCount}/{myClub.maxMembers}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Weekly XP: <strong className="text-amber-400">{myClub.weeklyPoints.toLocaleString()}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Your Role: <strong className="text-purple-400">Officer</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLeaveClub}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-bold transition-all self-start lg:self-auto"
            >
              Leave Club
            </button>
          </div>

          {/* Clan War Scoreboard & Perks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live War Matchup */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500 animate-bounce" />
                  Active Clan War — Round 3
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Ends in 14h 22m</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-center">
                  <span className="text-xs font-black text-white">[{myClub.tag}] {myClub.name}</span>
                  <span className="text-2xl font-black text-amber-400 block mt-1">1,420 pts</span>
                </div>
                <span className="text-xs font-black text-slate-600 uppercase">VS</span>
                <div className="text-center">
                  <span className="text-xs font-black text-slate-300">[APEX] Stacking Guild</span>
                  <span className="text-2xl font-black text-slate-400 block mt-1">1,380 pts</span>
                </div>
              </div>

              <Link
                href="/play/practice"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all"
              >
                <Swords className="w-4 h-4" />
                Play Clan War Match (+50 XP)
              </Link>
            </div>

            {/* Active Club Perks */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                Unlocked Clan Perks
              </span>

              <div className="space-y-2">
                {myClub.perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-semibold text-slate-200"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Club Directory & Search */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            Browse Guilds & Syndicates
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search club name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredClubs.map((club) => {
            const isMyClub = club.id === myClubId;

            return (
              <div
                key={club.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-red-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                        {club.emblem}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-red-300 border border-slate-700">
                            [{club.tag}]
                          </span>
                          <h3 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
                            {club.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Level {club.level} • {club.membersCount}/{club.maxMembers} Members
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-black">
                      {club.weeklyPoints.toLocaleString()} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{club.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Req: {club.minRating > 0 ? `${club.minRating} ELO` : 'Open to All'}
                  </span>

                  {isMyClub ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      Your Club ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoinClub(club.id)}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white text-xs font-bold transition-all shadow"
                    >
                      Join Guild
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-red-500/40 bg-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">FOUND A NEW GUILD</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Guild Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Phoenix Vanguard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Clan Tag (2-5 chars)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value.toUpperCase())}
                    placeholder="e.g. VANG"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Emblem Icon</label>
                  <select
                    value={formEmblem}
                    onChange={(e) => setFormEmblem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="👑">👑 Royal Crown</option>
                    <option value="🦁">🦁 Lionheart</option>
                    <option value="⚡">⚡ Lightning Bolt</option>
                    <option value="🐉">🐉 Dragon</option>
                    <option value="💎">💎 Diamond</option>
                    <option value="⚔️">⚔️ Crossed Swords</option>
                    <option value="🛡️">🛡️ Aegis Shield</option>
                    <option value="🦅">🦅 Sky Eagle</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description & Motto</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tell players about your guild goals, clan wars schedule, or play style..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Minimum Rating Required</label>
                <select
                  value={formMinRating}
                  onChange={(e) => setFormMinRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value={0}>Open to All (0 ELO)</option>
                  <option value={1000}>Silver Tier+ (1000 ELO)</option>
                  <option value={1200}>Gold Tier+ (1200 ELO)</option>
                  <option value={1400}>Platinum Tier+ (1400 ELO)</option>
                </select>
              </div>

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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/50 transition-all"
                >
                  Found Club (Free)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
