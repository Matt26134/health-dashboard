# Health & Performance Dashboard v1.0.0-rc3.2 — Health-State Launch Hotfix

Local-first personal PWA for weight loss, motivation, running/performance and behaviour change.

## Launch
- Real journey start: **Monday 2 November 2026**
- Madrid Marathon: **Sunday 25 April 2027**
- Madrid weight target: **190 lb**
- Ultimate target: **180 lb**
- v1.0 is deliberately **manual-first**. No Garmin/Withings connector is required.

## Daily loop
1. **Morning Check-in** — weight, sleep hours, energy, hunger, body/mood, injury/illness context.
2. **Plan today** — Run / Swim / Bike / Gym / Football / Walk / Rest / Other, with session subtype and distance/time. Multiple sessions supported.
3. **Adaptive calorie target** — rest-day calorie anchor + a conservative training adjustment. The app does not automatically eat back all exercise calories.
4. **Log activity done** — type, distance/time, Garmin-reported calories burned, effort and enjoyment.
5. **Personal burn learning** — comparable completed sessions teach the app your kcal/mile or kcal/min pattern with Low / Medium / High confidence.
6. **Nutrition** — manually copy the useful daily totals from Nutracheck.
7. **Close Today** — warning for missing items, subjective rating, then a saved daily report. Closed days are read-only until deliberately reopened.
8. **Sunday Close Week** — weekly report + conservative calorie calibration suggestion. Base-calorie changes are never automatic.

## Calorie model guardrails
- Your configured **rest-day calorie target** is the anchor.
- Planned training can adjust the day **up**, not automatically cut the base target down.
- Only a proportion of estimated exercise energy is returned to the food budget.
- The model uses bodyweight for its starting exercise estimate and gradually blends in your own manually entered Garmin calorie history.
- Weekly calibration requires enough weight + nutrition history and can suggest only a small change (normally ±100 kcal). You must explicitly apply it.
- A single weigh-in or single high/low calorie day never triggers an automatic target change.
- The calorie model is a planning aid, not a medical prescription.

## Manual data sources
- **Withings Body+**: type morning weight into Morning Check-in.
- **Garmin Forerunner 945**: after training, copy distance/time and Garmin-reported calories burned.
- **Nutracheck**: copy daily calorie/protein/fibre/fruit-and-veg totals.
- Automatic integrations are parked for a future release.

## Local storage & privacy
All personal data stays in IndexedDB in the current browser/app profile. GitHub contains application code only. Encrypted `.healthdash` backups remain supported.

## Test drive
Test Drive snapshots the entire local database before loading synthetic data. `Reset demo` restores that snapshot and the v1 migration moves the real launch date from the previous 3 November setting to **2 November 2026**.

## Deploy
Upload the contents of this folder to the root of the existing `health-dashboard` GitHub repository and keep GitHub Pages configured to deploy `main / (root)`.

## RC3 launch-state change

A fresh Day 1 clears previous injury/illness history. Launch asks whether you are currently fit and healthy; if not, it records when the issue started, what happened, what it affects, current restrictions and activities you consider okay. That record immediately drives Morning Check-in and adaptive coaching.


## RC3.2 recovery note
All JavaScript assets use new versioned filenames to bypass stale RC3/RC3.1 service-worker caches. A startup watchdog now displays an actionable error instead of a blank screen.
