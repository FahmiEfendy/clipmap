# Clipmap — Changelog

All notable changes to this project will be documented in this file — technical detail, dependencies, bug fixes, and what's been verified live vs. not. For a short, public-facing summary per release, see [RELEASE_NOTES.md](RELEASE_NOTES.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Tier 2 escalation: ephemeral video fetch → ffmpeg → OpenRouter (`gpt-4o-transcribe`) transcription
- Google Places Autocomplete for the low/no-confidence manual-entry state
- Backblaze B2 thumbnail storage
- Bilingual UI (`next-intl`)

---

## [0.1.0] — 2026-09-10

### Added
- Project scaffold: Next.js 16 (App Router, TypeScript, Tailwind CSS, ESLint flat config), with real Clipmap metadata (title/description) rather than the create-next-app defaults
- Prisma 7 schema and initial migration against PostgreSQL — `User`/`Account`/`Session`/`VerificationToken` (Auth.js) plus `Place`/`List`/`ListPlace`/`Tag`/`PlaceTag` domain models, with `confidenceTier` and `sourceTier` enums on `Place`
- Prisma client wired through `@prisma/adapter-pg` (Prisma 7 requires an explicit driver adapter — the implicit query-engine connection from earlier versions is gone)
- Auth.js (NextAuth v5 beta) configured with Google OAuth and email/password credentials providers, backed by the Prisma adapter; session strategy set to JWT (required alongside a credentials provider). `session.user.id` is propagated via explicit `jwt`/`session` callbacks plus a `next-auth.d.ts` type augmentation — NextAuth's default JWT session only carries `name`/`email`/`image`, so without this every auth check relying on `.id` (saving a place, running extraction) silently fails while looser `session?.user` checks keep passing. Caught by live-testing the signup → home page flow, not by the build or type-check.
- `.env.example` documenting every environment variable the app and its planned pipeline need
- Core extraction pipeline (Tier 0/1 only — Tier 2 escalation not yet built): TikTok page fetch → POI tag or caption+vision LLM guess (OpenRouter) → Google Places grounding → confidence tier (`HIGH`/`MEDIUM`/`LOW`/`NONE`)
- "Paste TikTok URL" add-place flow (`/add`) — confidence-based confirm screen (prefilled for HIGH/MEDIUM, manual entry for LOW/NONE), save action, "View on Google Maps" link built from the Google Place ID
- Home page (`/`) listing the signed-in user's saved places
- Minimal email/password signup and login pages, needed to exercise the add-place flow end to end (`Place.userId` is required)
- Deployment config matching the `electricity-tracker` pattern: `app/Dockerfile` (multi-stage, standalone Next.js output, non-root user), `app/docker-entrypoint.sh` (runs `prisma migrate deploy` before starting the server), `apps/clipmap/docker-compose.yml`, `deploy.sh`, `update-env.sh`. `next.config.ts` now sets `output: "standalone"`, required for the Docker build.
- Subdomain decided and nginx reverse-proxy config added (`infra/nginx/conf.d/clipmap.conf`, → `clipmap-app:3000`) for `clipmap.fahmiefendy.dev`; documented in the root `README.md`, `docs/cloudflare/DNS.md`, and `docs/cloudflare/TUNNEL.md`. The Cloudflare Tunnel route itself is dashboard-managed and still needs confirming — see `docs/TODO.md`.

### Notes
- PostGIS was deliberately left out of this migration — the shared `db-postgres` instance runs plain `postgres:17-alpine`, which doesn't bundle the extension. Deferred until "near me" search is actually built; see `docs/TODO.md`.
- Runs against a dedicated `clipmap` database on the homeserver's shared Postgres instance (reached locally through an existing SSH tunnel on port 5432 during development), not a local throwaway database.
- Verified live: the full signup → session cookie → auth-gated page flow, and a `Place` create/read against the real database (`@prisma/adapter-pg` + `@prisma/client`) — both by directly exercising the running dev server and the Prisma client, since no browser automation was available this session.
- **Not verified live:** the TikTok page-fetch, OpenRouter, and Google Places calls — no API keys were available yet. This environment's outbound requests to TikTok are also WAF-blocked (bot challenge page, no real content), so even the fetch step needs testing from the homeserver's own network, not from here.
- The TikTok POI/location-tag field name (`itemStruct.poiInfo`/`.anchors`) is an educated guess based on published scraping references, not confirmed against a live page — see the comment in `src/lib/tiktok.ts`.
- The Docker image was built and run locally against the real homeserver database (via the SSH tunnel) — `docker-entrypoint.sh` correctly ran `prisma migrate deploy` and the app served `200` on `/`. **Not yet verified:** actually deploying through `docker-compose.yml` behind the homeserver's Nginx/Cloudflare Tunnel — there's no GHCR image published yet (no CI, no GitHub repo for this project so far) and no subdomain/nginx route decided.

---

## [0.0.0] — 2026-09-10

### Added
- Project planning completed — extraction pipeline designed across four confidence tiers (HIGH / MEDIUM / LOW / NONE), tech stack selected (Next.js, PostgreSQL + PostGIS, Prisma, Auth.js, OpenRouter, Backblaze B2), and documentation structure established.
- Product name decided: **Clipmap**.
