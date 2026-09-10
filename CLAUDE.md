# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev            # dev server (Turbopack), localhost:3000
npm run build           # production build (standalone output)
npm run start           # run the production build
npm run lint             # ESLint (flat config)
npx tsc --noEmit         # type-check only

npx prisma migrate dev --name <description>   # create + apply a migration
npx prisma migrate deploy                     # apply pending migrations (used by docker-entrypoint.sh)
npx prisma generate                           # regenerate the client after schema changes, without migrating
```

No test suite exists yet.

**Database access requires an SSH tunnel.** This app runs against a dedicated `clipmap` database on the homeserver's shared `db-postgres` instance — not a local database. In dev, `DATABASE_URL` points at `localhost:5432`, which only works while an SSH tunnel to the homeserver is open. If Prisma commands fail with `ECONNREFUSED`, the tunnel has dropped — re-establish it before assuming a code or schema problem.

## Architecture

**Prisma 7 requires an explicit driver adapter.** `new PrismaClient()` alone throws — it must be constructed with a driver adapter (`src/lib/prisma.ts` uses `@prisma/adapter-pg`). The CLI's own config file is `prisma7.config.ts` (not `prisma.config.ts`), which is where `DATABASE_URL` is read from via `dotenv/config` — `schema.prisma` itself has no `url = env(...)` line. Client output goes to `src/generated/prisma/` (gitignored), imported as `@/generated/prisma/client`, not from `@prisma/client` directly.

**Auth.js `session.user.id` is not automatic.** `src/auth.ts` uses the JWT session strategy (required because a Credentials provider is present). NextAuth's default JWT session only carries `name`/`email`/`image` — `id` is explicitly copied token→session via the `jwt`/`session` callbacks, matched by a type augmentation in `src/types/next-auth.d.ts`. Any auth check that needs the user's id must check `session.user.id` specifically, not just `session.user` truthiness — the latter passes even when `.id` is absent, which previously broke saving places silently (see the `[0.1.0]` entry in `docs/CHANGELOG.md`).

**Extraction pipeline** (`src/lib/`), invoked from `src/app/actions/places.ts`:
1. `tiktok.ts` — fetches the TikTok video page and parses the `__UNIVERSAL_DATA_FOR_REHYDRATION__` script tag for caption, hashtags, cover images, and a best-effort POI/location tag. This is unofficial page-scraping, not an API — TikTok's WAF blocks non-browser traffic from some environments (confirmed to fail from sandboxed dev environments; only verified working from the homeserver's own network).
2. `openrouter.ts` — vision-LLM extraction (structured JSON response) from caption + hashtags + cover images, used when no POI tag is present. The model is read from `OPENROUTER_VISION_MODEL` (no hardcoded default — model slugs shift too often to bake one in).
3. `places.ts` — grounds a place name against Google Places (Find Place for a trusted POI name, Text Search for an LLM guess) and builds the `place_id`-based Google Maps deep link (no Maps SDK needed).
4. `extraction.ts` — orchestrates 1–3 into a `ConfidenceTier` (`HIGH`/`MEDIUM`/`LOW`/`NONE`) and `SourceTier` (`POI_TAG`/`CAPTION_VISION`/`ESCALATION`/`MANUAL`), which decides whether `/add`'s confirm screen is prefilled or a manual-entry fallback. Tier 2 escalation (video download, audio transcription, frame OCR) is designed but not implemented — anything that doesn't resolve via POI tag or caption+vision lands as `LOW`/`NONE`.

**Mutations are Server Actions** (`src/app/actions/`), not API routes — `auth.ts` (signup/login/Google sign-in) and `places.ts` (extraction + save). `/add` splits a Server Component (`page.tsx`, does the auth redirect + layout) from a Client Component (`add-place-form.tsx`, the two-phase paste→extract→confirm→save UI using `useTransition`); the signup/login pages instead use `useActionState` since they're single-phase forms with pending/error state.

**Deployment config lives one level up**, at `apps/clipmap/` (sibling to this `app/` directory) in the parent `homeserver` repo — `docker-compose.yml`, `deploy.sh`, `update-env.sh`. This `app/` directory is its own git repo (pushed to github.com/FahmiEfendy/clipmap); the parent repo only holds the config that deploys it, matching the convention every other app under `homeserver/apps/` uses. The two never share git history.

**Docs** (`docs/`): `TODO.md` tracks only pending work — completed items are removed, not checked off, since history lives in the changelog instead. `CHANGELOG.md` is the detailed technical record (dependency gotchas, bug fixes, what's verified live vs. not). `RELEASE_NOTES.md` is a short public-facing summary per version, meant to be pasted directly into a GitHub Release.
