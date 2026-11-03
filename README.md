# Health & Performance v1.1.0 — Personal Coach & Insights

**Update, not a reinstall or fresh start.** Preserves existing v1.0 records, photo uploads, injury timeline, nutrition, learning, lessons, reports, supplements and encrypted backups. The `HealthDashboardDB` IndexedDB schema stays at v5. The earlier v1.0 one-time clean-launch routine is disabled in this version. Do not clear browser data, reset, or uninstall.

## Deploy
1. From the installed v1.0 app, **Settings → Export everything** and store your encrypted `.healthdash` backup somewhere safe; verify that the backup file was saved. You do not need to share the password.
2. Unzip this package and upload the **contents** to the root of your existing `health-dashboard` GitHub repo (not the ZIP itself). Replace matching files. The new `*-v11.js` files are deliberate new asset names, avoiding stale JavaScript caches. Existing `*-v1.js` files may remain in the repo, but the new site does not reference them.
3. Commit changes. Keep GitHub Pages set to `main / (root)`.
4. Open `https://matt26134.github.io/health-dashboard/?release=1.1.0` in Samsung Internet **while online**. Then restart the installed app; if necessary use Settings → Check deployed version / Reload latest. Version should read **v1.1.0**.
5. Confirm Day 1 and Day 2 remain in Progress / History and your active ankle injury still appears. Check your real strength activity is still present.
6. Test manual Activity, Morning Check-in, Nutrition, Learn and Close Today before relying on the new flows.

## What changed
- **Continuity:** journey day based on start date, previous-day summary, rotating non-punitive motivation messages and a personalised Morning Coach’s Briefing.
- **Better daily data:** exact activity start time and duration (HH:MM:SS), editable/deletable activity history, better 1–5 labels, two-decimal water, decimal fibre/fruit/veg, following-morning bedtime confirmation.
- **Evening reflection:** tap-to-answer wins/challenges/focus, last meal time/size, expected bedtime, total/social/top-app screen-time hours+minutes, adaptive follow-up prompts, smarter report with rotating guidance, actual vs target and repeated misses.
- **Recovery:** structured daily pain/symptom and walking-tolerance entries, visual recovery pathway, cautious injury context analysis and milestone recognition.
- **Progress:** 2027 race calendar, approximate race-time conversions based on manually entered PBs or recent logged races, plateau watch, personal trends and optional maintenance settings.
- **Photos:** weekly Day 1/7/14… prompt, Front/Side/Back/Face new uploads, gallery filter, any two same-view dates side-by-side. Legacy “Other” photos remain accessible.
- **Learn:** future lessons visibly locked until local journey day; older/completed lessons are accessible for review, including offline.
- **Tools:** Training tab rename, local history/search, downloadable per-dataset CSV, flexible targets/monthly focus, in-app reminder times, readable launch contrast, width protection for More, data-source automation still deferred.

## What is deliberately not claimed
- The app does **not** automatically connect to Garmin, Withings or Nutracheck. All daily entries are still manually captured; no external connector is required.
- In-app reminders appear when the PWA is open. Guaranteed scheduled push notifications while completely closed are **not available** in this offline-only build.
- The personal insights are **descriptive** and wait for minimum sample counts. They are not medical diagnoses, proof of cause, or calorie prescriptions.
- CSV is for reading/reuse in other systems. Keep encrypted `.healthdash` backups for a full restore, including photos.

## Safety
Records are stored in this device's browser IndexedDB. The code is public on GitHub Pages, but personal data is not uploaded there. Anyone clearing site storage or uninstalling the PWA may lose local data unless backed up. No v1.1 upgrade routine clears the database.
