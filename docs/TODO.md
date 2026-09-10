# Clipmap — TODO

## 🔴 Critical (v1 foundation)

- [ ] Verify the extraction pipeline live once `OPENROUTER_API_KEY`, `GOOGLE_PLACES_API_KEY`, and `OPENROUTER_VISION_MODEL` are set — built and data-layer tested, but never run against a real TikTok URL/LLM call
- [ ] Verify TikTok's POI/location-tag field name against a real POI-tagged video once deployed — the field name in `src/lib/tiktok.ts` is a best-effort guess (see code comment); TikTok's WAF blocks this from being tested from a sandboxed environment
- [ ] Add a Google Places Autocomplete widget for the low/no-confidence manual-entry state (currently a plain text address field, no search-assist yet)
- [ ] Add a GitHub Actions workflow to build + push the image to GHCR (`ghcr.io/fahmiefendy/clipmap`) — `apps/clipmap/docker-compose.yml` expects that image and there's no CI yet (repo already exists at github.com/FahmiEfendy/clipmap)
- [ ] Confirm the Cloudflare Tunnel route for `clipmap.fahmiefendy.dev` → `http://localhost:80` is added in the dashboard (Zero Trust → Networks → Tunnels → homeserver → Routes) — routing there isn't config-file-managed, so it can't be verified from this repo

## 🟡 Medium (core v1 features)

- [ ] Tier 2 escalation: ephemeral video fetch → ffmpeg (extract audio + 4–6 keyframes) → discard video immediately
- [ ] OpenRouter `gpt-4o-transcribe` integration for Tier 2 audio
- [ ] Combine transcript + frames + caption → final vision LLM extraction pass
- [ ] Google Places Text Search grounding for Tier 2 output
- [ ] Lists/tags — group saved places (e.g. "Tokyo trip", "Ramen to try")
- [ ] Search across saved places (by name, tag, list)
- [ ] Backblaze B2 integration for thumbnail storage (route through Cloudflare for free egress)
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
- [ ] Real Google OAuth credentials for `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
