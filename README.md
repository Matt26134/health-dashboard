# Health & Performance Dashboard V0.1.0 – Setup Edition

A local-first installable PWA designed around motivation, weight loss, running performance and behaviour change.

## Start date
The programme is configured to start on **Tuesday 3 November 2026**. Before that date the app runs in **Setup Mode** so baseline values and goals can be prepared without generating misleading scores or streaks.

## Architecture
- Static HTML/CSS/JavaScript suitable for GitHub Pages.
- Personal data stays in `HealthDashboardDB` (IndexedDB) in the local browser profile.
- GitHub contains application code only.
- Encrypted `.healthdash` full backup/restore is built in from V0.1.
- PWA/service worker allows install and offline use.

## V0.1 features
- Setup Mode countdown and readiness checklist.
- Baseline inputs: starting/current weight, waist, Garmin VO2 max, weekly running baseline, step target and calorie/protein/fibre/water targets.
- Goal defaults: 190 lb by Madrid Marathon (25 Apr 2027), ultimate target 180 lb.
- Today page with Momentum score and daily actions.
- Daily habit tracking including vitamins, nutrition, training, protein, fibre/fruit & veg, water, steps, learning, bedtime and check-in.
- Weight logging with 7-day smoothing and trajectory status.
- Progress page with weight chart, milestones and goal progress.
- Running page with manual activity logging, weekly mileage, strength sessions and race goals.
- Learn page with a starter behaviour-change curriculum scaffold and daily lesson completion.
- Journal for illness/niggles/notes.
- Badges/achievements foundations.
- Encrypted backup and restore.
- Version check / reload latest workflow for GitHub Pages.

## Planned integrations
Garmin, Withings and Nutracheck are represented as data-source cards in V0.1. They are deliberately not hard-wired yet. Manual input is fully usable while import/sync methods are validated.

## Deploy to GitHub Pages
Upload the contents of this folder to the root of the Health Dashboard repository (not the containing folder itself). Enable GitHub Pages for the branch/folder you use, as with Life Dashboard.

Because the dashboard is local-first, replacing app files does not erase IndexedDB data. Still create an encrypted backup before major future updates.
