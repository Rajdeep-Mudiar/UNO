'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Search, 
  Gift, 
  Users, 
  Crown,
  Trash2 
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

const STORAGE_CLUBS_KEY = 'uno_clubs';
const STORAGE_MY_CLUB_KEY = 'uno_my_club_id';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [myClubId, setMyClubId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formEmblem, setFormEmblem] = useState('👑');
  const [formDescription, setFormDescription] = useState('');
  const [formMinRating] = useState(0);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedClubs = localStorage.getItem(STORAGE_CLUBS_KEY);
      if (savedClubs) {
        try {
          setClubs(JSON.parse(savedClubs));
        } catch {
          setClubs([]);
        }
      }
      const savedMyClub = localStorage.getItem(STORAGE_MY_CLUB_KEY);
      if (savedMyClub) {
        setMyClubId(savedMyClub);
      }
    }
  }, []);

  const saveClubs = (updatedClubs: ClubItem[], updatedMyClubId?: string | null) => {
    setClubs(updatedClubs);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CLUBS_KEY, JSON.stringify(updatedClubs));
      if (updatedMyClubId !== undefined) {
        if (updatedMyClubId) {
          localStorage.setItem(STORAGE_MY_CLUB_KEY, updatedMyClubId);
        } else {
          localStorage.removeItem(STORAGE_MY_CLUB_KEY);
        }
      }
    }
  };

  const myClub = clubs.find((c) => c.id === myClubId);

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    const newClub: ClubItem = {
      id: `club-${Date.now()}`,
      name: formName || 'New Guild',
      tag: formTag.toUpperCase() || 'GUILD',
      emblem: formEmblem,
      description: formDescription || 'A competitive clan for passionate card arena players.',
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

    const updated = [newClub, ...clubs];
    saveClubs(updated, newClub.id);
    setMyClubId(newClub.id);
    setShowCreateModal(false);

    // Reset Form
    setFormName('');
    setFormTag('');
    setFormDescription('');
  };

  const handleJoinClub = (clubId: string) => {
    const updated = clubs.map((c) => {
      if (c.id === clubId && c.membersCount < c.maxMembers) {
        return { ...c, membersCount: c.membersCount + 1 };
      }
      return c;
    });
    saveClubs(updated, clubId);
    setMyClubId(clubId);
  };

  const handleLeaveClub = () => {
    if (!myClubId) return;
    const updated = clubs.map((c) => {
      if (c.id === myClubId) {
        return { ...c, membersCount: Math.max(1, c.membersCount - 1) };
      }
      return c;
    });
    saveClubs(updated, null);
    setMyClubId(null);
  };

  const handleDeleteClub = (clubId: string) => {
    const updated = clubs.filter((c) => c.id !== clubId);
    const newMyClubId = myClubId === clubId ? null : myClubId;
    saveClubs(updated, newMyClubId);
    if (myClubId === clubId) {
      setMyClubId(null);
    }
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 mb-2">
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            <span>CLAN LEAGUES & CLUBS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            CLUBS & CLANS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Found a club with friends, earn weekly clan chests, and compete in Clan Wars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Club
          </button>
        </div>
      </div>

      {/* Active Club Dashboard (If User is in a Club) */}
      {myClub && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-slate-900/90 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 border border-purple-400 flex items-center justify-center text-3xl shadow-lg">
                {myClub.emblem}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">{myClub.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                    [{myClub.tag}]
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{myClub.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLeaveClub}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-400 text-xs font-bold transition-all border border-slate-700"
              >
                Leave Club
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClub(myClub.id)}
                className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
                title="Delete Club"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Club Level</span>
              <div className="text-lg font-black text-purple-300">Level {myClub.level}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Members</span>
              <div className="text-lg font-black text-white">
                {myClub.membersCount} / {myClub.maxMembers}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Weekly Points</span>
              <div className="text-lg font-black text-amber-400">{myClub.weeklyPoints.toLocaleString()} PTS</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Min Rating</span>
              <div className="text-lg font-black text-emerald-400">{myClub.minRating} ELO</div>
            </div>
          </div>

          {/* Clan Perks */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Clan Perks</h4>
            <div className="flex flex-wrap gap-2">
              {myClub.perks.map((perk, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-purple-400" />
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clubs Browser */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Discover Clubs ({filteredClubs.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClubs.map((club) => {
              const isMember = myClubId === club.id;
              return (
                <div
                  key={club.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                          {club.emblem}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                              {club.name}
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-purple-400">
                              [{club.tag}]
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">Level {club.level} Club</p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                        👥 {club.membersCount}/{club.maxMembers}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{club.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      ⚡ {club.weeklyPoints.toLocaleString()} PTS
                    </span>

                    {isMember ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Joined
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleJoinClub(club.id)}
                        disabled={club.membersCount >= club.maxMembers}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow disabled:opacity-50"
                      >
                        Join Club
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No clubs found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first to create a competitive club and invite your friends to start earning clan chest rewards!
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
            >
              + Create Club
            </button>
          </div>
        )}
      </div>

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-slate-900 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Crown className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">FOUND A CLUB</h3>
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
                <label className="text-xs font-bold text-slate-300">Club Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. The Wild Kings"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Club Tag (3-5 letters)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value.toUpperCase())}
                    placeholder="e.g. KINGS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Club Emblem</label>
                  <select
                    value={formEmblem}
                    onChange={(e) => setFormEmblem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="👑">👑 Royal Crown</option>
                    <option value="⚡">⚡ Lightning Bolt</option>
                    <option value="🦉">🦉 Night Owl</option>
                    <option value="🐉">🐉 Dragon</option>
                    <option value="⚔️">⚔️ Crossed Swords</option>
                    <option value="🔥">🔥 Wild Fire</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Briefly describe your clan playstyle and recruitment requirements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  Found Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
