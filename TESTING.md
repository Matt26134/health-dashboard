# v1.4.0 testing and acceptance notes

## Tested with isolated synthetic records, 13 November 2026

- PASS — all JavaScript files parse with `node --check`.
- PASS — mobile 360px simulated Chromium startup, no unhandled JavaScript exceptions after test fixes.
- PASS — 12 synthetic saved daily reports display a contextual banked Today card with current total, and the stale morning card is not shown.
- PASS — `View report` opens the saved report; a within-target day does not receive the generic 'higher-calorie' notice.
- PASS — Progress opens editable weight history, correcting a synthetic 208.7 lb reading in place without changing the ID.
- PASS — category/date/note photo editor preserves the original synthetic image and ID; two same-category photos compare in the existing comparison view.
- PASS — measurement form defaults to 16 November, disallows saving future measurements on 13 November, accepts 39.5 in waist and 40.7 in stomach on 16 November, shows history and corrects the waist to 39.3 in.
- PASS — interactive lesson requires a decision and application before completion and retains its `completedAt`; 174 original lesson records and 12 report rows remain.
- PASS — early target-date forecast hidden in a 12-day synthetic record.
- PASS — original IndexedDB schema constant remains at version 5, with 17 existing stores, and service worker pre-caches the new script.

**What this does not prove:** Chromium tests used `page.set_content` and a mock implementation of `HealthDB`; they do not exercise IndexedDB's actual transactions, cryptographic backup restores, GitHub Pages networking, Samsung-specific PWA layout/performance or service-worker lifecycle. No genuine personal data was loaded or edited.

## Suggested Samsung post-deployment smoke test

1. Export encrypted `.healthdash` backup in v1.3 before installing the new source files.
2. Deploy files in-place to the same GitHub Pages repository and open the same browser profile and installed PWA, **without clearing storage**.
3. Confirm Settings shows v1.4.0. Verify the oldest and newest weigh-ins, saved weeks, progress photos, exercise log, achievements, 174 lessons and injury records are still present.
4. On Today, check the banked card, complete a day's closeout and reopen the report. Confirm no broken text, no duplicate coaching and no changes to old reports.
5. On Progress, open Weight history, then Photo categories; correct a synthetic or safe-to-correct historic value intentionally and re-open to verify persistence. Check view comparison with matching categories.
6. On Monday **16 November 2026**, record optional waist and stomach measurements in inches, reopen History & edit, and check 0.1 precision.
7. Complete a new lesson; check its original completion remains after reloading, and past completed lessons are still marked completed.
8. Go offline/airplane mode and relaunch the installed PWA. Check Today, Progress, Training and Learn still work. Do not assume the upgrade succeeded until this passes.

If any historic entries appear missing, stop and check the app origin/browser profile and available backup before attempting any import or fix. Do not clear data.
