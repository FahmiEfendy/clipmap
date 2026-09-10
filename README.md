# Clipmap

Paste a TikTok link, get a saved, mapped place — no more "places to go" bookmarks nobody reopens.

## Overview

Clipmap extracts place info (name, address, description) from a pasted TikTok URL through a tiered pipeline — POI tag → caption + vision LLM → escalation (audio/frame extraction) — grounds it against Google Places, and saves it to the user's personal list/map. See [`docs/TODO.md`](docs/TODO.md) for the full roadmap and [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for what's shipped.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** PostgreSQL, via Prisma 7 (driver adapter: `@prisma/adapter-pg`)
- **Auth:** Auth.js (NextAuth v5) — Google OAuth + email/password credentials
- **Styling:** Tailwind CSS
- **LLM extraction:** OpenRouter (vision extraction + `gpt-4o-transcribe` for Tier 2 escalation)
- **Image storage:** Backblaze B2 (S3-compatible)
- **i18n:** next-intl (Indonesian + English) — not yet wired up

## Directory Structure

```
app/
├── src/
│   ├── app/              # App Router routes
│   │   └── api/auth/[...nextauth]/route.ts   # Auth.js route handler
│   ├── auth.ts           # Auth.js config (providers, adapter, session strategy)
│   ├── lib/
│   │   └── prisma.ts     # Prisma client singleton (dev-safe, driver-adapter based)
│   └── generated/prisma/ # Generated Prisma client (gitignored)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── prisma7.config.ts     # Prisma CLI config (schema path, migrations path, datasource URL)
├── docs/
│   ├── TODO.md
│   └── CHANGELOG.md
└── .env.example
```

## Environment Variables

See [`.env.example`](.env.example) for the full list — copy it to `.env` and fill in:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Session/JWT signing secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials |
| `OPENROUTER_API_KEY` | LLM extraction + Tier 2 transcription |
| `GOOGLE_PLACES_API_KEY` | Places grounding (Find Place / Text Search) |
| `B2_*` | Backblaze B2 thumbnail storage |

## Local Development

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Apply the database schema
npx prisma migrate dev

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Schema lives in [`prisma/schema.prisma`](prisma/schema.prisma). Key models:

- `User` / `Account` / `Session` / `VerificationToken` — Auth.js's standard Prisma adapter tables
- `Place` — a saved place, with `confidenceTier` (`HIGH`/`MEDIUM`/`LOW`/`NONE`) and `sourceTier` (`POI_TAG`/`CAPTION_VISION`/`ESCALATION`/`MANUAL`) tracking how it was extracted
- `List` / `ListPlace` — user-organized collections of places
- `Tag` / `PlaceTag` — free-form tagging

```bash
# After changing schema.prisma
npx prisma migrate dev --name <description>

# Regenerate the client without migrating
npx prisma generate
```

> PostGIS-backed geospatial queries ("places near me") are deferred — see the Decisions section in `docs/TODO.md`.

## Deployment

Not yet configured. Once ready, this will follow the single-container pattern used by other apps in this homeserver (see the repo root `README.md`) — a `docker-compose.yml` and `Dockerfile` alongside this `app/` directory, deployed behind the shared Nginx/Cloudflare Tunnel setup.
