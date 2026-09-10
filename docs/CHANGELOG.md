# Clipmap — Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Core extraction pipeline: TikTok page fetch → POI tag / caption+vision extraction → Google Places grounding → confidence-based confirm screen
- Tier 2 escalation: ephemeral video fetch → ffmpeg → OpenRouter (`gpt-4o-transcribe`) transcription
- Backblaze B2 thumbnail storage
- Bilingual UI (`next-intl`)

---

## [0.1.0] — 2026-09-10

### Added
- Project scaffold: Next.js 16 (App Router, TypeScript, Tailwind CSS, ESLint flat config)
- Prisma 7 schema and initial migration against PostgreSQL — `User`/`Account`/`Session`/`VerificationToken` (Auth.js) plus `Place`/`List`/`ListPlace`/`Tag`/`PlaceTag` domain models, with `confidenceTier` and `sourceTier` enums on `Place`
- Prisma client wired through `@prisma/adapter-pg` (Prisma 7 requires an explicit driver adapter — the implicit query-engine connection from earlier versions is gone)
- Auth.js (NextAuth v5 beta) configured with Google OAuth and email/password credentials providers, backed by the Prisma adapter; session strategy set to JWT (required alongside a credentials provider)
- `.env.example` documenting every environment variable the app and its planned pipeline need

### Notes
- PostGIS was deliberately left out of this migration — the shared `db-postgres` instance runs plain `postgres:17-alpine`, which doesn't bundle the extension. Deferred until "near me" search is actually built; see `docs/TODO.md`.
- Runs against a dedicated `clipmap` database on the homeserver's shared Postgres instance (reached locally through an existing SSH tunnel on port 5432 during development), not a local throwaway database.

---

## [0.0.0] — 2026-09-10

### Added
- Project planning completed — extraction pipeline designed across four confidence tiers (HIGH / MEDIUM / LOW / NONE), tech stack selected (Next.js, PostgreSQL + PostGIS, Prisma, Auth.js, OpenRouter, Backblaze B2), and documentation structure established.
- Product name decided: **Clipmap**.
