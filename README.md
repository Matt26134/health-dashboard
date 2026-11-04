# Health Dashboard v1.1.2 — Motivation & Experience

**In-place update from v1.1.1. No data reset or migration.** The existing offline-first dashboard, IndexedDB history, banked daily reports, photos, workouts, measurements, lessons, injury entries, Momentum and XP remain on the **same device and browser**.

## Upgrade via GitHub Pages

1. In your existing app, use **Settings → Export everything** to make an encrypted backup. Store the file safely.
2. Unzip this release. Upload the contents, **not the ZIP**, to the **root** of the existing GitHub `health-dashboard` repository, replacing the earlier app files. Keep GitHub Pages set to `main / (root)`.
3. After GitHub Pages deploys, open `https://matt26134.github.io/health-dashboard/?release=1.1.2` online in the **same browser** used for your existing dashboard.
4. Close and reopen the installed app. If necessary, use **Settings → Check deployed version → Reload latest**. Verify Settings says **v1.1.2**, then verify your weights, banked days, injury, logged activities and lesson progress are still present.

**Do not uninstall the app, reset its data, use Test Drive, or clear browser/site storage.** Clearing site data would remove the locally stored records; this package does not.

## What changed

- **Day 4/5 motivation:** Contextual, prominent anti-quit coaching. An optional "I'm struggling" / "Plan tomorrow" action lets you save one realistic support anchor. No shame, compensatory workouts or automated extra restriction. A 2 lb/week initial ambition is framed as an upper-end aim and reassessed against hunger, sleep and recovery.
- **Activity entry:** Quick Add and Training use the same hours / minutes / seconds editor. All stored new durations use integer seconds. Effort, feeling and enjoyment 1–5 choices now include descriptive anchors. Old records are only reformatted; they are not silently changed.
- **Recovery:** One comprehensive recovery journey card on Today, with status, injury actions, restrictions and context. The underlying injury history is unchanged.
- **Trophies:** Up to six earned badges appear first with a precise "showing X of Y" label; all earned achievements can be opened. Dates are reconstructed from available real records; unavailable historical dates say so instead of being invented.
- **Progress:** Balanced two-column latest weight versus seven-day rolling average.
- **Hydration & sleep:** Optional morning count of overnight toilet trips, plain water plus other drinks (e.g. tea and milk), and last substantial drink time. Existing water-only history is preserved. Drinking guidance is flexible, not compulsory and does not override advice to seek medical assessment for persistent frequent urination.
- **Evening reflection:** Optional descriptive 1–5 tomorrow-confidence rating for future coaching.

## Architecture and testing limits

No external syncing or AI-web dependency: data remains locally stored, and offline support remains enabled. Browser-level tests exercised the real UI and save handlers against **synthetic records in an isolated Chromium session**, including new duration, motivation, trophies, injury card, fluids and morning night-time waking field. Automated JavaScript checks also pass. Local site navigation was blocked in the test environment, so a complete GitHub Pages/service-worker upgrade in the user's Samsung browser **has not been verified**.
