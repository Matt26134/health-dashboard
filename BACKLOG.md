# Health Dashboard — post-v1.2 backlog (6 November 2026)

## Delivered in v1.2.0
- Mobile Today redesign: date/day, selective contextual coach, live food budget, actionable checklist, expandable secondary detail, evening closeout last.
- Single exercise-adjusted food budget: 50% of completed exercise energy; matched planned workouts replaced, extra sessions counted once; explicit vs inferred links explained in Training.
- Distinct nutrition-log credit and calorie-target credit; higher-calorie days are described accurately without punishment advice.
- One precise activity entry/editing route (h:m:s) and nutrition form supporting decimals; Garmin active/total/unknown flag for new/edited entries.
- Injury-aware coaching: active restrictions from injury data, full recovery card in Training and no lingering injury messages once resolved.
- Sleep field now counts all noticeable awakenings; legacy bathroom-trip entries preserved separately.
- Daily report and next-day support-plan improvements from v1.1.4 retained.
- Existing Progress/Madrid journey, achievements, education, photo comparisons, encrypted backup and reports retained.

## Monitor after real-device update
- Check the app version, previous five days, banked reports, medals, photos, weigh-ins and activities; always export an encrypted backup before deployment.
- Check exercise-calorie basis for historical Garmin recordings: older data may not label active vs total calories. No silent historical edits.
- Check planned-vs-actual matching when two sessions share the same activity type; inferred links are approximate and can be improved with explicit matching.
- Test bedtime confirmation after waking and correct later-day display, all Samsung keyboard types, and scrollable modal forms.
- Monitor motivation language and over-target coaching for variety as more daily data accumulates.

## Future enhancements (not claimed as complete in v1.2.0)
- Individual adaptive exercise-credit and calorie target calibration once weeks of data exist; avoid aggressive deficits if hunger/sleep/recovery worsen.
- More substantial lesson exercises and evidence references; advanced photo comparisons and long-term plateau, sleep and habit trend insights.
- Optional goal reset/maintenance mode and more nuanced injury rehab/rebuild plans.
- Better proactive reminders: offline/open-app prompts only; closed-app push delivery would need separate infrastructure and consent.
- Optional connected integrations (Garmin, Nutracheck, Withings) only after user chooses to enable them.

## Data integrity
- Do not reset the existing IndexedDB data, reinstall the app or clear site storage to deploy an upgrade.
- Automatic recalculation is limited to the *current unbanked day*. Past reports stay closed and unchanged; details can be reviewed without reopening.
