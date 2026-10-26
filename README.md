# Health & Performance Dashboard V0.3.0 – Progress Engine

A local-first installable PWA designed around motivation, weight loss, running performance and behaviour change.

## Start date
The programme is configured to start on **Tuesday 3 November 2026**. Before that date the app stays in **Setup Mode**. The Road to Madrid countdown now correctly uses the 173-day programme window from 3 November 2026 to 25 April 2027.

## V0.3 highlights
- **Progress Engine:** daily weight, 7-day smoothing, prior-week comparison and straight-line Madrid trajectory are treated separately.
- **Don't Panic coaching:** catches a daily scale increase when the underlying trend is still falling and explains why no reaction is needed.
- **Trajectory status:** shows pounds ahead/behind the path to 190 lb without encouraging crash corrections.
- **Current vs required pace:** compares recent smoothed loss rate with the pace required to reach Madrid.
- **Forecast date:** once enough trend data exists, estimates when the Madrid target would be reached at the current rate.
- **Interactive weight chart:** 30-day, 90-day, 6-month and all-time views with daily readings, 7-day trend and Madrid path.
- **Milestone focus:** next 5-lb milestone and distance remaining are surfaced alongside 190 lb and 180 lb goals.
- **Injury pulse check:** active injuries now offer a one-tap Better / Same / Worse daily check-in, retained in the local injury record.
- **V0.2 injury-aware coaching retained:** running targets pause appropriately and approved alternatives/recovery still count.

## Architecture
- Static HTML/CSS/JavaScript suitable for GitHub Pages.
- Personal data stays in `HealthDashboardDB` (IndexedDB) in the local browser profile.
- GitHub contains application code only — never personal health records or API secrets.
- Database schema remains V2, so V0.3 is an application-only upgrade and preserves V0.2 data in place.
- Encrypted `.healthdash` full backup/restore remains compatible with older backups.
- PWA/service worker allows install and offline use.

## Planned integrations
Garmin, Withings and Nutracheck remain represented as data sources. Manual input remains fully usable while sync/import methods are added without exposing credentials in GitHub Pages.

## Deploy to GitHub Pages
Make an encrypted backup first. Then upload the **contents** of this folder to the root of the existing `health-dashboard` repository, replacing files with the same names. Do not delete the repository or change the Pages settings.

Replacing application files does **not** erase IndexedDB data. After GitHub deploys V0.3, use **Settings → Check deployed version → Reload latest** in the installed app.
