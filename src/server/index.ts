import http from 'http';
import { Server, Socket } from 'socket.io';
import { createGame, processAction } from '../game-engine/actions';
import { DEFAULT_RULES } from '../game-engine/rules';
import { sanitizeGameStateForPlayer, sanitizeGameStateForSpectator } from '../game-engine/serialization';
import { EngineAction, GameRuleSet, GameState } from '../game-engine/types';
import { evaluateBotAction } from '../bots/strategy';

const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

interface RoomPlayer {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  isBot: boolean;
  botDifficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  isReady: boolean;
  isHost: boolean;
}

interface ServerRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  isPrivate: boolean;
  maxPlayers: number;
  rules: GameRuleSet;
  players: RoomPlayer[];
  gameState: GameState | null;
  turnTimer: NodeJS.Timeout | null;
  timerSecondsRemaining: number;
}

const rooms = new Map<string, ServerRoom>();
const socketToRoom = new Map<string, string>();

// Create HTTP server with health check for Render
const httpServer = http.createServer((req, res) => {
  // Enable basic CORS for HTTP requests
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'uno-multiplayer-backend',
        activeRooms: rooms.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

function getPublicRoomsList() {
  return Array.from(rooms.values()).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    hostName: r.players[0]?.name || 'Host',
    hostAvatar: r.players[0]?.avatar || '👑',
    playerCount: r.players.length,
    maxPlayers: r.maxPlayers,
    isPrivate: r.isPrivate,
    ping: 25,
    rules: r.rules,
    mode: r.rules.sevenZero ? 'CHAOS 7-0' : r.rules.jumpIn ? 'JUMP-IN' : 'CUSTOM',
  }));
}

function broadcastPublicRoomsList() {
  io.emit('room:list_response', getPublicRoomsList());
}

function broadcastRoomState(room: ServerRoom) {
  io.to(room.id).emit('room:updated', {
    id: room.id,
    code: room.code,
    name: room.name,
    hostId: room.hostId,
    isPrivate: room.isPrivate,
    maxPlayers: room.maxPlayers,
    rules: room.rules,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isBot: p.isBot,
      botDifficulty: p.botDifficulty,
      isReady: p.isReady,
      isHost: p.isHost,
    })),
    inGame: !!room.gameState,
  });
  broadcastPublicRoomsList();
}

function broadcastGameState(room: ServerRoom) {
  if (!room.gameState) return;

  // Mask opponent hands for each player
  room.players.forEach((player) => {
    if (!player.isBot) {
      const publicState = sanitizeGameStateForPlayer(room.gameState!, player.id);
      io.to(player.socketId).emit('game:state_update', publicState);
    }
  });

  // Emit spectator view to room channel
  const spectatorState = sanitizeGameStateForSpectator(room.gameState);
  io.to(room.id).emit('game:spectator_update', spectatorState);
}

function handleBotTurnIfActive(room: ServerRoom) {
  if (!room.gameState || room.gameState.phase !== 'IN_PROGRESS') return;

  const currentPlayer = room.gameState.players[room.gameState.currentPlayerIndex];
  if (!currentPlayer || !currentPlayer.isBot) return;

  // Bot thinking delay
  setTimeout(() => {
    if (!room.gameState || room.gameState.phase !== 'IN_PROGRESS') return;
    const currentCheck = room.gameState.players[room.gameState.currentPlayerIndex];
    if (!currentCheck || currentCheck.id !== currentPlayer.id) return;

    try {
      const botAction = evaluateBotAction(room.gameState, currentPlayer);
      const actionResult = processAction(room.gameState, botAction);

      if (actionResult.success) {
        room.gameState = actionResult.state;
        broadcastGameState(room);

        if (actionResult.state.phase === 'GAME_OVER') {
          handleGameOver(room);
        } else {
          resetTurnTimer(room);
          handleBotTurnIfActive(room);
        }
      }
    } catch (err) {
      console.error('Error processing bot action:', err);
    }
  }, 1200);
}

function resetTurnTimer(room: ServerRoom) {
  if (room.turnTimer) {
    clearInterval(room.turnTimer);
    room.turnTimer = null;
  }

  if (!room.gameState || room.gameState.phase !== 'IN_PROGRESS') return;

  const timerDuration = room.rules.turnTimerSec || 15;
  room.timerSecondsRemaining = timerDuration;

  room.turnTimer = setInterval(() => {
    room.timerSecondsRemaining -= 1;
    io.to(room.id).emit('game:timer_tick', { seconds: room.timerSecondsRemaining });

    if (room.timerSecondsRemaining <= 0) {
      if (room.turnTimer) {
        clearInterval(room.turnTimer);
        room.turnTimer = null;
      }

      // Auto-play on timeout
      if (room.gameState && room.gameState.phase === 'IN_PROGRESS') {
        const activePlayer = room.gameState.players[room.gameState.currentPlayerIndex];
        if (activePlayer) {
          const timeoutAction: EngineAction = {
            type: 'TIMEOUT_AUTO_PLAY',
            playerId: activePlayer.id,
          };
          const res = processAction(room.gameState, timeoutAction);
          if (res.success) {
            room.gameState = res.state;
            broadcastGameState(room);
            resetTurnTimer(room);
            handleBotTurnIfActive(room);
          }
        }
      }
    }
  }, 1000);
}

function handleGameOver(room: ServerRoom) {
  if (room.turnTimer) {
    clearInterval(room.turnTimer);
    room.turnTimer = null;
  }

  io.to(room.id).emit('game:over', {
    winnerId: room.gameState?.winnerId,
    players: room.gameState?.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      rank: p.rank,
    })),
  });
}

// Socket IO Event Handling
io.on('connection', (socket: Socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 0. Get Active Public Rooms
  socket.on('room:list', () => {
    socket.emit('room:list_response', getPublicRoomsList());
  });

  // 1. Create Room
  socket.on('room:create', (payload: { name: string; isPrivate?: boolean; maxPlayers?: number; rules?: Partial<GameRuleSet>; player: { id: string; name: string; avatar?: string } }) => {
    const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const roomCode = `UNO-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const hostPlayer: RoomPlayer = {
      id: payload.player.id || socket.id,
      socketId: socket.id,
      name: payload.player.name || 'Host',
      avatar: payload.player.avatar || '👑',
      isBot: false,
      isReady: true,
      isHost: true,
    };

    const newRoom: ServerRoom = {
      id: roomId,
      code: roomCode,
      name: payload.name || 'Custom Match',
      hostId: hostPlayer.id,
      isPrivate: !!payload.isPrivate,
      maxPlayers: payload.maxPlayers || 4,
      rules: { ...DEFAULT_RULES, ...payload.rules },
      players: [hostPlayer],
      gameState: null,
      turnTimer: null,
      timerSecondsRemaining: 15,
    };

    rooms.set(roomId, newRoom);
    socketToRoom.set(socket.id, roomId);
    socket.join(roomId);

    console.log(`[Room Created] ID: ${roomId}, Code: ${roomCode}, Host: ${hostPlayer.name}`);
    socket.emit('room:created', { roomId, code: roomCode });
    broadcastRoomState(newRoom);
  });

  // 2. Join Room (By code or roomId)
  socket.on('room:join', (payload: { roomId?: string; code?: string; player: { id: string; name: string; avatar?: string } }) => {
    let targetRoom: ServerRoom | undefined;

    const queryCode = payload.code?.trim().toUpperCase();

    if (payload.roomId) {
      targetRoom = rooms.get(payload.roomId);
    } else if (queryCode) {
      targetRoom = Array.from(rooms.values()).find(
        (r) => r.code.toUpperCase() === queryCode || r.code.replace('UNO-', '') === queryCode.replace('UNO-', '')
      );
    }

    if (!targetRoom) {
      socket.emit('error:notification', { message: `Room with code "${payload.code}" not found.` });
      return;
    }

    if (targetRoom.players.length >= targetRoom.maxPlayers) {
      socket.emit('error:notification', { message: 'Room is already full.' });
      return;
    }

    // Check if player already in room
    let existingPlayer = targetRoom.players.find((p) => p.socketId === socket.id || (p.id && p.id === payload.player.id));
    if (existingPlayer) {
      existingPlayer.socketId = socket.id;
      existingPlayer.name = payload.player.name || existingPlayer.name;
      existingPlayer.avatar = payload.player.avatar || existingPlayer.avatar;
    } else {
      const newPlayer: RoomPlayer = {
        id: payload.player.id || socket.id,
        socketId: socket.id,
        name: payload.player.name || `Player ${targetRoom.players.length + 1}`,
        avatar: payload.player.avatar || '🎮',
        isBot: false,
        isReady: false,
        isHost: false,
      };
      targetRoom.players.push(newPlayer);
    }

    socketToRoom.set(socket.id, targetRoom.id);
    socket.join(targetRoom.id);

    console.log(`[Room Joined] Room: ${targetRoom.code}, Player: ${payload.player.name}`);
    socket.emit('room:joined', { roomId: targetRoom.id, code: targetRoom.code });
    broadcastRoomState(targetRoom);

    if (targetRoom.gameState) {
      socket.emit('game:state_update', sanitizeGameStateForPlayer(targetRoom.gameState, payload.player.id || socket.id));
    }
  });

  // 3. Add Bot to Room
  socket.on('room:add_bot', (payload: { difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers) return;

    const botIndex = room.players.length;
    const botPlayer: RoomPlayer = {
      id: `bot_${Date.now()}_${botIndex}`,
      socketId: `bot_socket_${botIndex}`,
      name: `AI Bot ${botIndex}`,
      avatar: ['🤖', '🦾', '👾', '🎯'][botIndex % 4] || '🤖',
      isBot: true,
      botDifficulty: payload.difficulty || 'MEDIUM',
      isReady: true,
      isHost: false,
    };

    room.players.push(botPlayer);
    broadcastRoomState(room);
  });

  // 4. Kick Player / Remove Bot
  socket.on('room:kick_player', (payload: { playerId: string }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const caller = room.players.find((p) => p.socketId === socket.id);
    if (!caller || !caller.isHost) return;

    room.players = room.players.filter((p) => p.id !== payload.playerId);
    broadcastRoomState(room);
  });

  // 5. Leave Room
  socket.on('room:leave', () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (room) {
      room.players = room.players.filter((p) => p.socketId !== socket.id);
      socket.leave(room.id);
      if (room.players.length === 0) {
        if (room.turnTimer) clearInterval(room.turnTimer);
        rooms.delete(roomId);
      } else {
        if (room.hostId === socket.id && room.players[0]) {
          room.players[0].isHost = true;
          room.hostId = room.players[0].id;
        }
        broadcastRoomState(room);
      }
    }
    socketToRoom.delete(socket.id);
    broadcastPublicRoomsList();
  });

  // 6. Set Ready
  socket.on('room:set_ready', (payload: { isReady: boolean }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (player) {
      player.isReady = payload.isReady;
      broadcastRoomState(room);
    }
  });

  // 7. Start Game
  socket.on('room:start_game', () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const caller = room.players.find((p) => p.socketId === socket.id);
    if (!caller || !caller.isHost) {
      socket.emit('error:notification', { message: 'Only host can start the game' });
      return;
    }

    // Initialize authoritative GameState
    const game = createGame({
      gameId: `game_${Date.now()}`,
      roomId: room.id,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isBot: p.isBot,
      })),
      customRules: room.rules,
    });

    room.gameState = game;
    io.to(room.id).emit('game:started', { gameId: game.gameId, roomId: room.id });
    broadcastGameState(room);
    resetTurnTimer(room);
    handleBotTurnIfActive(room);
  });

  // 8. Game Action (Play, Draw, Pass, Uno, Challenge, JumpIn)
  socket.on('game:action', (action: EngineAction) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    try {
      const result = processAction(room.gameState, action);

      if (!result.success) {
        socket.emit('error:notification', { message: result.error || 'Invalid move' });
        return;
      }

      room.gameState = result.state;
      broadcastGameState(room);

      // Emit action animations/events
      if (result.events && result.events.length > 0) {
        io.to(room.id).emit('game:events', result.events);
      }

      if (result.state.phase === 'GAME_OVER') {
        handleGameOver(room);
      } else {
        resetTurnTimer(room);
        handleBotTurnIfActive(room);
      }
    } catch (err) {
      console.error('Action error:', err);
      socket.emit('error:notification', { message: 'Internal server action error' });
    }
  });

  // 9. Chat Message
  socket.on('chat:send', (payload: { message: string; senderName?: string }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    io.to(roomId).emit('chat:broadcast', {
      senderId: socket.id,
      senderName: payload.senderName || 'Player',
      message: payload.message,
      timestamp: Date.now(),
    });
  });

  // 10. Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.players = room.players.filter((p) => p.socketId !== socket.id);
        if (room.players.length === 0) {
          if (room.turnTimer) clearInterval(room.turnTimer);
          rooms.delete(roomId);
        } else {
          // If host left, elect new host
          if (room.hostId === socket.id && room.players[0]) {
            room.players[0].isHost = true;
            room.hostId = room.players[0].id;
          }
          broadcastRoomState(room);
        }
      }
      socketToRoom.delete(socket.id);
      broadcastPublicRoomsList();
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 [UNO Multiplayer Backend] listening on port ${PORT}`);
  console.log(`🌐 [CORS Origin]: ${CORS_ORIGIN}`);
});
