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
