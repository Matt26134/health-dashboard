# Health Dashboard v1.2.0 — Daily Experience & Adaptive Fuelling

## Major changes
- Rebuilt Today to show the current date and journey day, a selective personal coach, live food budget, outstanding actions and an appropriately timed closeout. Recovery detail now lives in Training; Madrid progression remains in Progress.
- One live exercise/food budget: 50% credit from completed Garmin exercise, plus only still-uncompleted planned-session credit. Explicit planned links win; same-type completed sessions replace planned estimates before unlinked extra activities are added. Edited or additional activity updates today's food target.
- Separate calorie statuses (`within`, `1–100 over`, `101–300 over`, `>300 over`), with no punishment workouts. Unlogged nutrition remains unlogged. 5 Momentum points for honest logging plus 15 for being within target, preserving 100 total possible points.
- Choose active vs total Garmin exercise calories; total receives an approximate resting-calorie deduction when duration and weight are recorded; uncertain older entries are clearly labelled.
- One nutrition form and unified quick-entry route; decimal protein/fibre/fruit-and-vegetable portions retained exactly.
- Morning briefing uses a short context-aware narrative and up to two useful observations, not mandatory field-by-field paragraphs. Saved support plan, hunger, sleep, banked days, weights, training and active injury status inform the message.
- Morning check-in now asks how often sleep was interrupted, irrespective of cause, and preserves older separate bathroom-only records.
- Training highlights exercise credit and the single active-injury recovery story. Resolved injuries stop affecting new advice.
- Preserves banked reports, lessons, XP, photos, injuries, weight history, nutrition history and existing activity records. No migration, delete or reset operation added.

## Test requirements
Smoke-test 360 px Today/Training/Progress; current-day calorie reconciliation, planned matches, extra activity, double-counting, over-target logging and scoring, exact HH:MM:SS and decimal nutrition entry, morning waking persistence, closed-record immutability, and upgrade/cache flow. Export an encrypted backup before deploying.
