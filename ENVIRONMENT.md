# Environment Configuration Reference

All application configuration is validated at runtime using Zod via `src/lib/env.ts`.

| Variable | Required | Description | Source / Provider | Example Value |
| :--- | :---: | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or Docker | `postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | Yes | Direct connection for Prisma migrations | Same provider as DATABASE_URL | `postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require` |
| `REDIS_URL` | Yes | Redis connection string | [Upstash](https://upstash.com), [Aiven](https://aiven.io), or Docker | `rediss://default:token@us1-panda.upstash.io:6379` |
| `NEXTAUTH_SECRET` | Yes | Session token encryption secret | `openssl rand -base64 32` | `zP+1gX29s90xK4mLPq0Wv1L19kC3aQ8e7gX9...` |
| `AUTH_SECRET` | Yes | Auth.js secret alias | Same as `NEXTAUTH_SECRET` | `zP+1gX29s90xK4mLPq0Wv1L19kC3aQ8e7gX9...` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Client ID | [Google Cloud Console](https://console.cloud.google.com) | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth 2.0 Client Secret | [Google Cloud Console](https://console.cloud.google.com) | `GOCSPX-xxxxxxxxxxxxxxxx` |
| `NEXTAUTH_URL` | Yes | Canonical base application URL | Local or Production Host | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL for invites & redirects | Local or Production Host | `http://localhost:3000` |
| `NEXT_PUBLIC_SOCKET_SERVER_URL` | Yes | Socket.IO server URL | Local port 3001 or deployed server | `http://localhost:3001` |
| `NODE_ENV` | No | Runtime environment | Node runtime | `development` / `production` |

For step-by-step setup instructions, please see the [README.md](README.md#%EF%B8%8F-environment-variables-guide).
