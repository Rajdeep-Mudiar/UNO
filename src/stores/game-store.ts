import { create } from 'zustand';
import { Card, CardColor, PublicGameState } from '@/game-engine/types';

interface GameStoreState {
  gameState: PublicGameState | null;
  selectedCard: Card | null;
  selectedColor: CardColor | null;
  isDealing: boolean;
  isMyTurn: boolean;
  error: string | null;

  // Actions
  setGameState: (state: PublicGameState | null) => void;
  selectCard: (card: Card | null) => void;
  selectColor: (color: CardColor | null) => void;
  setError: (error: string | null) => void;
  clearSelection: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  gameState: null,
  selectedCard: null,
  selectedColor: null,
  isDealing: false,
  isMyTurn: false,
  error: null,

  setGameState: (gameState) =>
    set({
      gameState,
      isMyTurn: gameState ? gameState.currentPlayerId === 'me' : false,
      error: null,
    }),

  selectCard: (selectedCard) => set({ selectedCard }),
  selectColor: (selectedColor) => set({ selectedColor }),
  setError: (error) => set({ error }),
  clearSelection: () => set({ selectedCard: null, selectedColor: null, error: null }),
}));
