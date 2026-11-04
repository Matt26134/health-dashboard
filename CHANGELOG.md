# Changelog

## v1.1.2 — Motivation & Experience (4 November 2026)

### Day 4/5 coaching
- Prominent Day 4 and 5 motivation to address the "I'll restart Monday" risk.
- Save an optional personalised support plan for tomorrow or use "I'm struggling" to choose a realistic next action.
- Honour banked days and real achievements, with no guilt for an imperfect meal or automatic calorie tightening.

### Reliability and polish
- Retire the legacy Quick Add activity form so it delegates to the correct H:M:S duration editor and the anchored 1–5 effort/enjoyment controls.
- Combine Today injury widgets into one recovery card, preserving history and recording controls.
- Align Progress weight and 7-day trend panels.
- Show earned badges before locked previews, provide "all earned", and reconstruct achievement dates from existing records when possible.
- Add optional night toilet trips to morning check-in and optionally count tea and milk in total fluids while retaining historical water-only values.
- Add optional tomorrow-confidence answer in closeout.

### Data safety
- No reset or mass rewriting of activities, measurements, photos, lessons, injuries or closed daily reports.
- Existing data and local app functionality remain manual-first and offline-capable.

## v1.1.1 — Daily Polish & Reliability (4 November 2026)

### Fixed
- Historical exercise durations display as `MM:SS` / `H:MM:SS`; no records are rewritten. Older decimal-minute values retain their originally saved meaning.
- Planned-vs-actual distinguishes explicitly linked sessions from unrelated logged activities. Unlinked activities are **not** treated as missed.
- Completed current lesson clearly shows **Review** instead of **Open**.
- Trophy Cabinet uses a fixed three-column responsive grid; earned trophies open a meaningful explanation.
- Progress shows the last actual weigh-in prominently alongside the 7-day trend.

### Refined
- Morning Briefing shows two primary observations and keeps additional context behind a tap-to-expand panel.
- Today folds weekly priorities and streaks; completed checklist items become more compact.
- Recognises two consecutive falling weigh-ins or the first strength session without treating short-term scale change as pure fat loss.

### Safety
- No data deletion, resetting, migrations, re-seeding, or changing existing activity values.
- Existing photos, nutrition, lesson completions, injuries, reports, Momentum and XP remain in local IndexedDB.
- Manual-first, offline PWA architecture unchanged.
