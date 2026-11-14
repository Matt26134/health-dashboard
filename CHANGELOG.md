# Health Dashboard v1.4.0 — The Personal Coach
**Release date: 13 November 2026**

## Additions
- **More personal Today and banked-day coaching:** Summarises relevant daily achievements, history and context; drops the previous morning's coaching once the day has been banked; fixes the displayed banked-day count. Saved reports remain unchanged.
- **Evidence-based weekly discoveries:** Draws cautiously from past check-ins, activities, sleep, hunger and screen/bedtime measurements, showing achievements, patterns with minimum sample sizes and a small optional experiment.
- **Historical weigh-in viewer and correction:** Preserves original IDs, sources and existing banked reports when a user explicitly corrects a saved date/weight/note. No background recalculation of past reports.
- **Photo management:** Edit saved photo category (Front, Side, Back, Face, Other), date and notes without replacing stored images; retained the existing paired-photo comparison.
- **Weekly measurements in inches:** Available from **Monday 16 November 2026**, with waist, stomach, hips, chest, neck and thigh, plus optional upper arm. Individual history, corrections and optional reminder snoozing. Uses the existing measurements store.
- **More applied learning:** Choice-based challenges with varied answer positions, useful explanations, optional expanded original evidence and short self-reflection. Existing 174 lesson records and completions retained.
- **Early forecast guard:** Withholds extrapolated Madrid goal dates until at least 28 days of history and 21 distinct weighing days.

## Fixes and boundaries
- Prevented irrelevant generic 'One higher-calorie day...' report notices when calories were within target; differentiated short recorded sleep from selecting fatigue as a challenge.
- Removed the 'You flagged as challenges' malformed copy when 'Nothing significant' was chosen.
- Preserved v1.3 adaptive calorie rules, injury management, lessons, trophies, body composition, photos, reports and backup implementation.
- No DB schema change: `HealthDashboardDB` remains **version 5 with 17 stores**. There is no automatic data migration or reset.

## Verification
All JS syntax checks and synthetic mobile DOM functional checks passed; browser/PWA storage and service-worker deployment still require real-device validation. See `TESTING.md`.

---

# Health Dashboard v1.3.0 — Milestones & Motivation
**Release date: 9 November 2026**

## New in this release

- **Milestone-first motivation**: A full seven-day banked week takes priority over ordinary advice. The Day 8 experience recognises the first completed week and doesn't greet you with a generic daily slogan. Other week markers and five-pound weigh-in thresholds get contextual recognition. Celebrations require actual records; a calendar date alone does not earn one.
- **576 offline coaching combinations**: 144 distinct, edited message pairs in 12 context-gated categories, each with four accompanying endings. Selection varies by day and context; identical ordinary message combinations don't repeat inside a 30-day run. Injury-related content is eligible only while the injury is active. No external AI call, subscription, or network requirement.
- **Completed-week history**: The preceding journey week appears above the current week's progress in Progress, with older completed weeks available through an archive, showing banked days, recorded bodyweight change, training, lessons and nutrition logging. The new week's empty checklist doesn't replace the completed week's achievement.
- **Weekly photo prompts**: From Day 8, then weekly, a prompt references the view categories actually recorded at baseline (Front / Side / Back / Face). It stays until the corresponding weekly shots are complete or you snooze/skip. Skipping never costs points. Existing photos remain local and unchanged.
- **Exact sleep input**: Two whole-number fields (hours and minutes) replace decimal sleep entry in Morning Check-in; exact minutes are saved in `checkins.sleepDurationMinutes`, with the old `sleepHours` retained for existing analysis. Historical sleep entries are never guessed or rewritten.
- **Explicit Rest / Recovery Day**: One-tap morning planning choice stores an actual rest session, removes unnecessary distance and time fields, and gives zero planned exercise calories. Any later completed activity still updates the live budget using v1.2 rules.
- **Withings body composition in pounds**: Optional fat mass, muscle mass and bone mass can be entered alongside a morning weigh-in, from the regular weight form, or from Progress. The app calculates body-fat percentage from a recorded bodyweight when one exists; fat and muscle aren't inferred from each other. Trends are interpreted cautiously over at least several weeks.
- **Screen time that produces an output**: Progress shows latest total screen time, seven-day average, social media average and last top app, with sample counts and appropriately cautious observations. The user can also edit the same daily check-in data using a dedicated form.
- **Cohesive Today screen**: On weekly milestone mornings the special celebration takes the place of the normal coach card, avoiding a duplicate congratulatory message. Photo prompts are skippable and separate.
- **Water-weight caution matured**: A daily lower weigh-in after the first week is celebrated without automatically repeating the early-fluid caveat. Actual weight-loss amounts and body-composition estimates remain distinct.

## Inherited and retained from v1.2

Adaptive 50% credit from *recorded active exercise calories* with matching to planned sessions, honest nutrition logging versus calorie-target success, separate training/recovery navigation, injury-aware coaching, closeout reports, saved next-day plans, correct nutrition decimals, exact exercise duration, encrypted backups, the 174-day lesson library, trophy cabinet, and Road to Madrid forecasts.

## Data safety

This version **does not change the IndexedDB schema version, delete any store, or rewrite old banked days**. All new observations use existing `checkins`, `measurements`, `settings`, `photos`, `activities` and `plans` stores, retaining earlier records. No test or demo data is included in the deployment ZIP.
