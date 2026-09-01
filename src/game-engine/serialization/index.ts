import {
  GameState,
  PublicGameState,
  PublicPlayerState,
} from '../types';
import { canPlayerJumpIn, getLegalCardIds } from '../rules';

/**
 * Transforms server-authoritative GameState into a client-safe PublicGameState.
 * Strips private hands of opponents to prevent any client-side cheating/inspection.
 */
export function sanitizeGameStateForPlayer(
  state: GameState,
  playerId: string
): PublicGameState {
  const player = state.players.find((p) => p.id === playerId);
  const myHand = player ? [...player.hand] : [];
  const topCard = state.discardPile[state.discardPile.length - 1]!;

  const publicPlayers: PublicPlayerState[] = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    isBot: p.isBot,
    cardCount: p.hand.length,
    calledUno: p.calledUno,
    score: p.score,
    rank: p.rank,
    isDisconnected: p.isDisconnected,
  }));

  const isMyTurn =
    state.phase === 'IN_PROGRESS' &&
    state.players[state.currentPlayerIndex]?.id === playerId;

  const legalCardIds = isMyTurn ? getLegalCardIds(myHand, state) : [];

  const canCallUno = player ? player.cardCount <= 2 && !player.calledUno : false;

  // Can catch any opponent who has 1 card left and didn't call UNO
  const canCatchUno = state.players.some(
    (p) => p.id !== playerId && p.cardCount === 1 && !p.calledUno
  );

  const canJumpIn = player ? canPlayerJumpIn(player, state).canJump : false;

  const currentPlayer = state.players[state.currentPlayerIndex];

  return {
    gameId: state.gameId,
    roomId: state.roomId,
    players: publicPlayers,
    myHand,
    currentPlayerId: currentPlayer?.id ?? '',
    direction: state.direction,
    topCard,
    currentColor: state.currentColor,
    pendingDrawCount: state.pendingDrawCount,
    turnNumber: state.turnNumber,
    phase: state.phase,
    winnerId: state.winnerId,
    rules: state.rules,
    canCallUno,
    canCatchUno,
    canJumpIn,
    legalCardIds,
  };
}

/**
 * Sanitizes game state for a spectator (all hands hidden).
 */
export function sanitizeGameStateForSpectator(state: GameState): PublicGameState {
  const topCard = state.discardPile[state.discardPile.length - 1]!;
  const publicPlayers: PublicPlayerState[] = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    isBot: p.isBot,
    cardCount: p.hand.length,
    calledUno: p.calledUno,
    score: p.score,
    rank: p.rank,
    isDisconnected: p.isDisconnected,
  }));

  const currentPlayer = state.players[state.currentPlayerIndex];

  return {
    gameId: state.gameId,
    roomId: state.roomId,
    players: publicPlayers,
    myHand: [],
    currentPlayerId: currentPlayer?.id ?? '',
    direction: state.direction,
    topCard,
    currentColor: state.currentColor,
    pendingDrawCount: state.pendingDrawCount,
    turnNumber: state.turnNumber,
    phase: state.phase,
    winnerId: state.winnerId,
    rules: state.rules,
    canCallUno: false,
    canCatchUno: false,
    canJumpIn: false,
    legalCardIds: [],
  };
}
