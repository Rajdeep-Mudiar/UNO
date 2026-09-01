import { create } from 'zustand';
import { GameMode, GameRuleSet } from '@/game-engine/types';

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar?: string;
  isBot: boolean;
  botDifficulty?: string;
  isReady: boolean;
  isHost: boolean;
}

export interface RoomDetails {
  id: string;
  code: string;
  name: string;
  hostId: string;
  mode: GameMode;
  isPrivate: boolean;
  maxPlayers: number;
  players: LobbyPlayer[];
  rules: GameRuleSet;
}

interface LobbyStoreState {
  currentRoom: RoomDetails | null;
  isSearchingMatch: boolean;
  matchQueueMode: GameMode | null;
  searchTimerSec: number;

  setRoom: (room: RoomDetails | null) => void;
  startMatchmaking: (mode: GameMode) => void;
  stopMatchmaking: () => void;
  tickSearchTimer: () => void;
}

export const useLobbyStore = create<LobbyStoreState>((set) => ({
  currentRoom: null,
  isSearchingMatch: false,
  matchQueueMode: null,
  searchTimerSec: 0,

  setRoom: (currentRoom) => set({ currentRoom }),
  startMatchmaking: (mode) =>
    set({ isSearchingMatch: true, matchQueueMode: mode, searchTimerSec: 0 }),
  stopMatchmaking: () =>
    set({ isSearchingMatch: false, matchQueueMode: null, searchTimerSec: 0 }),
  tickSearchTimer: () =>
    set((state) => ({ searchTimerSec: state.searchTimerSec + 1 })),
}));
