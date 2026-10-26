# Health & Performance Dashboard V0.2.0 – Adaptive Coaching

A local-first installable PWA designed around motivation, weight loss, running performance and behaviour change.

## Start date
The programme is configured to start on **Tuesday 3 November 2026**. Before that date the app runs in **Setup Mode** so baseline values and goals can be prepared without generating misleading scores or streaks.

## Architecture
- Static HTML/CSS/JavaScript suitable for GitHub Pages.
- Personal data stays in `HealthDashboardDB` (IndexedDB) in the local browser profile.
- GitHub contains application code only — never personal health records or API secrets.
- IndexedDB schema V2 adds a structured `injuries` store while preserving all V0.1 data.
- Encrypted `.healthdash` full backup/restore remains compatible with older backups.
- PWA/service worker allows install and offline use.

## V0.2 highlights
- **Injury-aware coaching:** structured injury state, severity, restriction level and user-approved alternative activities.
- **Adaptive training goals:** running targets pause when running is restricted; intentional recovery or approved alternatives can still complete the movement goal.
- **Injury-safe scoring:** Health & Performance score stops penalising unavailable running/strength targets and uses adaptation adherence instead.
- **Time-aware Today screen:** morning, daytime, evening and late-day coaching tone changes automatically.
- **Next Easy Win:** surfaces one simple unfinished action to keep Momentum moving.
- **Injury timeline:** update or resolve injuries and retain history locally.
- **Running page adaptation:** clearly shows when running targets are paused and why.
- **Adapt & Continue badge:** rewards using the system to adjust instead of abandoning the plan.

## Existing features retained
- Setup Mode countdown and readiness checklist.
- Baseline inputs and goal defaults: 190 lb by Madrid Marathon (25 Apr 2027), ultimate target 180 lb.
- Momentum score and daily actions including vitamins, nutrition, movement, protein, fibre, water, steps, learning, bedtime and check-in.
- Weight logging with 7-day smoothing, trajectory, milestones and weekly review.
- Running/training logging, race PBs and performance baseline.
- Behaviour-change curriculum and daily lessons.
- Journal, badges, data-source cards, encrypted backup/restore and deployed-version checking.

## Planned integrations
Garmin, Withings and Nutracheck remain represented as data sources. Manual input is fully usable while sync/import methods are wired without exposing credentials in GitHub Pages.

## Deploy to GitHub Pages
Upload the **contents** of this folder to the root of the existing `health-dashboard` repository, replacing files with the same names. Do not delete the repository or change the Pages settings.

Replacing application files does **not** erase IndexedDB data. V0.2 upgrades the local database in place. Still keep an encrypted backup before major updates.
