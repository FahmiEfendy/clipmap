# Clipmap — TODO

## 🔴 Critical (v1 foundation)

- [ ] Initialize Next.js (App Router, TypeScript) project
- [ ] Set up PostgreSQL + PostGIS, connect via Prisma
- [ ] Define Prisma schema: `User`, `Place`, `List`, `Tag` (with `confidenceTier`, `sourceTier` fields)
- [ ] Set up Auth.js (NextAuth v5) — email/password + Google OAuth (create Google Cloud OAuth credentials)
- [ ] Build "paste TikTok URL" input + save flow
- [ ] TikTok page fetch + embedded JSON parsing (caption, hashtags, POI tag, cover images)
- [ ] Google Places API integration (Find Place + Text Search)
- [ ] OpenRouter integration — vision LLM extraction (caption + hashtags + cover images)
- [ ] Confidence-based confirm screen (prefilled vs. empty state + Places Autocomplete)
- [ ] "View on Google Maps" button (Place ID deep link, no Maps SDK needed)
- [ ] Dockerfile + docker-compose for self-hosted deployment

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

- [ ] Branding (logo, exact color values) — product name decided: **Clipmap**
- [ ] Full page/screen list (Home/feed, Add, Place detail, Lists, Search, Settings, Auth)
- [ ] Explicit v1 out-of-scope list
- [ ] Grafana alert notification channel (email / Slack / Discord?)
- [ ] Subdomain for deployment (`places.` is already taken by Your Places)
