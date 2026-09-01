'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Plus, 
  Lock, 
  Unlock, 
  Bot, 
  Check, 
  Copy, 
  Play, 
  UserPlus,
  Trash2,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { DEFAULT_RULES } from '@/game-engine/rules';
import { GameRuleSet } from '@/game-engine/types';
import { getSocket } from '@/lib/socket';

interface RoomItem {
  id: string;
  code: string;
  name: string;
  hostName: string;
  hostAvatar: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  ping: number;
  rules: Partial<GameRuleSet>;
  mode: string;
}

interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  botDifficulty?: string;
  isReady: boolean;
  isHost: boolean;
}

interface ServerRoomUpdate {
  id: string;
  code: string;
  name: string;
  hostId: string;
  isPrivate: boolean;
  maxPlayers: number;
  rules: GameRuleSet;
  players: LobbyPlayer[];
  inGame: boolean;
}

function RoomsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const { data: session } = useSession();

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PUBLIC' | 'CUSTOM' | 'DUEL'>('ALL');
  const [searchCode, setSearchCode] = useState(initialCode);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Active Lobby State
  const [activeRoom, setActiveRoom] = useState<ServerRoomUpdate | null>(null);

  // Form State for Room Creation
  const [formName, setFormName] = useState('My Custom Arena');
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formPassword, setFormPassword] = useState('');
  const [formMaxPlayers, setFormMaxPlayers] = useState(4);
  const [formTimer, setFormTimer] = useState(15);
  const [formRules, setFormRules] = useState<GameRuleSet>({ ...DEFAULT_RULES });

  // Get current player identity
  const getCurrentPlayer = useCallback(() => {
    return {
      id: session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_id') || `guest_${Math.floor(1000 + Math.random() * 9000)}` : 'guest'),
      name: session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_name') || `Player ${Math.floor(100 + Math.random() * 900)}` : 'Player'),
      avatar: session?.user?.image || '👑',
    };
  }, [session]);

  // Persist guest ID in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !session?.user) {
      if (!localStorage.getItem('uno_player_id')) {
        const generatedId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem('uno_player_id', generatedId);
      }
      if (!localStorage.getItem('uno_player_name')) {
        const generatedName = `Player ${Math.floor(100 + Math.random() * 900)}`;
        localStorage.setItem('uno_player_name', generatedName);
      }
    }
  }, [session]);

  // Initialize Socket.IO connection & event listeners
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('room:list');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleRoomList = (roomList: RoomItem[]) => {
      setRooms(roomList);
    };

    const handleRoomUpdated = (roomData: ServerRoomUpdate) => {
      setActiveRoom(roomData);
      setErrorMessage('');
    };

    const handleGameStarted = (data: { gameId: string; roomId: string }) => {
      router.push(`/play/practice?gameId=${data.gameId}`);
    };

    const handleErrorNotification = (payload: { message: string }) => {
      setErrorMessage(payload.message);
      setTimeout(() => setErrorMessage(''), 4000);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room:list_response', handleRoomList);
    socket.on('room:updated', handleRoomUpdated);
    socket.on('game:started', handleGameStarted);
    socket.on('error:notification', handleErrorNotification);

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('room:list');
    }

    // If code parameter is in URL on load, attempt join
    if (initialCode) {
      socket.emit('room:join', {
        code: initialCode,
        player: getCurrentPlayer(),
      });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room:list_response', handleRoomList);
      socket.off('room:updated', handleRoomUpdated);
      socket.off('game:started', handleGameStarted);
      socket.off('error:notification', handleErrorNotification);
    };
  }, [initialCode, getCurrentPlayer, router]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const socket = getSocket();
    const player = getCurrentPlayer();

    socket.emit('room:create', {
      name: formName || 'Custom Arena',
      isPrivate: formIsPrivate,
      maxPlayers: formMaxPlayers,
      rules: {
        ...formRules,
        turnTimerSec: formTimer,
        maxPlayers: formMaxPlayers,
      },
      player,
    });

    setShowCreateModal(false);
  };

  const handleJoinRoom = (codeOrId: string) => {
    if (!codeOrId.trim()) return;
    const socket = getSocket();
    const player = getCurrentPlayer();

    socket.emit('room:join', {
      code: codeOrId.trim(),
      player,
    });
  };

  const handleAddBot = () => {
    if (!activeRoom) return;
    const socket = getSocket();
    socket.emit('room:add_bot', { difficulty: 'MEDIUM' });
  };

  const handleRemoveSlot = (playerId: string) => {
    const socket = getSocket();
    socket.emit('room:kick_player', { playerId });
  };

  const handleToggleReady = () => {
    if (!activeRoom) return;
    const socket = getSocket();
    const myPlayer = activeRoom.players.find((p) => p.name === (session?.user?.name || localStorage.getItem('uno_player_name')));
    const currentReady = myPlayer ? myPlayer.isReady : false;
    socket.emit('room:set_ready', { isReady: !currentReady });
  };

  const handleLeaveLobby = () => {
    const socket = getSocket();
    socket.emit('room:leave');
    setActiveRoom(null);
  };

  const handleCopyInvite = () => {
    if (!activeRoom) return;
    const inviteUrl = `${window.location.origin}/rooms?code=${activeRoom.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('room:start_game');
  };

  const myPlayer = activeRoom?.players.find(
    (p) => p.name === (session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_name') : ''))
  );
  const isHost = myPlayer?.isHost ?? false;
  const isReady = myPlayer?.isReady ?? false;

  const filteredRooms = rooms.filter((r) => {
    if (activeFilter === 'PUBLIC') return !r.isPrivate;
    if (activeFilter === 'CUSTOM') return r.mode?.includes('CUSTOM') || r.rules?.jumpIn || r.rules?.sevenZero;
    if (activeFilter === 'DUEL') return r.maxPlayers === 2;
    return true;
  });

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>CUSTOM MATCHES & HOUSE RULES</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isConnected 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'Server Connected' : 'Connecting to Server...'}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            MULTIPLAYER ROOMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create custom private lobbies with friends, stack cards, jump-in out of turn, or test wild 7-0 swaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
        </div>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* If in an active Room Lobby */}
      {activeRoom ? (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-slate-900/90 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white">{activeRoom.name}</h2>
                  <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black">
                    {activeRoom.rules.sevenZero ? 'CHAOS 7-0' : activeRoom.rules.jumpIn ? 'JUMP-IN' : 'CUSTOM MATCH'}
                  </span>
                  {activeRoom.isPrivate && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PIN Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Players Connected: <span className="text-slate-200 font-bold">{activeRoom.players.length} / {activeRoom.maxPlayers}</span> | Turn Timer:{' '}
                  <span className="text-purple-300 font-bold">{activeRoom.rules.turnTimerSec || 15}s</span>
                </p>
              </div>

              {/* Room Code & Copy */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-sm font-mono font-bold text-amber-400">
                  <span>CODE:</span>
                  <span className="text-white text-base tracking-wider">{activeRoom.code}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Copy Invite Link"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Players Grid in Lobby */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Lobby Players ({activeRoom.players.length} / {activeRoom.maxPlayers})
                </h3>
                {isHost && activeRoom.players.length < activeRoom.maxPlayers && (
                  <button
                    type="button"
                    onClick={handleAddBot}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    + Add Bot Opponent
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: activeRoom.maxPlayers }).map((_, idx) => {
                  const slot = activeRoom.players[idx];
                  if (slot) {
                    return (
                      <div
                        key={slot.id || idx}
                        className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between relative group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                            {slot.avatar || '🎮'}
                          </div>
                          <div className="flex items-center gap-1">
                            {slot.isHost && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                                HOST
                              </span>
                            )}
                            {slot.isBot && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
                                BOT
                              </span>
                            )}
                            {isHost && !slot.isHost && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(slot.id)}
                                className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Kick player"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-bold text-white text-sm truncate">{slot.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            {slot.isBot ? `Strategy: ${slot.botDifficulty || 'MEDIUM'}` : 'Player Connected'}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                          <span className={slot.isReady ? 'text-emerald-400' : 'text-amber-400'}>
                            {slot.isReady ? '● Ready' : '○ Not Ready'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      onClick={isHost ? handleAddBot : undefined}
                      className={`border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 transition-all min-h-[140px] ${
                        isHost ? 'hover:border-purple-500/50 hover:text-purple-300 cursor-pointer' : ''
                      }`}
                    >
                      <UserPlus className="w-6 h-6" />
                      <span className="text-xs font-bold">Slot {idx + 1} Open</span>
                      <span className="text-[10px] text-slate-500">
                        {isHost ? 'Click to add bot or share code' : 'Waiting for player...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configured Rules Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active House Rules</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {activeRoom.rules.stackDrawTwo && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
                    +2 Stacking Enabled
                  </span>
                )}
                {activeRoom.rules.stackWildDrawFour && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold">
                    +4 Wild Stacking Enabled
                  </span>
                )}
                {activeRoom.rules.jumpIn && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
                    ⚡ Jump-In Reaction
                  </span>
                )}
                {activeRoom.rules.sevenZero && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold">
                    🔄 7-0 Hand Swap & Rotation
                  </span>
                )}
                {activeRoom.rules.drawUntilPlayable && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                    🃏 Draw Until Playable
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold">
                  ⏱️ {activeRoom.rules.turnTimerSec || 15}s Turn Timer
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleLeaveLobby}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                ← Leave Lobby
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleReady}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                    isReady
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  }`}
                >
                  {isReady ? '✓ Ready' : 'Set Ready'}
                </button>

                {isHost && (
                  <button
                    type="button"
                    onClick={handleStartGame}
                    disabled={activeRoom.players.length < 2}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:from-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Launch Game
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Room Browser (shown if not currently in lobby) */}
      {!activeRoom && (
        <div className="space-y-6">
          {/* Quick Join & Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              {(['ALL', 'PUBLIC', 'CUSTOM', 'DUEL'] as const).map((filter) => (
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
                  {filter === 'ALL' && 'All Lobbies'}
                  {filter === 'PUBLIC' && '🔓 Public Only'}
                  {filter === 'CUSTOM' && '✨ Custom Rules'}
                  {filter === 'DUEL' && '⚔️ 1v1 Duels'}
                </button>
              ))}
            </div>

            {/* Join with Code input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. UNO-1234)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleJoinRoom(searchCode)}
                disabled={!searchCode.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                          {room.hostAvatar || '👑'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {room.name}
                          </h3>
                          <p className="text-[11px] text-slate-400">Host: {room.hostName}</p>
                        </div>
                      </div>

                      {room.isPrivate ? (
                        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Private Room">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Public Room">
                          <Unlock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Badges & Mode */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black">
                        {room.mode || 'CUSTOM'}
                      </span>
                      {room.rules?.stackDrawTwo && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-semibold">
                          +2/+4 Stack
                        </span>
                      )}
                      {room.rules?.jumpIn && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                          Jump-In
                        </span>
                      )}
                      {room.rules?.sevenZero && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-semibold">
                          7-0
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer info & Join Button */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">
                        👥 {room.playerCount} / {room.maxPlayers}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">Code: {room.code}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJoinRoom(room.code)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-bold transition-all shadow group-hover:scale-105"
                    >
                      Enter Lobby
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-3xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No active public rooms right now</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Be the first to create a custom room, or enter a room code above to join a friend.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
              >
                + Create Custom Room
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">CREATE CUSTOM ROOM</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-5">
              {/* Room Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Room Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Midnight Championship"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Player Capacity & Turn Timer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Max Players</label>
                  <select
                    value={formMaxPlayers}
                    onChange={(e) => setFormMaxPlayers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={2}>2 Players (Duel)</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players (Standard)</option>
                    <option value={6}>6 Players</option>
                    <option value={8}>8 Players (Party)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Turn Timer</label>
                  <select
                    value={formTimer}
                    onChange={(e) => setFormTimer(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={7}>7s (Ultra Blitz)</option>
                    <option value={10}>10s (Speed)</option>
                    <option value={15}>15s (Standard)</option>
                    <option value={30}>30s (Relaxed)</option>
                  </select>
                </div>
              </div>

              {/* House Rules Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-black tracking-wider text-purple-400 uppercase">Custom House Rules</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <span className="text-xs font-semibold text-slate-200">+2 / +4 Stacking</span>
                    <input
                      type="checkbox"
                      checked={formRules.stackDrawTwo}
                      onChange={(e) =>
                        setFormRules({
                          ...formRules,
                          stackDrawTwo: e.target.checked,
                          stackWildDrawFour: e.target.checked,
                        })
                      }
                      className="accent-purple-600 w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <span className="text-xs font-semibold text-slate-200">⚡ Jump-In Reaction</span>
                    <input
                      type="checkbox"
                      checked={formRules.jumpIn}
                      onChange={(e) => setFormRules({ ...formRules, jumpIn: e.target.checked })}
                      className="accent-purple-600 w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <span className="text-xs font-semibold text-slate-200">🔄 7-0 Hand Swaps</span>
                    <input
                      type="checkbox"
                      checked={formRules.sevenZero}
                      onChange={(e) => setFormRules({ ...formRules, sevenZero: e.target.checked })}
                      className="accent-purple-600 w-4 h-4 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <span className="text-xs font-semibold text-slate-200">🃏 Draw Until Playable</span>
                    <input
                      type="checkbox"
                      checked={formRules.drawUntilPlayable}
                      onChange={(e) => setFormRules({ ...formRules, drawUntilPlayable: e.target.checked })}
                      className="accent-purple-600 w-4 h-4 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPrivate}
                    onChange={(e) => setFormIsPrivate(e.target.checked)}
                    className="accent-purple-600 w-4 h-4 rounded"
                  />
                  <span>Make Room Private (Require PIN / Code to join)</span>
                </label>

                {formIsPrivate && (
                  <input
                    type="password"
                    placeholder="Enter 4-digit PIN (Optional)"
                    maxLength={6}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                )}
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/40 transition-all"
                >
                  Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400">Loading Multiplayer Rooms...</div>}>
      <RoomsContent />
    </Suspense>
  );
}
