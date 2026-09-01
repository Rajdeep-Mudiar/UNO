# Game Engine Specification

The game engine is 100% pure TypeScript, synchronous, deterministic, and isolated in `src/game-engine/`.

## Card Hierarchy & Identification

Each card is assigned a globally unique ID formatted as `${color}_${type}_${value}_${seq}_${rand}`.
Card comparison operations never rely solely on color or type string equality.

### Card Composition (108 Standard Cards)
- **Red, Blue, Green, Yellow** (25 cards each):
  - 1x Number '0'
  - 2x Numbers '1' through '9'
  - 2x 'Skip' cards
  - 2x 'Reverse' cards
  - 2x 'Draw Two' cards
- **Wild Cards**:
  - 4x Standard 'Wild'
  - 4x 'Wild Draw Four'

## Configurable Rules Engine (`GameRuleSet`)

Hosts can customize match configurations:
- `stackDrawTwo`: Stack +2 cards to accumulate pending draw penalty.
- `stackWildDrawFour`: Stack +4 cards to accumulate pending draw penalty.
- `jumpIn`: Play an exact duplicate card immediately out of turn.
- `sevenZero`: Playing '7' enables swapping hands with any player; playing '0' rotates hands in play direction.
- `drawUntilPlayable`: Continue drawing from deck until a playable card is received.
- `wildDrawFourChallenge`: Challenge opponent's +4 to check if they held a card of the active color (bluff penalty).
- `startingHandSize`: Default 7 (configurable 3-15).
- `turnTimerSec`: Default 15s (configurable 5-60s or unlimited).

## State Sanitization & Anti-Cheat

```ts
sanitizeGameStateForPlayer(state: GameState, playerId: string): PublicGameState
```
Strips private opponent card information before broadcasting state across WebSockets. Opponents receive only card counts, calledUno state, and active public attributes.
