# Clipmap — Release Notes

Public-facing summary of what shipped in each release. For full technical detail (dependencies, bug fixes, what's verified vs. not), see [CHANGELOG.md](CHANGELOG.md).

---

## 0.1.0 — 2026-09-10

Initial release: the core "paste a TikTok link, get a saved place" flow.

**What's new**
- Sign up / log in with email + password, or Google
- Paste a TikTok video URL to extract place info — name, address, and description, pulled from the video's caption and cover image using AI
- Review and edit the extracted details before saving
- View your saved places, with a direct link to Google Maps
- Self-hosted at [clipmap.fahmiefendy.dev](https://clipmap.fahmiefendy.dev)

**Known limitations**
- Works best when the video's caption or cover image clearly names the place — videos where the location is only spoken aren't handled yet
- No search or lists yet — saved places show as a single flat list
- English only for now — Indonesian language support is planned

---
