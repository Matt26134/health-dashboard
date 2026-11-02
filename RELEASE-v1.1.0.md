# v1.1.0 — Day 2 Edition

Built from the real Day 1 feedback pass. This is an in-place upgrade: it does **not** reset the existing local journey data.

## Fixed for Day 2
- Morning Check-in remains the first daily setup action and a weight entered there auto-completes Morning weigh-in.
- Close Today remains prominent and still supports deliberate reopen/edit.
- All key 1–5 scales now use descriptive anchors rather than unexplained numbers.
- Water accepts hundredths of a litre, so 2.25 L is valid.
- Activity duration accepts exact `MM:SS` / `H:MM:SS` and stores the exact duration rather than rounding to whole minutes.
- Bedtime can no longer be blindly ticked as achieved. It compares the saved expected/actual bedtime with the target and stores hit/close/missed plus the variance.
- If the target time has already passed, the bedtime check-in says so rather than offering a false success.
- Bedtime history is retained for weekday-pattern coaching.
- Close Day accepts total screen time as hours + minutes.
- Social-media time is logged separately, with optional top-app name/time.
- Progress now has a Digital wellbeing view with 7-day total/social trends and cautious coaching around associations with bedtime/mood/energy.
- Future lessons are locked until their scheduled day using the device date/start date (works offline); completed lessons remain reviewable.
- Progress-photo views are Front / Side / Back / Face.
- Progress photos appear as a Today task every 7th journey day.
- “Why are you doing this?” options are not preselected for a fresh setup, and selected/deselected chips now have an explicit tick + stronger border/background distinction.
- Pale-purple/accent UI has stronger text contrast.

## Data compatibility
Existing IndexedDB data is preserved. The one-time clean-launch marker from v1.0 is unchanged, so installing this release does not repeat the launch reset.

## Regression checks performed
- JavaScript syntax check passed for every `.js` file.
- `version.json` and `manifest.webmanifest` parse successfully.
- PWA cache renamed to `health-dashboard-v1.1.0-day2` and includes `day2-v1.js`.
- All script cache-busters updated to `v=1.1.0`.
- Water input uses `step=0.01`.
- Exact-duration parser supports `17:41` and `H:MM:SS` formats.
