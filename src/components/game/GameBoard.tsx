'use client';

import React, { useState } from 'react';
import { Card, CardColor, PublicGameState } from '@/game-engine/types';
import { GameScoreResult } from '@/game-engine/scoring';
import { CenterTable } from './CenterTable';
import { OpponentSeat } from './OpponentSeat';
import { PlayerHand } from './PlayerHand';
import { UnoButton } from './UnoButton';
import { ColorPickerModal } from './ColorPickerModal';
import { SevenSwapModal } from './SevenSwapModal';
import { WildChallengeModal } from './WildChallengeModal';
import { GameOverModal } from './GameOverModal';
import { QuickEmoteMenu } from './QuickEmoteMenu';
import { isWildCard } from '@/game-engine/cards';
import { Bell } from 'lucide-react';

interface GameBoardProps {
  gameState: PublicGameState;
  humanPlayerId: string;
  scoreResult: GameScoreResult | null;
  notificationMessage?: string | null;
  turnSecondsRemaining?: number;
  onPlayCard: (cardId: string, chosenColor?: CardColor, targetSwapPlayerId?: string) => void;
  onDrawCard: () => void;
  onCallUno: () => void;
  onCatchUno: (targetPlayerId?: string) => void;
  onDecideWildChallenge: (challenge: boolean) => void;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  humanPlayerId,
  scoreResult,
  notificationMessage,
  turnSecondsRemaining,
  onPlayCard,
  onDrawCard,
  onCallUno,
  onCatchUno,
  onDecideWildChallenge,
  onPlayAgain,
  onReturnHome,
}) => {
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [pendingSevenCard, setPendingSevenCard] = useState<Card | null>(null);
  const [activeEmotes, setActiveEmotes] = useState<Record<string, string>>({});

  const humanPlayer = gameState.players.find((p) => p.id === humanPlayerId);
  const isMyTurn = gameState.currentPlayerId === humanPlayerId;

  // Split opponents into Left, Top, Right seats
  const opponents = gameState.players.filter((p) => p.id !== humanPlayerId);
  const leftOpponent = opponents[0];
  const topOpponent = opponents[1];
  const rightOpponent = opponents[2];

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) return;

    if (isWildCard(card)) {
      setPendingWildCard(card);
      return;
    }

    if (gameState.rules.sevenZero && card.type === 'NUMBER' && card.value === 7) {
      setPendingSevenCard(card);
      return;
    }

    onPlayCard(card.id);
  };

  const handleColorSelected = (color: CardColor) => {
    if (pendingWildCard) {
      onPlayCard(pendingWildCard.id, color);
      setPendingWildCard(null);
    }
  };

  const handleSevenTargetSelected = (targetId: string) => {
    if (pendingSevenCard) {
      onPlayCard(pendingSevenCard.id, undefined, targetId);
      setPendingSevenCard(null);
    }
  };

  const handleSendEmote = (emote: string) => {
    setActiveEmotes((prev) => ({ ...prev, [humanPlayerId]: emote }));
    setTimeout(() => {
      setActiveEmotes((prev) => {
        const next = { ...prev };
        delete next[humanPlayerId];
        return next;
      });
    }, 3000);
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col justify-between p-4 select-none overflow-hidden">
      {/* Top Seat Area */}
      <div className="w-full flex justify-center items-center py-2 z-20">
        {topOpponent ? (
          <OpponentSeat
            player={topOpponent}
            position="top"
            isCurrentTurn={gameState.currentPlayerId === topOpponent.id}
            currentEmote={activeEmotes[topOpponent.id]}
            onCatchUno={(id) => onCatchUno(id)}
          />
        ) : (
          <div className="h-12" />
        )}
      </div>

      {/* Middle Section: Left Seat, Center Playfield, Right Seat */}
      <div className="flex-1 flex items-center justify-between w-full max-w-6xl mx-auto px-2 sm:px-6 relative z-10">
        {/* Left Seat */}
        <div className="w-36 sm:w-48 flex justify-start">
          {leftOpponent && (
            <OpponentSeat
              player={leftOpponent}
              position="left"
              isCurrentTurn={gameState.currentPlayerId === leftOpponent.id}
              currentEmote={activeEmotes[leftOpponent.id]}
              onCatchUno={(id) => onCatchUno(id)}
            />
          )}
        </div>

        {/* Center Table */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Notification Banner */}
          {notificationMessage && (
            <div className="mb-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-xs font-bold text-purple-200 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Bell className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{notificationMessage}</span>
            </div>
          )}

          <CenterTable
            topCard={gameState.topCard}
            currentColor={gameState.currentColor}
            direction={gameState.direction}
            pendingDrawCount={gameState.pendingDrawCount}
            isMyTurn={isMyTurn}
            onDrawCard={onDrawCard}
            turnSecondsRemaining={turnSecondsRemaining}
          />
        </div>

        {/* Right Seat */}
        <div className="w-36 sm:w-48 flex justify-end">
          {rightOpponent && (
            <OpponentSeat
              player={rightOpponent}
              position="right"
              isCurrentTurn={gameState.currentPlayerId === rightOpponent.id}
              currentEmote={activeEmotes[rightOpponent.id]}
              onCatchUno={(id) => onCatchUno(id)}
            />
          )}
        </div>
      </div>

      {/* Bottom Area: Controls HUD & Player Hand */}
      <div className="w-full flex flex-col items-center z-20">
        {/* Action Controls HUD Bar */}
        <div className="w-full max-w-4xl px-4 flex items-center justify-between gap-4 mb-2">
          {/* Turn Indicator Banner */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isMyTurn ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-bold text-slate-300">
              {isMyTurn ? 'Your Turn to Play!' : `${gameState.players.find(p => p.id === gameState.currentPlayerId)?.name ?? 'Opponent'}'s Turn`}
            </span>
          </div>

          {/* UNO Buttons (Call UNO & Catch UNO) */}
          <UnoButton
            canCallUno={gameState.canCallUno}
            canCatchUno={gameState.canCatchUno}
            hasCalledUno={humanPlayer?.calledUno ?? false}
            onCallUno={onCallUno}
            onCatchUno={() => onCatchUno()}
          />

          {/* Quick Emotes */}
          <QuickEmoteMenu onSendEmote={handleSendEmote} />
        </div>

        {/* Player Hand Fan */}
        <PlayerHand
          hand={gameState.myHand}
          legalCardIds={gameState.legalCardIds}
          isMyTurn={isMyTurn}
          onPlayCard={handleCardClick}
        />
      </div>

      {/* Interactive Modals */}
      <ColorPickerModal
        isOpen={pendingWildCard !== null}
        onSelectColor={handleColorSelected}
      />

      <SevenSwapModal
        isOpen={pendingSevenCard !== null}
        players={gameState.players}
        currentPlayerId={humanPlayerId}
        onSelectTarget={handleSevenTargetSelected}
      />

      <WildChallengeModal
        isOpen={gameState.phase === 'AWAITING_WILD_FOUR_CHALLENGE' && isMyTurn}
        onDecide={onDecideWildChallenge}
      />

      <GameOverModal
        isOpen={gameState.phase === 'GAME_OVER'}
        scoreResult={scoreResult}
        humanPlayerId={humanPlayerId}
        players={gameState.players}
        onPlayAgain={onPlayAgain}
        onReturnHome={onReturnHome}
      />
    </div>
  );
};
