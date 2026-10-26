# Health & Performance Dashboard V0.4.0 — Coach & Habits

Local-first installable PWA for GitHub Pages. Personal health records stay in IndexedDB on the device/browser profile.

## V0.4.0 highlights
- evidence-backed 4–5 minute lessons with source notes, knowledge checks and gated completion
- clickable Today cards and integrity-protected Momentum actions
- transparent Momentum and Health & Performance score breakdowns
- daily energy, hunger, sleep, body and mood check-ins
- weight-context tags, nutrition feel and subjective workout feel
- configurable supplement checklist
- tomorrow planning, win/wobble logging and weekly reflections/confidence
- expanded badge library
- injury-aware coaching retained
- reversible Test Drive retained

## Storage and upgrades
Database schema is V3. The upgrade adds `checkins` and `plans` stores without clearing existing V0.3 data. Old encrypted backups remain restorable; missing newer stores restore as empty.

## Deploy
Upload all files in this folder to the root of the existing `health-dashboard` GitHub repository. Do not change GitHub Pages settings. Then use **Settings → Check deployed version → Reload latest** in the installed app.

## Privacy
GitHub hosts app code only. Health data stays local unless you explicitly export an encrypted `.healthdash` backup. API secrets for future Garmin/Withings integrations must never be committed to this repository.
