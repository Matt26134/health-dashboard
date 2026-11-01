# Health & Performance Dashboard v1.0.0 — Launch Edition

Local-first, offline-capable personal health/performance PWA.

## Launch
- **Day 1:** Monday 2 November 2026
- **Madrid Marathon:** Sunday 25 April 2027
- **Madrid weight target:** 190 lb
- **Ultimate target:** 180 lb
- v1.0 is deliberately **manual-first**: Withings weight, Garmin activity/calories and Nutracheck daily totals are entered manually.

## One-time clean launch preparation
This specific Launch Edition performs a **one-time local cleanup on first open** because the owner explicitly requested a completely clean Day 1. It removes all previous demo/test/personal tracking data from the browser database, including injuries, photos, reports, XP/badges and lesson completions, then recreates only the blank v1 defaults/goals/curriculum. A local browser marker prevents the cleanup from running again after the real journey begins.

## Core daily loop
1. Morning Check-in: weight, sleep, energy, hunger, current health context and today’s planned activity.
2. Morning Briefing: interprets weight trend, sleep, training load and adaptive calorie target.
3. Live Today: habits, steps, water, nutrition, learning and planned movement.
4. Log actual activity: distance/time and Garmin-reported calories; the model learns your own exercise-burn pattern.
5. Close Today: missing-item check, Daily Report, repeated-miss coaching and tomorrow’s priority.
6. Sunday: weekly review/calibration. Calorie changes are suggestions only and never automatic.

## Motivation
- Road to Madrid uses behaviour-earned Momentum XP and never removes earned progress.
- 10 progression levels, badges, trophy cabinet, secret achievements and milestone moments.
- Average Momentum and Momentum XP are tappable and explained transparently.

## Progress photos
Photos remain local-only and encrypted in backups. Gallery supports view filtering, full-screen viewing and same-view earliest-vs-latest comparisons with date/weight context where available.

## Privacy / offline
All personal data lives in IndexedDB on the current browser/app profile. GitHub hosts application code only. The installed PWA works offline after it has loaded once online. External evidence links and future integrations naturally require internet.

## Future backlog
See `BACKLOG.md`.

## Deploy
Upload every file in this folder to the root of the existing `health-dashboard` GitHub repository. GitHub Pages remains configured to deploy `main / (root)`.
