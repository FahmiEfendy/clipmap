# Clipmap — TODO

## 🔴 Critical (v1 foundation)

- [ ] Verify TikTok's POI/location-tag field name against a real POI-tagged video now that it's deployed — the field name in `src/lib/tiktok.ts` is a best-effort guess (see code comment); TikTok's WAF blocks this from being tested from a sandboxed environment
- [ ] Add a Google Places Autocomplete widget for the low/no-confidence manual-entry state (currently a plain text address field, no search-assist yet)

## 🟡 Medium (core v1 features)

- [ ] Tier 2 escalation: ephemeral video fetch → ffmpeg (extract audio + 4–6 keyframes) → discard video immediately
- [ ] OpenRouter `gpt-4o-transcribe` integration for Tier 2 audio
- [ ] Combine transcript + frames + caption → final vision LLM extraction pass
- [ ] Google Places Text Search grounding for Tier 2 output
- [ ] Lists/tags — group saved places (e.g. "Tokyo trip", "Ramen to try")
- [ ] Search across saved places (by name, tag, list)
- [ ] Backblaze B2 integration for thumbnail storage (route through Cloudflare for free egress) — currently just hotlinking TikTok's own CDN URL for `thumbnailUrl`, which is often a signed/time-limited link and can silently stop loading later
- [ ] Constrain `category` to a fixed set instead of LLM free text (currently returns "restaurant", but nothing stops variants like "Restaurant"/"resto" from fragmenting later). Enforce via the OpenRouter JSON schema `enum` (already using strict schema mode, so this is a small change), backed by a shared TS constant — not a Prisma enum, to avoid a migration every time the list is tweaked. Proposed list: `restaurant`, `cafe`, `street_food`, `bakery`, `dessert`, `bar`, `hotel`, `tourist_attraction`, `shopping`, `nightlife`, `other`
- [ ] Bilingual UI via `next-intl` (Indonesian + English)
- [ ] Parse-failure monitoring: Prometheus counter + Grafana alert on TikTok page-structure breakage
- [ ] Periodic canary check against a known-stable TikTok URL
- [ ] Graceful fallback to manual entry when page-parsing fails (never hard-block a save)

## 🟢 Nice to Have (v2 / stretch)

- [ ] Mobile share-sheet / PWA share target (skip manually pasting the link)
- [ ] In-app map view of all saved places (Mapbox or Leaflet + OpenStreetMap)
- [ ] Payments/subscriptions (Stripe, or Xendit/Midtrans for Indonesian customers)
- [ ] PostGIS-powered "places near me" / radius search
- [ ] Public profile / shareable lists (if commercializing)
- [ ] Admin dashboard for monitoring extraction accuracy across confidence tiers

## 📋 Decisions still needed

- [ ] Branding (logo, exact color values)
- [ ] Full page/screen list (Home/feed, Add, Place detail, Lists, Search, Settings, Auth)
- [ ] Explicit v1 out-of-scope list
- [ ] Grafana alert notification channel (email / Slack / Discord?)
- [ ] PostGIS enablement path — switch the shared `db-postgres` to `postgis/postgis` (affects Electricity Tracker too) vs. a dedicated instance just for Clipmap, once "near me" search is actually being built
