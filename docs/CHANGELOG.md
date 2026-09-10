# Clipmap — Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Initial project scaffold (Next.js + TypeScript + Prisma + PostgreSQL/PostGIS)
- Core extraction pipeline: TikTok page fetch → POI tag / caption+vision extraction → Google Places grounding → confidence-based confirm screen
- Tier 2 escalation: ephemeral video fetch → ffmpeg → OpenRouter (`gpt-4o-transcribe`) transcription
- Auth via Auth.js (email/password + Google OAuth)

---

## [0.0.0] — 2026-09-10

### Added
- Project planning completed — extraction pipeline designed across four confidence tiers (HIGH / MEDIUM / LOW / NONE), tech stack selected (Next.js, PostgreSQL + PostGIS, Prisma, Auth.js, OpenRouter, Backblaze B2), and documentation structure established.
- Product name decided: **Clipmap**.
