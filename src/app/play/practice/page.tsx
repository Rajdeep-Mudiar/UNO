'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GameState, CardColor } from '@/game-engine/types';
import { createGame, processAction } from '@/game-engine/actions';
import { sanitizeGameStateForPlayer } from '@/game-engine/serialization';
import { calculateEndGameScores, GameScoreResult } from '@/game-engine/scoring';
import { evaluateBotAction } from '@/bots/strategy';
import { GameBoard } from '@/components/game/GameBoard';

const HUMAN_ID = 'human_player';

export default function PracticeGamePage() {
  const router = useRouter();
  const [authoritativeState, setAuthoritativeState] = useState<GameState | null>(null);
  const [notification, setNotification] = useState<string | null>('Practice match started! Play your cards.');
  const [scoreResult, setScoreResult] = useState<GameScoreResult | null>(null);
  const isBotTurnProcessing = useRef(false);

  const initGame = useCallback(() => {
    const newGame = createGame({
      gameId: `practice_${Date.now()}`,
      roomId: 'practice_room',
      players: [
        { id: HUMAN_ID, name: 'You (Player 1)', isBot: false },
        { id: 'bot_1', name: 'Tactical Bot', isBot: true },
        { id: 'bot_2', name: 'Apex AI', isBot: true },
        { id: 'bot_3', name: 'Casual Bot', isBot: true },
      ],
      customRules: {
        stackDrawTwo: true,
        stackWildDrawFour: true,
        sevenZero: true,
        jumpIn: true,
      },
    });

    setAuthoritativeState(newGame);
    setScoreResult(null);
    setNotification('New match initialized! Match color or number to play.');
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle Bot Turns Automatically
  useEffect(() => {
    if (!authoritativeState || authoritativeState.phase === 'GAME_OVER') return;

    const currentPlayer = authoritativeState.players[authoritativeState.currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.isBot || isBotTurnProcessing.current) return;

    isBotTurnProcessing.current = true;

    // Artificial thinking delay for bots (800ms)
    const timer = setTimeout(() => {
      setAuthoritativeState((prevState) => {
        if (!prevState || prevState.phase === 'GAME_OVER') {
          isBotTurnProcessing.current = false;
          return prevState;
        }

        const activeBot = prevState.players[prevState.currentPlayerIndex];
        if (!activeBot || !activeBot.isBot) {
          isBotTurnProcessing.current = false;
          return prevState;
        }

        // Automatic UNO check for bot
        if (activeBot.cardCount <= 2 && !activeBot.calledUno) {
          processAction(prevState, { type: 'CALL_UNO', playerId: activeBot.id });
        }

        const botAction = evaluateBotAction(prevState, activeBot);
        const result = processAction(prevState, botAction);

        if (result.success) {
          if (botAction.type === 'PLAY_CARD') {
            const playedCard = activeBot.hand.find((c) => c.id === botAction.cardId);
            setNotification(`${activeBot.name} played a ${playedCard?.label ?? 'card'}!`);
          } else if (botAction.type === 'DRAW_CARD') {
            setNotification(`${activeBot.name} drew a card.`);
          }

          if (result.state.phase === 'GAME_OVER' && result.state.winnerId) {
            const scores = calculateEndGameScores(result.state.players, result.state.winnerId);
            setScoreResult(scores);
          }

          isBotTurnProcessing.current = false;
          return result.state;
        }

        isBotTurnProcessing.current = false;
        return prevState;
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [authoritativeState]);

  // Action Dispatchers for Human Player
  const handlePlayCard = (cardId: string, chosenColor?: CardColor, targetSwapPlayerId?: string) => {
    if (!authoritativeState) return;

    const result = processAction(authoritativeState, {
      type: 'PLAY_CARD',
      playerId: HUMAN_ID,
      cardId,
      chosenColor,
      targetSwapPlayerId,
    });

    if (result.success) {
      setAuthoritativeState(result.state);
      setNotification('You played a card!');

      if (result.state.phase === 'GAME_OVER' && result.state.winnerId) {
        const scores = calculateEndGameScores(result.state.players, result.state.winnerId);
        setScoreResult(scores);
      }
    } else {
      setNotification(result.error ?? 'Invalid card play');
    }
  };

  const handleDrawCard = () => {
    if (!authoritativeState) return;

    const result = processAction(authoritativeState, {
      type: 'DRAW_CARD',
      playerId: HUMAN_ID,
    });

    if (result.success) {
      // If regular draw, automatically pass turn if no legal play is desired
      const passResult = processAction(result.state, {
        type: 'PASS_TURN',
        playerId: HUMAN_ID,
      });

      setAuthoritativeState(passResult.success ? passResult.state : result.state);
      setNotification('You drew a card and passed.');
    } else {
      setNotification(result.error ?? 'Cannot draw card');
    }
  };

  const handleCallUno = () => {
    if (!authoritativeState) return;

    const result = processAction(authoritativeState, {
      type: 'CALL_UNO',
      playerId: HUMAN_ID,
    });

    if (result.success) {
      setAuthoritativeState(result.state);
      setNotification('🔥 UNO! Called successfully!');
    }
  };

  const handleCatchUno = () => {
    if (!authoritativeState) return;

    // Find first opponent who forgot to call UNO
    const target = authoritativeState.players.find(
      (p) => p.id !== HUMAN_ID && p.cardCount === 1 && !p.calledUno
    );

    if (target) {
      const result = processAction(authoritativeState, {
        type: 'CATCH_UNO_FAILURE',
        callerPlayerId: HUMAN_ID,
        targetPlayerId: target.id,
      });

      if (result.success) {
        setAuthoritativeState(result.state);
        setNotification(`🚨 Caught ${target.name} forgetting to call UNO! +2 card penalty applied.`);
      }
    }
  };

  const handleDecideWildChallenge = (challenge: boolean) => {
    if (!authoritativeState) return;

    const result = processAction(authoritativeState, {
      type: 'CHALLENGE_WILD_FOUR',
      challengerId: HUMAN_ID,
      challenge,
    });

    if (result.success) {
      setAuthoritativeState(result.state);
      setNotification(challenge ? 'Challenge resolved!' : 'Accepted +4 draw.');
    }
  };

  if (!authoritativeState) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-400">
        Initializing practice arena...
      </div>
    );
  }

  const publicGameState = sanitizeGameStateForPlayer(authoritativeState, HUMAN_ID);

  return (
    <div className="relative min-h-[90vh] bg-gradient-to-b from-[#060911] via-[#0b101d] to-[#060911]">
      <GameBoard
        gameState={publicGameState}
        humanPlayerId={HUMAN_ID}
        scoreResult={scoreResult}
        notificationMessage={notification}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        onCallUno={handleCallUno}
        onCatchUno={handleCatchUno}
        onDecideWildChallenge={handleDecideWildChallenge}
        onPlayAgain={initGame}
        onReturnHome={() => router.push('/')}
      />
    </div>
  );
}
