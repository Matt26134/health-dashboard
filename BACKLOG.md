# Health Dashboard — development backlog after v1.4.0 (13 November 2026)

## Delivered in v1.4.0
- First meaningful offline history-driven coaching and banked-day personal summary; removed stale morning headline after banking.
- Weekly discovery preview with cautious sample-size checks and practical experiments.
- Historic weigh-in editing; progress photo metadata/category editing and comparison button.
- Monday 16 November circumference tracking (optional, inches), with history, preferences and in-place corrections.
- Applied, shorter lesson format while preserving all 174 original lessons and completion records.
- More cautious early weight-goal-date forecast and several misleading summary-text fixes.

## Highest priority for next testing/iteration
1. **Samsung in-place upgrade verification:** Retain encrypted backup and prove stored reports, photographs, achievements, profile, lessons, injury history and settings survive the deployed v1.4 update. Test offline relaunch after the new service worker activates.
2. **Full real IndexedDB regression:** Test export, encrypted restore into a separate disposable browser profile, edits, photo data, new measurement rows and reloading. The simulation used a mock database, not a real upgrade.
3. **Historical report integrity:** Old banked reports are intentionally historical snapshots. Define whether and when editing a historic weigh-in, activity or nutrition item should trigger an optional report recalculation; never silently overwrite it. Existing historical activity deletion remains a known area for care.
4. **Expanded coaching memory:** Keep meaningful 'what helped last time' observations and user feedback on advice. Current v1.4 computes context from saved records but does not persist which discoveries were already shown, so repetition may still occur.
5. **More varied curriculum:** The v1.4 reader improves delivery, but only Days 1, 3, 12–20 have individually authored applied challenges. Other lessons use topic-based fallback questions. Design genuine different interactive activities, less-obvious decisions and visual cases throughout the 174-day curriculum while preserving progress.
6. **Reduce manual entry:** Identify high-friction inputs that can inherit values safely and data fields that give too little useful feedback. Avoid duplicate entry forms and support straightforward correction.
7. **Progress page length:** The new history and insights functions add scroll depth; consolidate important information into an overview with optional deep-dive details without hiding achievements.
8. **Body measurements:** Review first Monday capture and 3–4-week comparisons, consistent tape landmarks and outlier messaging. Tape measures cannot locate fat loss precisely. Make existing legacy waist entries clear in comparisons.
9. **Health & Performance score:** The 25% weight-trajectory component may reward excessively fast early weight change. Balance training, fuel and recovery more intelligently rather than rewarding bigger deficits.
10. **Calorie and milestone regression:** Verify closed-day scoring accuracy, 50%-active-exercise recalculation on log/edit/delete, realistic milestone eligibility, photo prompts after snoozing and correct injury resolved status.

## Further development
- Training predictions with ranges, injury-independent running progression and maintenance mode at target weight.
- Four- and eight-week combined circumference, body composition, strength and photo trends.
- Better user control over coach style and advice relevance, without adding network AI.
- Accessible mobile focus states and richer progress comparisons.
- Reliable push while the app is closed would need supported platform/service infrastructure; not part of offline-only v1.4.

## Regression rule for EVERY release
Pre-upgrade encrypted backup; never clear browser storage, delete history or uninstall the PWA. Validate a no-migration upgrade using synthetic records, real IndexedDB, offline cache and a Samsung device before describing the app as fully validated.

---

# Health Dashboard — status after v1.3.0 (9 November 2026)

## Included and verified in this release

- 576 offline contextual coaching combinations, milestone-first priority and no repeating daily water-weight warning after the first week.
- Day 8 weekly milestone and previous journey week always available on Progress (not replaced with an empty Monday score).
- Weekly photo reminder with Front, Side, Back, Face view completion, two-day snooze and skip, without affecting Momentum.
- Exact hours/minutes sleep entry, consistent with a separate count for all nighttime awakenings (bathroom-only legacy values untouched).
- Explicit morning Rest / Recovery Day with zero planned activity credit.
- Withings fat mass, muscle mass and optional bone mass in lb, automatic calculated fat percentage from recorded weight, initial four-week-context messaging.
- Saved screen-time and social-media totals now displayed with weekly averages and a dedicated edit option.
- Consolidated milestone hero on Today; standard coach still appears on other mornings.
- All previous v1.2 features retained: 50% actual-exercise credit, live food target, distinct over/under status, no-Monday-reset coaching, active-injury record, body-weight trends, achievements, closeout, offline 174 lessons.

## Long-term / needs more personal history

- **Calorie calibration:** A validated estimate of maintenance energy requires several weeks of weight, energy-intake and exercise data; Garmin figures alone cannot make it exact. Review the 2 lb/week aspiration against ongoing hunger, sleep and training recovery.
- **Plateau insights:** Trigger only with sufficient multi-week evidence; avoid confusing water fluctuations with fat loss or muscle loss.
- **Body composition:** Broader 4–8-week charts and combined waist/photo/strength comparison after enough samples exist.
- **Training forecasts:** More robust probability ranges for Ryde 10, Solent Half and Madrid once running resumes.
- **Learning:** More illustrations, interactive knowledge checks, deeper references and optional review paths without changing completed lessons.
- **Coaching preferences:** Optional 'More like this' / 'Not for me' ratings to bias future offline message selection; the present deterministic cycling already changes messages by date/context.
- **Reminders:** Open-app prompts work offline. Reliable closed-app push notifications would require separate browser/platform permission and infrastructure.
- **Maintenance mode:** A separate, explicit goal and coaching profile after the active weight-loss phase.
- **Integrations:** Garmin, Withings and Nutracheck remain manual-only at the user's request; automatic connections are deferred.

## Regression checklist for every future release

1. Export the encrypted `.healthdash` backup on the device. Do not uninstall the PWA or clear storage.
2. Verify old banked days, bodyweights, photos, records, injuries and lessons stay identical after update.
3. Check every numeric form for decimals versus whole numbers; submit, save, reopen and verify actual values.
4. Check current-day calorie budget, planned/actual activity links, target status and Momentum after editing.
5. Confirm milestone only appears for a genuinely completed week; future photo prompt shows expected views and isn't repeated after completion.
6. Test 360px-wide Samsung layout, offline service worker and version display.
