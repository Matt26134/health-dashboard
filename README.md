# Health & Performance v1.1.1 — Daily Polish & Reliability

**An in-place update from v1.1.0, not a reset.** The previous two days and all other personal data remain in local IndexedDB.

## Upgrade
1. In the installed app, **Settings → Export everything** first. Keep the encrypted backup on your phone or another safe place.
2. Extract the ZIP, then upload all its contents to the root of the existing GitHub `health-dashboard` repository. Do not upload the ZIP itself. GitHub Pages remains `main / (root)`.
3. Open `https://matt26134.github.io/health-dashboard/?release=1.1.1` online in Samsung Internet after deployment, then restart the installed app. If necessary use **Settings → Check deployed version → Reload latest**.
4. Confirm Settings shows v1.1.1. Verify today's weight, Day 1/2 reports and your logged strength activity remain intact.

**Do not uninstall, reset Test Drive, clear site data or delete the old database.**

## Scope
- Historical activity durations display cleanly in both Training's summary and Activity History. The app does **not** attempt to guess that a stored 39.34 decimal minutes meant 39:34.
- Planned vs actual only counts explicit links; independently logged activities are acknowledged as unlinked, not failed. You can link an activity to a morning plan by editing the activity (when that plan session still exists).
- Completed lessons read 'Review' in the Current Lesson card.
- Trophy Cabinet has a consistent phone-width three-column grid and descriptive trophy detail views.
- Today is shorter, with expandable secondary sections and a recognition card for meaningful early wins.
- Progress shows the actual latest weight alongside the 7-day moving average.

All future automation/integration work remains separate and disabled. External evidence links require internet; cached app and lessons work offline.
