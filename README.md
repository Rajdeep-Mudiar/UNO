# UNO Card Arena — Multiplayer Platform

An original, competitive, real-time multiplayer card gaming platform built with **Next.js**, **TypeScript**, **Socket.IO**, **Prisma**, **PostgreSQL**, and a standalone server-authoritative game engine.

---

## 🎮 Key Features

- **Pure TypeScript Game Engine**: Server-authoritative state transitions, deterministic rule validation, draw stacking (+2 on +2, +4 on +4), jump-in reactions, 7-0 swaps, and wild bluff challenges.
- **Google OAuth Authentication (`/login`)**: Seamless 1-click Google Sign-In with automatic player profile & stats creation.
- **Real-Time Multiplayer Rooms (`/rooms`)**: Create custom private lobbies with friends, customize house rules, and invite opponents with instant room codes.
- **Live Tournaments & Brackets (`/tournaments`)**: Single/Double elimination and Swiss format tournaments with automated bracket visualization and prize pools.
- **Cosmetics Store & Arsenal (`/store`)**: Unlock holographic card skins, retro animated card backs, volcanic mats, and avatar frames with in-game coins and gems.
- **Clubs & Clan Wars (`/clubs`)**: Form or join syndicates, earn weekly contribution points, unlock guild-wide coin multipliers, and compete in weekend clan wars.
- **Global Leaderboards (`/leaderboard`)**: Seasonal ELO rating ladders from Bronze to Grandmaster with win-streak tracking.
- **AI Arena & Bot Builder (`/bots`)**: Strategic bots with configurable aggression, defense bias, risk tolerance, and color preferences.
- **Deck & Rule Creator (`/creator`)**: Design custom cards, special actions, and specialized decks.
- **Anti-Cheat State Masking**: Opponent hands are strictly masked on the server before client projection.

---

## ⚙️ Environment Variables Guide

All application configuration is validated at runtime using Zod. Copy `.env.example` to `.env` and configure each variable according to the instructions below:

```bash
cp .env.example .env
```

| Variable | Required | Description | Where to Get the Value |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | **Neon.tech**, **Supabase**, **Railway**, or **Local Docker** *(See below)* |
| `DIRECT_URL` | **Yes** | Direct non-pooled PostgreSQL URL | Provided alongside `DATABASE_URL` in Neon/Supabase for running migrations |
| `REDIS_URL` | **Yes** | Redis connection URI for pub/sub & session caches | **Upstash** (Free Cloud Redis), **Aiven**, or **Local Docker** |
| `NEXTAUTH_SECRET` | **Yes** | Secret key to encrypt Auth.js session cookies | Generated locally via `openssl rand -base64 32` |
| `AUTH_SECRET` | **Yes** | Alias fallback for Auth.js | Same value as `NEXTAUTH_SECRET` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Client ID | Google Cloud Console *(See below)* |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth 2.0 Client Secret | Google Cloud Console *(See below)* |
| `NEXTAUTH_URL` | **Yes** | Canonical base application URL | `http://localhost:3000` (Local) or `https://your-domain.com` (Production) |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Frontend public URL for invite links | `http://localhost:3000` (Local) or `https://your-domain.com` (Production) |
| `NEXT_PUBLIC_SOCKET_SERVER_URL` | **Yes** | Socket.IO server endpoint | `http://localhost:3001` (Local) or your deployed WebSocket server |
| `NODE_ENV` | No | Node environment mode | `development` (Default) or `production` |

---

### Detailed Setup for Each Service

#### 1. Google OAuth Authentication (`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`)

To enable **Google Sign-In**:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `UNO Card Arena`).
3. In the sidebar, navigate to **APIs & Services** → **OAuth consent screen**:
   - User Type: **External**.
   - App Name: `UNO Card Arena`.
   - User Support Email & Developer Contact: Your email.
   - Save and Continue through Scopes (default `email`, `profile`, `openid` are selected).
4. Navigate to **APIs & Services** → **Credentials**:
   - Click **+ CREATE CREDENTIALS** → Select **OAuth client ID**.
   - Application Type: **Web application**.
   - Name: `UNO Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - *(Add your production domain e.g. `https://your-app.vercel.app` when deployed)*
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - *(Add `https://your-app.vercel.app/api/auth/callback/google` for production)*
   - Click **Create**.
5. Copy the generated **Client ID** and **Client Secret** into `.env`:
   ```env
   GOOGLE_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
   ```

---

#### 2. PostgreSQL Database (`DATABASE_URL` & `DIRECT_URL`)

Choose one of the following options:

- **Option A: Neon (Recommended Free Serverless Postgres)**
  1. Go to [neon.tech](https://neon.tech) and sign up for a free account.
  2. Create a new project named `uno-arena`.
  3. On your project dashboard, copy the **Connection details**:
     - Use the **Pooled connection** string for `DATABASE_URL`.
     - Use the **Direct connection** string for `DIRECT_URL`.
     - Example: `postgresql://alex:abc123xyz@ep-fancy-tree-12345.us-east-2.aws.neon.tech/neondb?sslmode=require`

- **Option B: Supabase (Free Managed Postgres)**
  1. Go to [supabase.com](https://supabase.com) and create a project.
  2. Go to **Project Settings** → **Database** → **Connection String**.
  3. Select **URI** mode and copy the connection string.
  4. Example: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

- **Option C: Local Docker**
  Run the official Postgres Docker image:
  ```bash
  docker run --name uno-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=uno_game -p 5432:5432 -d postgres
  ```
  Set in your `.env`:
  ```env
  DATABASE_URL="postgresql://postgres:password@localhost:5432/uno_game?schema=public"
  DIRECT_URL="postgresql://postgres:password@localhost:5432/uno_game?schema=public"
  ```

---

#### 3. Redis Cache & Pub/Sub (`REDIS_URL`)

- **Option A: Upstash (Recommended Free Cloud Redis)**
  1. Go to [upstash.com](https://upstash.com) and sign up for a free account.
  2. Click **Create Database** → Select **Redis**.
  3. Under the **Connect to your database** section, copy the `rediss://...` connection URL.
  4. Example: `rediss://default:your_token_here@us1-cool-panda-12345.upstash.io:6379`

- **Option B: Local Docker**
  Run Redis locally:
  ```bash
  docker run --name uno-redis -p 6379:6379 -d redis:alpine
  ```
  Set in your `.env`:
  ```env
  REDIS_URL="redis://localhost:6379"
  ```

---

#### 4. Authentication Secrets (`NEXTAUTH_SECRET` & `AUTH_SECRET`)

Generate a secure 32-byte cryptographic random key using any terminal:

- **Linux / macOS / Git Bash**:
  ```bash
  openssl rand -base64 32
  ```
- **Windows PowerShell**:
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
  ```
- **Node.js**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

Paste the generated string into both `NEXTAUTH_SECRET` and `AUTH_SECRET` in `.env`.

---

#### 5. App & WebSocket URLs

- **Local Development**:
  ```env
  NEXTAUTH_URL="http://localhost:3000"
  NEXT_PUBLIC_APP_URL="http://localhost:3000"
  NEXT_PUBLIC_SOCKET_SERVER_URL="http://localhost:3001"
  ```
- **Production (Vercel / Railway / Render)**:
  ```env
  NEXTAUTH_URL="https://your-domain.com"
  NEXT_PUBLIC_APP_URL="https://your-domain.com"
  NEXT_PUBLIC_SOCKET_SERVER_URL="https://socket.your-domain.com"
  ```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, GOOGLE_CLIENT_ID, and NEXTAUTH_SECRET as explained above
```

### 3. Generate Database Client & Push Schema
```bash
npm run db:generate
npm run db:push
```

### 4. Run Tests
```bash
npm run test:run
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start playing!

---

## 🧪 Testing & Validation

```bash
# Run all unit tests
npm run test:run

# Run tests in watch mode
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```
