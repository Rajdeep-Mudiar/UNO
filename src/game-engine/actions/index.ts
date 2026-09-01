import {
  ActionResult,
  Card,
  CardColor,
  EngineAction,
  GameEventPayload,
  GameRuleSet,
  GameState,
  Player,
} from '../types';
import { areCardsIdentical, isWildCard } from '../cards';
import { drawCardsFromPile, initializeGamePiles } from '../deck';
import { DEFAULT_RULES, isCardPlayable, isWildDrawFourBluff } from '../rules';
import { getNextPlayerIndex, processReverseCard } from '../turns';

export interface CreateGameParams {
  gameId: string;
  roomId: string;
  players: { id: string; name: string; avatar?: string; isBot?: boolean }[];
  customDeck?: Card[];
  customRules?: Partial<GameRuleSet>;
}

/**
 * Initializes a new game instance, deals hands, and sets starting discard card.
 */
export function createGame(params: CreateGameParams): GameState {
  const { gameId, roomId, customDeck, customRules } = params;
  const rules: GameRuleSet = { ...DEFAULT_RULES, ...customRules };

  if (params.players.length < 2) {
    throw new Error('At least 2 players are required to start a game');
  }

  const { drawPile: initialDraw, discardPile: initialDiscard } = initializeGamePiles(customDeck);
  let currentDraw = initialDraw;
  let currentDiscard = initialDiscard;

  // Deal starting hands to players
  const players: Player[] = params.players.map((p) => {
    const { drawn, drawPile: remainingDraw, discardPile: remainingDiscard } = drawCardsFromPile(
      currentDraw,
      currentDiscard,
      rules.startingHandSize
    );
    currentDraw = remainingDraw;
    currentDiscard = remainingDiscard;

    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isBot: p.isBot ?? false,
      hand: drawn,
      cardCount: drawn.length,
      calledUno: false,
      score: 0,
    };
  });

  const topCard = currentDiscard[currentDiscard.length - 1]!;
  let currentColor: CardColor = topCard.color === 'WILD' ? 'RED' : topCard.color;
  let currentType = topCard.type;
  let startingPlayerIndex = 0;
  let direction: 1 | -1 = 1;
  let pendingDrawCount = 0;

  // Handle first card effects on game start per official rules
  if (topCard.type === 'DRAW_TWO') {
    if (rules.stackDrawTwo) {
      pendingDrawCount = 2;
    } else {
      // First player draws 2 and is skipped
      const firstPlayer = players[0]!;
      const { drawn, drawPile, discardPile } = drawCardsFromPile(currentDraw, currentDiscard, 2);
      firstPlayer.hand.push(...drawn);
      firstPlayer.cardCount = firstPlayer.hand.length;
      currentDraw = drawPile;
      currentDiscard = discardPile;
      startingPlayerIndex = 1 % players.length;
    }
  } else if (topCard.type === 'REVERSE') {
    direction = -1;
    if (players.length === 2) {
      startingPlayerIndex = 1;
    }
  } else if (topCard.type === 'SKIP') {
    startingPlayerIndex = 1 % players.length;
  } else if (topCard.type === 'WILD') {
    currentColor = 'RED'; // Default starting color for initial wild card
  }

  return {
    gameId,
    roomId,
    players,
    currentPlayerIndex: startingPlayerIndex,
    direction,
    drawPile: currentDraw,
    discardPile: currentDiscard,
    currentColor,
    currentType,
    pendingDrawCount,
    turnNumber: 1,
    phase: 'IN_PROGRESS',
    winnerId: null,
    rules,
    turnStartedAt: Date.now(),
    lastAction: null,
    wildChallenge: null,
    pendingColorChoicePlayerId: null,
    pendingSevenSwapPlayerId: null,
  };
}

/**
 * Server-authoritative action dispatcher and state machine.
 */
export function processAction(state: GameState, action: EngineAction): ActionResult {
  if (state.phase === 'GAME_OVER') {
    return { success: false, state, events: [], error: 'Game is already finished' };
  }

  const events: GameEventPayload[] = [];
  const now = Date.now();

  switch (action.type) {
    case 'PLAY_CARD': {
      const { playerId, cardId, chosenColor, targetSwapPlayerId } = action;
      const currentPlayer = state.players[state.currentPlayerIndex];

      if (!currentPlayer || currentPlayer.id !== playerId) {
        return { success: false, state, events: [], error: 'Not your turn' };
      }

      const cardIndex = currentPlayer.hand.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) {
        return { success: false, state, events: [], error: 'Card not in player hand' };
      }

      const card = currentPlayer.hand[cardIndex]!;
      const playableCheck = isCardPlayable(card, state, currentPlayer.hand);
      if (!playableCheck.playable) {
        return {
          success: false,
          state,
          events: [],
          error: playableCheck.reason ?? 'Illegal card play',
        };
      }

      // Check wild color choice requirement
      if (isWildCard(card) && !chosenColor) {
        return {
          success: false,
          state,
          events: [],
          error: 'Must specify chosenColor when playing a Wild card',
        };
      }

      // Remove card from player hand
      const nextHand = [...currentPlayer.hand];
      nextHand.splice(cardIndex, 1);
      currentPlayer.hand = nextHand;
      currentPlayer.cardCount = nextHand.length;

      // Add to discard pile
      const nextDiscard = [...state.discardPile, card];

      // Handle Uno check: if player now has 1 card left and didn't call UNO, reset calledUno flag
      if (currentPlayer.cardCount === 1) {
        // Player has 1 card left
      } else {
        currentPlayer.calledUno = false;
      }

      events.push({
        eventType: 'CARD_PLAYED',
        playerId,
        data: { card, chosenColor },
        timestamp: now,
      });

      // Check Win condition
      if (currentPlayer.cardCount === 0) {
        return {
          success: true,
          state: {
            ...state,
            discardPile: nextDiscard,
            phase: 'GAME_OVER',
            winnerId: playerId,
            lastAction: { type: 'PLAY_CARD', playerId, timestamp: now, data: { cardId } },
          },
          events: [
            ...events,
            { eventType: 'GAME_WON', playerId, data: { winnerId: playerId }, timestamp: now },
          ],
        };
      }

      // Handle 7-0 Hand Swapping Rules
      if (state.rules.sevenZero && card.type === 'NUMBER') {
        if (card.value === 7) {
          if (targetSwapPlayerId && targetSwapPlayerId !== playerId) {
            const target = state.players.find((p) => p.id === targetSwapPlayerId);
            if (target) {
              const tempHand = currentPlayer.hand;
              currentPlayer.hand = target.hand;
              currentPlayer.cardCount = target.hand.length;
              target.hand = tempHand;
              target.cardCount = tempHand.length;

              events.push({
                eventType: 'HANDS_SWAPPED',
                playerId,
                data: { targetPlayerId: targetSwapPlayerId },
                timestamp: now,
              });
            }
          }
        } else if (card.value === 0) {
          // Rotate all hands in play direction
          const allHands = state.players.map((p) => p.hand);
          const count = state.players.length;
          state.players.forEach((p, idx) => {
            const fromIdx = ((idx - state.direction) % count + count) % count;
            p.hand = allHands[fromIdx]!;
            p.cardCount = p.hand.length;
          });

          events.push({
            eventType: 'HANDS_ROTATED',
            playerId,
            data: { direction: state.direction },
            timestamp: now,
          });
        }
      }

      // Determine next color and type
      let nextColor: CardColor = card.color === 'WILD' ? (chosenColor ?? 'RED') : card.color;
      const nextType = card.type;
      let nextDirection = state.direction;
      let stepCount = 1;
      let nextPendingDraw = state.pendingDrawCount;

      // Handle Action effects
      if (card.type === 'DRAW_TWO') {
        if (state.rules.stackDrawTwo) {
          nextPendingDraw += 2;
        } else {
          // Next player draws 2 cards and is skipped
          const victimIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);
          const victim = state.players[victimIndex]!;
          const { drawn, drawPile } = drawCardsFromPile(state.drawPile, nextDiscard, 2);
          victim.hand.push(...drawn);
          victim.cardCount = victim.hand.length;
          state.drawPile = drawPile;
          stepCount = 2; // Skip victim's turn
        }
      } else if (card.type === 'WILD_DRAW_FOUR') {
        if (state.rules.stackWildDrawFour) {
          nextPendingDraw += 4;
        } else {
          // Next player draws 4 cards and is skipped
          const victimIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);
          const victim = state.players[victimIndex]!;
          const { drawn, drawPile } = drawCardsFromPile(state.drawPile, nextDiscard, 4);
          victim.hand.push(...drawn);
          victim.cardCount = victim.hand.length;
          state.drawPile = drawPile;
          stepCount = 2; // Skip victim's turn
        }
      } else if (card.type === 'REVERSE') {
        const rev = processReverseCard(state.players.length, state.direction);
        nextDirection = rev.newDirection;
        stepCount = rev.stepCount;
      } else if (card.type === 'SKIP') {
        stepCount = 2;
      }

      const nextPlayerIdx = getNextPlayerIndex(
        state.currentPlayerIndex,
        state.players.length,
        nextDirection,
        stepCount
      );

      return {
        success: true,
        state: {
          ...state,
          discardPile: nextDiscard,
          currentColor: nextColor,
          currentType: nextType,
          direction: nextDirection,
          pendingDrawCount: nextPendingDraw,
          currentPlayerIndex: nextPlayerIdx,
          turnNumber: state.turnNumber + 1,
          turnStartedAt: now,
          lastAction: { type: 'PLAY_CARD', playerId, timestamp: now, data: { cardId, chosenColor } },
        },
        events,
      };
    }

    case 'DRAW_CARD': {
      const { playerId } = action;
      const currentPlayer = state.players[state.currentPlayerIndex];

      if (!currentPlayer || currentPlayer.id !== playerId) {
        return { success: false, state, events: [], error: 'Not your turn to draw' };
      }

      // If pending draw stack exists (+2 or +4 accumulated), player must draw all pending cards
      if (state.pendingDrawCount > 0) {
        const cardsToDraw = state.pendingDrawCount;
        const { drawn, drawPile, discardPile } = drawCardsFromPile(
          state.drawPile,
          state.discardPile,
          cardsToDraw
        );

        currentPlayer.hand.push(...drawn);
        currentPlayer.cardCount = currentPlayer.hand.length;

        events.push({
          eventType: 'PENALTY_DRAWN',
          playerId,
          data: { count: cardsToDraw },
          timestamp: now,
        });

        // After drawing penalty stack, turn automatically passes to next player
        const nextIdx = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);

        return {
          success: true,
          state: {
            ...state,
            drawPile,
            discardPile,
            pendingDrawCount: 0,
            currentPlayerIndex: nextIdx,
            turnNumber: state.turnNumber + 1,
            turnStartedAt: now,
            lastAction: { type: 'DRAW_PENALTY', playerId, timestamp: now, data: { count: cardsToDraw } },
          },
          events,
        };
      }

      // Normal draw (1 card, or draw until playable if rule enabled)
      let drawnCards: Card[] = [];
      let tempDraw = state.drawPile;
      let tempDiscard = state.discardPile;

      if (state.rules.drawUntilPlayable) {
        let foundPlayable = false;
        let safetyMax = 30; // Prevent infinite loop on empty playable deck
        while (!foundPlayable && safetyMax-- > 0) {
          const { drawn, drawPile, discardPile } = drawCardsFromPile(tempDraw, tempDiscard, 1);
          tempDraw = drawPile;
          tempDiscard = discardPile;
          if (drawn.length === 0) break;
          const card = drawn[0]!;
          drawnCards.push(card);
          if (isCardPlayable(card, state, [...currentPlayer.hand, ...drawnCards]).playable) {
            foundPlayable = true;
          }
        }
      } else {
        const { drawn, drawPile, discardPile } = drawCardsFromPile(tempDraw, tempDiscard, 1);
        drawnCards = drawn;
        tempDraw = drawPile;
        tempDiscard = discardPile;
      }

      currentPlayer.hand.push(...drawnCards);
      currentPlayer.cardCount = currentPlayer.hand.length;

      events.push({
        eventType: 'CARD_DRAWN',
        playerId,
        data: { count: drawnCards.length },
        timestamp: now,
      });

      return {
        success: true,
        state: {
          ...state,
          drawPile: tempDraw,
          discardPile: tempDiscard,
          lastAction: { type: 'DRAW_CARD', playerId, timestamp: now, data: { count: drawnCards.length } },
        },
        events,
      };
    }

    case 'PASS_TURN': {
      const { playerId } = action;
      const currentPlayer = state.players[state.currentPlayerIndex];

      if (!currentPlayer || currentPlayer.id !== playerId) {
        return { success: false, state, events: [], error: 'Not your turn' };
      }

      const nextIdx = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);

      return {
        success: true,
        state: {
          ...state,
          currentPlayerIndex: nextIdx,
          turnNumber: state.turnNumber + 1,
          turnStartedAt: now,
          lastAction: { type: 'PASS_TURN', playerId, timestamp: now, data: {} },
        },
        events: [
          ...events,
          { eventType: 'TURN_PASSED', playerId, data: {}, timestamp: now },
        ],
      };
    }

    case 'CALL_UNO': {
      const { playerId } = action;
      const player = state.players.find((p) => p.id === playerId);
      if (!player) {
        return { success: false, state, events: [], error: 'Player not found' };
      }

      // Can call UNO if holding 1 or 2 cards
      if (player.cardCount <= 2) {
        player.calledUno = true;
        events.push({
          eventType: 'UNO_CALLED',
          playerId,
          data: { success: true },
          timestamp: now,
        });

        return {
          success: true,
          state: {
            ...state,
            lastAction: { type: 'CALL_UNO', playerId, timestamp: now, data: {} },
          },
          events,
        };
      }

      return { success: false, state, events: [], error: 'Cannot call UNO with more than 2 cards' };
    }

    case 'CATCH_UNO_FAILURE': {
      const { callerPlayerId, targetPlayerId } = action;
      const target = state.players.find((p) => p.id === targetPlayerId);

      if (!target) {
        return { success: false, state, events: [], error: 'Target player not found' };
      }

      // Valid catch if target has exactly 1 card and did not call UNO
      if (target.cardCount === 1 && !target.calledUno) {
        const { drawn, drawPile, discardPile } = drawCardsFromPile(
          state.drawPile,
          state.discardPile,
          2
        );
        target.hand.push(...drawn);
        target.cardCount = target.hand.length;

        events.push({
          eventType: 'UNO_PENALTY_APPLIED',
          playerId: targetPlayerId,
          data: { caughtBy: callerPlayerId, cardsDrawn: 2 },
          timestamp: now,
        });

        return {
          success: true,
          state: {
            ...state,
            drawPile,
            discardPile,
            lastAction: {
              type: 'CATCH_UNO',
              playerId: callerPlayerId,
              timestamp: now,
              data: { targetPlayerId },
            },
          },
          events,
        };
      }

      return {
        success: false,
        state,
        events: [],
        error: 'Target player called UNO or does not have 1 card',
      };
    }

    case 'CHALLENGE_WILD_FOUR': {
      const { challengerId, challenge } = action;
      if (!state.wildChallenge) {
        return { success: false, state, events: [], error: 'No active Wild Draw Four challenge' };
      }

      const { challengedPlayerId, previousColor } = state.wildChallenge;
      const challengedPlayer = state.players.find((p) => p.id === challengedPlayerId);
      const challenger = state.players.find((p) => p.id === challengerId);

      if (!challengedPlayer || !challenger) {
        return { success: false, state, events: [], error: 'Players not found for challenge' };
      }

      if (!challenge) {
        // Challenger declines challenge -> challenger takes standard 4 cards
        const { drawn, drawPile, discardPile } = drawCardsFromPile(state.drawPile, state.discardPile, 4);
        challenger.hand.push(...drawn);
        challenger.cardCount = challenger.hand.length;

        const nextIdx = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);

        return {
          success: true,
          state: {
            ...state,
            drawPile,
            discardPile,
            wildChallenge: null,
            currentPlayerIndex: nextIdx,
            turnNumber: state.turnNumber + 1,
          },
          events: [
            { eventType: 'CHALLENGE_DECLINED', playerId: challengerId, data: { count: 4 }, timestamp: now },
          ],
        };
      }

      // Resolve bluff check
      const wasBluffing = isWildDrawFourBluff(challengedPlayer.hand, previousColor);

      if (wasBluffing) {
        // Challenged player was caught bluffing! Challenged player draws 4 cards
        const { drawn, drawPile, discardPile } = drawCardsFromPile(state.drawPile, state.discardPile, 4);
        challengedPlayer.hand.push(...drawn);
        challengedPlayer.cardCount = challengedPlayer.hand.length;

        return {
          success: true,
          state: {
            ...state,
            drawPile,
            discardPile,
            wildChallenge: null,
          },
          events: [
            {
              eventType: 'CHALLENGE_WON',
              playerId: challengerId,
              data: { bluffDetected: true, penalizedPlayerId: challengedPlayerId },
              timestamp: now,
            },
          ],
        };
      } else {
        // Challenge failed! Challenger draws 4 + 2 = 6 cards and loses turn
        const { drawn, drawPile, discardPile } = drawCardsFromPile(state.drawPile, state.discardPile, 6);
        challenger.hand.push(...drawn);
        challenger.cardCount = challenger.hand.length;

        const nextIdx = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);

        return {
          success: true,
          state: {
            ...state,
            drawPile,
            discardPile,
            wildChallenge: null,
            currentPlayerIndex: nextIdx,
            turnNumber: state.turnNumber + 1,
          },
          events: [
            {
              eventType: 'CHALLENGE_LOST',
              playerId: challengerId,
              data: { cardsDrawn: 6 },
              timestamp: now,
            },
          ],
        };
      }
    }

    case 'JUMP_IN': {
      const { playerId, cardId, chosenColor } = action;
      if (!state.rules.jumpIn) {
        return { success: false, state, events: [], error: 'Jump-In rule is not enabled' };
      }

      const player = state.players.find((p) => p.id === playerId);
      if (!player) {
        return { success: false, state, events: [], error: 'Player not found' };
      }

      const cardIdx = player.hand.findIndex((c) => c.id === cardId);
      if (cardIdx === -1) {
        return { success: false, state, events: [], error: 'Card not in player hand' };
      }

      const card = player.hand[cardIdx]!;
      const topCard = state.discardPile[state.discardPile.length - 1];

      if (!topCard || !areCardsIdentical(card, topCard)) {
        return { success: false, state, events: [], error: 'Card is not identical to the discard pile card' };
      }

      // Jump-in successful: transfer turn to jumping player and play card
      const playerIdx = state.players.findIndex((p) => p.id === playerId);
      const stateWithTurn: GameState = {
        ...state,
        currentPlayerIndex: playerIdx,
      };

      events.push({
        eventType: 'JUMP_IN_OCCURRED',
        playerId,
        data: { card },
        timestamp: now,
      });

      const playResult = processAction(stateWithTurn, {
        type: 'PLAY_CARD',
        playerId,
        cardId,
        chosenColor,
      });

      return {
        ...playResult,
        events: [...events, ...playResult.events],
      };
    }

    case 'TIMEOUT_AUTO_PLAY': {
      const { playerId } = action;
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.id !== playerId) {
        return { success: false, state, events: [], error: 'Not your turn' };
      }

      // Attempt to play first legal card, or draw & pass
      const legalCard = currentPlayer.hand.find(
        (c) => isCardPlayable(c, state, currentPlayer.hand).playable
      );

      if (legalCard) {
        const chosenColor: CardColor = isWildCard(legalCard) ? 'RED' : (legalCard.color as CardColor);
        return processAction(state, {
          type: 'PLAY_CARD',
          playerId,
          cardId: legalCard.id,
          chosenColor,
        });
      }

      // Otherwise draw card
      const drawResult = processAction(state, { type: 'DRAW_CARD', playerId });
      if (drawResult.success) {
        return processAction(drawResult.state, { type: 'PASS_TURN', playerId });
      }
      return drawResult;
    }

    default:
      return { success: false, state, events: [], error: 'Unknown action type' };
  }
}
