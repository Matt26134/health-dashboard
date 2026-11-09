# Health Dashboard v1.3.0 — Milestones & Motivation

**Manual-first, privacy-preserving and offline-first.** Deploy at the root of the same GitHub Pages repository that already hosts your dashboard. The live browser/device keeps your existing IndexedDB records; deployment merely replaces source files.

## Update from v1.2

1. In the currently installed dashboard, open **Settings → Export everything** and securely save an encrypted `.healthdash` backup plus its password. Check that the backup file downloaded successfully.
2. Extract this ZIP. Upload the **complete contents**, not a nested folder, to the existing GitHub repository and commit, replacing older files. Do **not** reinstall the PWA, clear site storage, delete the repo, use Reset demo, or import a demo dataset.
3. After GitHub Pages has deployed, open `https://matt26134.github.io/health-dashboard/?release=1.3.0` in the browser once online. Restart the installed dashboard.
4. Confirm Settings reads **v1.3.0**. Confirm old daily reports, weigh-ins, training activities, photos, injury history, trophies and completed lessons are still there.
5. Check the Day 8 celebration / Progress previous-week review and the weekly photo reminder. Check **Morning Check-in** has exact sleep hours/minutes and Rest / Recovery Day. Check **Progress** has body composition and digital balance.

## What is new

Week and milestone celebrations, 576 prewritten context-sensitive coaching combinations, seven-day review persistence and older-week browsing, optional weekly photo reminders, exact sleep duration inputs, explicit rest-day planning, body composition in pounds and visible digital-balance outputs.

## Privacy and data integrity

- All personal records remain local to the browser's existing `HealthDashboardDB` IndexedDB database. The database schema remains version **5**, with no destructive migration.
- The new body-composition data uses existing `measurements` rows; sleep and screen-time fields extend existing daily `checkins`. Previous entries are left unchanged.
- The v1.2 nutrition/exercise formula remains: 50% of recorded **active** exercise energy is provisionally returned to the day's food budget; extra sessions count once. This is an estimate, not a medical prescription.
- Body-composition impedance estimates fluctuate with hydration, meals and measurement conditions. Fat percentages are calculated from fat mass and a recorded weight; don't interpret short-term estimated muscle changes as tissue loss.
- If you use different browsers or devices, they **do not** automatically share local data. Avoid opening another browser profile and assuming your existing records are missing.

## Test scope

Syntax, package assets, a mobile-size Chromium in-memory test harness and save/reopen tests were performed using **synthetic records only**. The GitHub Pages deployment, Samsung installed app, service-worker upgrade and your actual data must still be verified on your device.
