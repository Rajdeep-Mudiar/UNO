'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PublicGameState, CardColor } from '@/game-engine/types';
import { GameScoreResult, calculateEndGameScores } from '@/game-engine/scoring';
import { GameBoard } from '@/components/game/GameBoard';
import { getSocket } from '@/lib/socket';
import { Users, Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function LiveMatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId') || '';
  const { data: session } = useSession();

  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [notification, setNotification] = useState<string | null>('Connected to live match! Waiting for your turn...');
  const [scoreResult, setScoreResult] = useState<GameScoreResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get current player ID
  const getMyPlayerId = useCallback(() => {
    return session?.user?.id || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_id') || '' : '');
  }, [session]);

  const [myId, setMyId] = useState<string>('');

  useEffect(() => {
    setMyId(getMyPlayerId());
  }, [getMyPlayerId]);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      // Re-subscribe to game if socket reconnected
      if (roomId) {
        socket.emit('room:join', {
          roomId,
          player: {
            id: getMyPlayerId(),
            name: session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('uno_player_name') || 'Player' : 'Player'),
            avatar: session?.user?.image || '🎮',
          },
        });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleStateUpdate = (publicState: PublicGameState) => {
      setGameState(publicState);
      
      const currentPlayer = publicState.players.find((p) => p.id === publicState.currentPlayerId);
      if (currentPlayer) {
        if (currentPlayer.id === myId || currentPlayer.id === getMyPlayerId()) {
          setNotification("🟢 It's YOUR turn! Play a matching card or draw.");
        } else {
          setNotification(`Waiting for ${currentPlayer.name} to make a move...`);
        }
      }

      if (publicState.phase === 'GAME_OVER' && publicState.winnerId) {
        const scores = calculateEndGameScores(
          publicState.players.map((p) => ({
            id: p.id,
            name: p.name,
            hand: [],
            cardCount: p.cardCount,
            score: p.score,
            rank: p.rank,
            isBot: p.isBot,
            calledUno: p.calledUno,
            isDisconnected: p.isDisconnected,
          })),
          publicState.winnerId
        );
        setScoreResult(scores);
      }
    };

    const handleGameOver = (data: { winnerId: string; players: Array<{ id: string; name: string; score: number; rank?: number }> }) => {
      if (gameState) {
        const winner = data.players.find((p) => p.id === data.winnerId);
        setNotification(`🏆 Game Over! Winner: ${winner?.name || 'Player'}!`);
      }
    };

    const handleTimerTick = (data: { seconds: number }) => {
      // Optional timer notification if low
      if (data.seconds <= 5 && gameState?.currentPlayerId === (myId || getMyPlayerId())) {
        setNotification(`⚠️ Turn timer: ${data.seconds}s remaining!`);
      }
    };

    const handleErrorNotification = (data: { message: string }) => {
      setNotification(`❌ ${data.message}`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('game:state_update', handleStateUpdate);
    socket.on('game:over', handleGameOver);
    socket.on('game:timer_tick', handleTimerTick);
    socket.on('error:notification', handleErrorNotification);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('game:state_update', handleStateUpdate);
      socket.off('game:over', handleGameOver);
      socket.off('game:timer_tick', handleTimerTick);
      socket.off('error:notification', handleErrorNotification);
    };
  }, [roomId, myId, getMyPlayerId, session, gameState]);

  // Action Dispatchers directly to Render Socket Server
  const handlePlayCard = (cardId: string, chosenColor?: CardColor, targetSwapPlayerId?: string) => {
    const socket = getSocket();
    const effectiveId = myId || getMyPlayerId();

    socket.emit('game:action', {
      type: 'PLAY_CARD',
      playerId: effectiveId,
      cardId,
      chosenColor,
      targetSwapPlayerId,
    });
  };

  const handleDrawCard = () => {
    const socket = getSocket();
    const effectiveId = myId || getMyPlayerId();

    socket.emit('game:action', {
      type: 'DRAW_CARD',
      playerId: effectiveId,
    });
  };

  const handleCallUno = () => {
    const socket = getSocket();
    const effectiveId = myId || getMyPlayerId();

    socket.emit('game:action', {
      type: 'CALL_UNO',
      playerId: effectiveId,
    });
  };

  const handleCatchUno = () => {
    if (!gameState) return;
    const socket = getSocket();
    const effectiveId = myId || getMyPlayerId();

    const target = gameState.players.find(
      (p) => p.id !== effectiveId && p.cardCount === 1 && !p.calledUno
    );

    if (target) {
      socket.emit('game:action', {
        type: 'CATCH_UNO_FAILURE',
        callerPlayerId: effectiveId,
        targetPlayerId: target.id,
      });
    }
  };

  const handleDecideWildChallenge = (challenge: boolean) => {
    const socket = getSocket();
    const effectiveId = myId || getMyPlayerId();

    socket.emit('game:action', {
      type: 'CHALLENGE_WILD_FOUR',
      challengerId: effectiveId,
      challenge,
    });
  };

  const handlePlayAgain = () => {
    router.push('/rooms');
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  if (!gameState) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-pulse">
          <Users className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Connecting to Live Lobby Arena...
        </h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Synchronizing masked card hands with all live connected players from your room lobby.
        </p>

        <div className="flex items-center gap-2 pt-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isConnected ? 'Backend Server Synced' : 'Connecting to Server...'}</span>
          </span>
        </div>

        <div className="pt-4">
          <Link
            href="/rooms"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  // Find effective human player ID in gameState
  const effectivePlayerId = gameState.players.find((p) => p.id === (myId || getMyPlayerId()))?.id || gameState.players[0]?.id || '';

  return (
    <div className="relative min-h-[90vh] bg-gradient-to-b from-[#060911] via-[#0b101d] to-[#060911]">
      <GameBoard
        gameState={gameState}
        humanPlayerId={effectivePlayerId}
        scoreResult={scoreResult}
        notificationMessage={notification}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        onCallUno={handleCallUno}
        onCatchUno={handleCatchUno}
        onDecideWildChallenge={handleDecideWildChallenge}
        onPlayAgain={handlePlayAgain}
        onReturnHome={handleReturnHome}
      />
    </div>
  );
}

export default function LiveMatchPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs font-bold text-slate-400">Loading Live Multiplayer Match...</div>}>
      <LiveMatchContent />
    </Suspense>
  );
}
