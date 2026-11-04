# Changelog

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
