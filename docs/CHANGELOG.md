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

## [0.1.1] — 2026-09-11

### Added
- `PasswordInput` component (`src/components/password-input.tsx`) — show/hide toggle (eye icon), used on every password field
- `GoogleAuthButton` component (`src/components/google-auth-button.tsx`) — divider + "Continue with Google", deduplicated and now shown on both `/login` and `/signup` (previously login-only, even though Google sign-in already creates a new account on first use via the Prisma adapter)
- Signup: retype-password field with live mismatch/length validation — checked on blur/change, submit disabled until valid
- Home page: a TikTok URL search bar (replacing the old "Add a place" button) that submits to `/add?url=...`, which now prefills and auto-runs extraction on load — with a spinner + status line while it works, since there was previously no feedback beyond the button label
- Home page: user avatar + name (`UserMenu` component) in the header — click it to reveal a "Sign out" option, replacing an always-visible button
- `canExtract` and `isActive` boolean columns on `User` (`@default(true)`) — per-user kill switches for a small group of test users. `canExtract` blocks just the extraction pipeline (`runExtraction` checks it live); `isActive` signs the user out of the whole app, checked on every request inside the `jwt` callback rather than cached — since JWT sessions have no server-side record to revoke otherwise, this is what makes disabling someone take effect on their very next request instead of requiring `AUTH_SECRET` rotation (which would sign everyone out) or switching to database sessions (which Credentials sign-in can't use). Verified live: disabled a real session mid-flight and confirmed the same cookie was treated as logged out on the next request, no re-login involved.
- A large, bold, centered `Clipmap` brand label above the page heading on `/login`, `/signup`, and `/add`, so navigating between pages reads as one app
- Global error boundary (`src/app/error.tsx`) — an uncaught render failure (e.g. the database going unreachable) now shows a friendly "Something went wrong" screen with a retry button instead of Next's raw dev error overlay, and logs the underlying error
- `src/lib/errors.ts` — `isDatabaseUnreachableError()`, used to tell infrastructure failures apart from user-input errors

### Fixed
- **Login/signup showed "Invalid email or password" even when the real cause was the database being unreachable** (e.g. the dev SSH tunnel dropping) — `login`/`signup` now distinguish `CredentialsSignin` (genuinely wrong password) from any other `AuthError`, and `authorize()`/the initial signup lookup log a clear cause instead of a bare Prisma stack trace reaching the console.
- **Email/name fields were wiped after a failed login or signup attempt** — React resets *uncontrolled* form fields once a Server Action completes (native-form-like behavior). `email` (and `name`, `password`, `confirmPassword`) are now controlled inputs; only `password` is deliberately cleared after a failed login.
- **Two `useEffect` hooks called `setState` synchronously in the effect body** (password-reset-on-error in `/login`, auto-extract-on-mount in `/add`) — a cascading-render anti-pattern caught by `npm run lint`, not manual review. Fixed the former with React's "adjust state during render" pattern instead of an Effect; fixed the latter by moving the synchronous resets out of the effect path.
- Inconsistent page width/padding — `/login` and `/signup` had drifted (through several rounds of tightening) to `max-w-md`/`px-3` while `/` and `/add` were still on the original `max-w-lg`/`px-4`. All four pages now share one container: `w-full max-w-2xl px-6`.
- `/add`'s extraction error message rendered below the "Extract" button instead of next to the field it relates to.
- Primary buttons (`bg-black`) were nearly invisible in dark mode, blending into the page's near-black background — added `dark:bg-white dark:text-black` so they invert and stay visible against either background.
- Logged-in users could still open `/login` or `/signup` and see the form — both now check the session server-side and redirect to `/` if already authenticated, mirroring `/add`'s existing pattern (a Server Component wrapper doing the redirect, a Client Component — `login-form.tsx`/`signup-form.tsx` — for the interactive form).
- **Google sign-in errors (e.g. `OAuthAccountNotLinked`, when an email already has a credentials account) rendered Auth.js's own generic built-in error page** instead of the app's styled `/login` — Auth.js falls back to its default UI for any flow it can't hand back to a custom page unless one is explicitly configured. Added `pages: { signIn: "/login", error: "/login" }` to the NextAuth config, plus an `AUTH_ERROR_MESSAGES` mapping on `/login` that turns known Auth.js error codes into a friendly, page-specific message instead of a raw code in the URL.
- **The OpenRouter free model originally recommended for vision extraction (`google/gemma-4-31b-it:free`) doesn't actually support structured JSON output** — its only available endpoint rejected `response_format: json_schema` with a 404 ("no endpoints found... filter by parameters"), discovered only once real API calls were tested rather than from the model's listed capabilities. Switched to `dots-studio/dots-3-note-preview:free`, verified working against the exact request shape this app sends, and added `provider: { require_parameters: true }` so OpenRouter refuses to silently route to a non-compliant endpoint if this happens again with a future model swap.
- **The saved-places list on `/` laid out each card's thumbnail beside unclamped text**, so a long address or description could stretch a card far past its neighbors and make the list look broken. Each `<li>` is now a stacked layout — name, then a full-width bordered/shadowed thumbnail, then `line-clamp`ed address/description, then the action links — and the "Nothing saved yet…" empty-state line was removed in favor of just rendering nothing.

### Notes
- `AddPlaceForm` had near-identical extraction logic duplicated between the manual "Extract" button handler and the auto-extract-on-mount effect; consolidated into a shared `extract()` helper.
- Migration history for `canExtract`/`isActive` (originally two incremental migrations) was squashed back into `20260910143950_init`'s `CREATE TABLE "User"` for a clean history — verified with a read-only `prisma migrate status` check afterward ("Database schema is up to date!"), no reset or data changes against the live database.
- First real end-to-end live verification of the full extraction pipeline (TikTok fetch → OpenRouter vision extraction → Google Places grounding) succeeded this session on a real TikTok URL, superseding 0.1.0's "not verified live" note for that path.

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
