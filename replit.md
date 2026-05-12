# Clash — AI Debate Arena

An AI-powered debate arena where players argue topics against AI opponents or human challengers in real-time 1v1 rooms.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/clash run dev` — run the React frontend (Vite dev server)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (requires NEON_DATABASE_URL)

## Required Secrets

- `NEON_DATABASE_URL` — Neon PostgreSQL connection string (paste from Neon dashboard)
- `ANTHROPIC_API_KEY` — Anthropic API key for Claude AI judging
- `JWT_SECRET` — Secret for signing auth JWTs (any random string)

## Stack

- pnpm workspaces, Node.js 20, TypeScript
- API: Express 5
- DB: PostgreSQL (Neon serverless) + Drizzle ORM — lazy init (server starts without DB, routes fail gracefully)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: Claude (claude-sonnet-4-6) via `@workspace/integrations-anthropic-ai`
- Build: esbuild (CJS bundle)
- Frontend: React 19 + Vite 7

## Where things live

- `artifacts/clash/src/App.tsx` — entire frontend (~3800+ lines)
- `artifacts/api-server/src/routes/` — Express route handlers
  - `auth.ts` — email+password auth (bcrypt+JWT)
  - `rooms.ts` — 1v1 multiplayer room lifecycle + AI judging
  - `debate.ts` — vs-AI debate (single player)
  - `players.ts` — player profiles
- `lib/db/src/schema/` — Drizzle schema (players, debates, rooms, room_arguments, users, topic_votes)
- `render.yaml` — Render.com deployment config

## Architecture decisions

- DB is lazy-initialized: the proxy in `lib/db/src/index.ts` throws only when db is actually accessed, letting the server start without NEON_DATABASE_URL
- JWT_SECRET is exported from `routes/auth.ts` and imported in `routes/rooms.ts` for shared auth verification
- 1v1 rooms support both JWT auth (registered users) and device-ID fallback (guests)
- All CSS injected via a `<style>` tag on mount (no external CSS file) for simplicity
- Frontend polls `/api/rooms/:code` every 2s when in multiplayer screens

## Product

- **vs AI**: Debate 6 AI opponents with distinct personas and difficulty levels. 3 rounds each. Score 0-100 with logic/persuasion/delivery breakdown. Letter grades S-F, IQ score.
- **1v1 vs Human**: Create a room, get a 6-char code, share with a friend. AI judges both sides with argument highlights showing strong/weak/wrong/fallacy phrases.
- **Gauntlet Mode**: 6 opponents back-to-back, no respawn.
- **Auth**: Email+password registration. JWT stored in localStorage. Guest play supported.
- **Leaderboard**: ELO-based global rankings.

## User preferences

- No emojis in code comments
- Keep all CSS in the single `css` template literal in App.tsx

## Gotchas

- `NEON_DATABASE_URL` must be set in Replit Secrets for any DB operations to work
- Run `pnpm --filter @workspace/db run push` after setting NEON_DATABASE_URL to create all tables
- The simulate.ts route file exists but is empty (`export {};`) — do not import it as a default import
- Frontend Vite dev server runs on a random high port (e.g. 20285) — check workflow logs for actual port

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
