# Database Architecture

The platform uses **PostgreSQL** managed with **Prisma ORM**.

## Core Entity Domains

### 1. Identity & Profile
- `User`: NextAuth accounts, roles (`USER`, `MODERATOR`, `ADMIN`).
- `Profile`: Display names, rating/tier, XP, level, currency (Coins/Gems), lifetime statistics (cards played, wilds played, uno calls, etc.).

### 2. Social & Moderation
- `Friendship`, `FriendRequest`, `Block`
- `ChatMessage`: Channel-scoped chat (ROOM, LOBBY, CLUB, TOURNAMENT).
- `Report`: Player incident reports and evidence links.
- `AdminAuditLog`: Moderator and admin actions (ban, mute, delete room).

### 3. Rooms & Real-Time Matches
- `Room`: Code, privacy, custom rule JSON, max player slots.
- `RoomPlayer`: Player slot allocations, ready states, bot attributes.
- `Game`: Match lifecycle, winner, turn count, settings snapshot.
- `GamePlayer`: Game participant results, XP/Coins earned, cards played.
- `GameEvent`: Event-sourced log of every action for full replay fidelity.

### 4. Tournaments & Seasons
- `Tournament`: Single/Double elimination, Swiss formats, prize pools.
- `TournamentPlayer`: Registration, seeds, check-ins.
- `TournamentMatch`: Brackets and match linkage.
- `Season` & `UserSeasonProgress`: Seasonal ELO ladders and tiered rewards.

### 5. Clubs & Clan Wars
- `Club`, `ClubMember`: Club levels, XP contributions, roles (`OWNER`, `ADMIN`, `MEMBER`).
- `ClubWar`, `ClubWarMatch`: Clan vs Clan competitive matchups.

### 6. Custom Content & Economy
- `BotConfig`: User-configured AI strategies with aggression, bluff, and defense biases.
- `CustomDeck`, `CustomCard`: Community deck creator.
- `Cosmetic`, `UserInventory`, `CurrencyTransaction`: Virtual currency ledgers and cosmetic skins.
