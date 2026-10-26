# Health & Performance Dashboard v0.9.0 — Release Candidate

Local-first installable PWA for GitHub Pages. Personal health records stay in IndexedDB on the device/browser profile.

## Why v0.9?
This is the launch candidate. The next major version is **v1.0.0**, intended for the real journey start on 3 November 2026 after the dry-run checks pass. v1.0 means the core app is trusted with real data; Garmin/Withings automation can ship safely later as v1.1 rather than delaying or weakening launch security.

## v0.9 highlights
- Day 1 guided onboarding: weight, waist, Nutracheck/daily targets, Garmin baselines and supplements
- launch preflight that distinguishes blockers from fields deliberately waiting for Day 1
- demo-mode protection and encrypted-backup check before launch
- lessons now contain real tappable evidence/further-reading links
- truthful data-source statuses: Garmin/Withings require a secure connector; Nutracheck uses quick daily totals for launch
- no API secret is stored in the public GitHub repository
- all v0.4 Coach & Habits, injury-aware coaching, Progress Engine, badges and reversible Test Drive retained

## v1.0 gate
We cut v1.0 when: demo reset is proven; database persists after close/reopen; encrypted export/restore is proven; Day 1 onboarding saves correctly; first weight drives Progress/Momentum correctly; lesson completion and score breakdowns work; no launch-blocking mobile UI/runtime issue remains.

## Storage and upgrades
Database schema remains V3. No new store is required for v0.9, so the upgrade does not clear v0.4 data. Existing encrypted backups remain compatible.

## Deploy
Upload all files in this folder to the root of the existing `health-dashboard` GitHub repository. Do not change GitHub Pages settings. Then use **Settings → Check deployed version → Reload latest** in the installed app.

## Privacy
GitHub hosts app code only. Health data stays local unless you explicitly export an encrypted `.healthdash` backup. Garmin/Withings secrets must never be committed to the repo; automatic sync will use a private connector.
