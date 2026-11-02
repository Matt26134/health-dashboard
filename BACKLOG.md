# Health Dashboard backlog after v1.0

## High-value next releases
- Configurable reminders/notifications for Morning Check-in, supplements, low steps, Close Today and Sunday Review.
- Maintenance mode once goal weight is reached: weight range, maintenance calories, rebound prevention and different coaching language.
- Plateau detection using multi-week weight trend + adherence before suggesting any calorie change.
- Personal insights after enough data, e.g. protein vs hunger, sleep vs Momentum, planned training adherence.
- Search/history for weight, activities, notes, lessons and past reports.
- Flexible/temporary goals and monthly focus targets.
- CSV export for weight, nutrition, activities, steps and scores alongside encrypted backups.
- Expand “Why am I seeing this?” explainers throughout calculated metrics and coaching.
- Optional Garmin/Withings automatic sync later; v1.0 remains manual-first and fully offline.

## Product principles
- Keep core daily use offline.
- No in-app AI chatbot for now.
- No gamification that punishes users by deleting earned progress.
- Prefer interpretation and action over more raw data.

## v1.1.0 — Day 2 Edition (implemented)
- [x] Hydration accepts hundredths of a litre (e.g. 2.25 L), consistent with 250 ml quick-add buttons.
- [x] Manual exercise duration accepts exact MM:SS / H:MM:SS instead of forcing whole-minute rounding.
- [x] 1–5 ratings use descriptive anchors so 2/3/4 are meaningful.
- [x] Bedtime is time-aware: target vs expected/actual bedtime is calculated automatically; it cannot be blindly banked.
- [x] Bedtime history stores target, variance and status for future weekday-pattern coaching.
- [x] Close Day accepts screen time as hours + minutes, not raw minutes.
- [x] Social-media time is tracked separately from total screen time, with optional top app.
- [x] Digital-wellbeing progress card trends screen/social use without assuming causation.
- [x] Future lessons are locked until their scheduled day; completed lessons remain reviewable.
- [x] Progress photo views are Front / Side / Back / Face.
- [x] Progress photos become a recurring weekly task (every 7th journey day).
- [x] Multi-select chips have unmistakable selected/deselected states.
- [x] Contrast hardened for pale-purple/accent surfaces.
