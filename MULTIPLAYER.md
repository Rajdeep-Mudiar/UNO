# Real-Time Multiplayer Specification

## Protocol & Architecture

Multiplayer communication is powered by **Socket.IO** with Redis pub/sub state synchronization.

### Event Protocol (Client to Server)
- `room:join` `{ roomId, password? }`
- `room:leave` `{ roomId }`
- `room:set_ready` `{ isReady }`
- `room:start_game` `{}`
- `game:play_card` `{ cardId, chosenColor?, targetSwapPlayerId? }`
- `game:draw_card` `{}`
- `game:pass_turn` `{}`
- `game:call_uno` `{}`
- `game:catch_uno` `{ targetPlayerId }`
- `game:challenge_wild_four` `{ challenge: boolean }`
- `game:jump_in` `{ cardId, chosenColor? }`
- `chat:send` `{ message, channelType, channelId }`
- `emote:send` `{ emoteKey }`

### Event Protocol (Server to Client)
- `room:updated` -> Current room metadata & lobby slots
- `game:started` -> Initial masked public game state
- `game:state_update` -> Serialized `PublicGameState`
- `game:event_broadcast` -> Individual event payload (card animation trigger)
- `game:over` -> Final scores and ranking breakdown
- `error:notification` -> Standardized error messages (`NOT_YOUR_TURN`, `INVALID_CARD`, etc.)

## Reconnection Handling

Clients maintain a session token in local storage. Upon socket disconnect, the client automatically attempts reconnection. The server restores the player's slot, re-subscribes them to the room channel, and pushes the latest `PublicGameState`.
