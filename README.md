# Health Dashboard v1.4.0 — The Personal Coach

**Release date:** 13 November 2026. **Next circumference check-in:** Monday 16 November 2026. 

An incremental update to the existing private, manual-first, offline-first Health & Performance Dashboard. It is **not** a new application, database or user profile. Install it in your **existing GitHub Pages repository** and keep using the **same installed PWA** on the **same browser/profile**.

## Before you update — essential

1. Open the **currently installed dashboard** on your Samsung, while it still shows your real data. In **Settings**, export an **encrypted `.healthdash` backup**. Keep the exported file and its password somewhere safe; verify the file is present.
2. Extract this ZIP locally. Copy/commit **the contents of the ZIP's root** into your existing health-dashboard GitHub Pages repository, **replacing older files**, including `index.html`, `styles.css`, all `*.js`, `sw.js` and `version.json`. Do not put all the files inside a newly nested folder. Keep the existing repository URL and app installation.
3. Once GitHub Pages has finished publishing, open **`https://matt26134.github.io/health-dashboard/?release=1.4.0`** in the **same Samsung browser/profile** while online, then return to or relaunch your existing installed dashboard. Confirm the version shows **1.4.0** in Settings. If the previous version remains, fully close/reopen the app while online; don't delete data, clear site storage or uninstall the PWA.
4. Check existing **weigh-ins, photos, banked days, calorie history, injuries, trophies and completed lessons** before entering more data. If something looks missing, do **not** reset or import a demo: first check that you're using the original URL and browser profile. Retain the backup.
5. On **Monday 16 November**, go to **Progress → See changes beyond the scale → Log measurements**. The suggested values are optional, in **inches**: waist, stomach, hips, chest, neck and thigh. Upper arm is available under **Choose tracked areas**. One measurement per area per date is kept; a later correction updates it rather than creating a fresh result. The form can be previewed before Monday but cannot save a future date.

### What changed

- **Today:** A personalised narrative drawn from the actual day's banked report, food, movement and check-in context replaces the generic closeout summary. Once banked, stale morning coaching disappears, and the correct banked day count appears. The saved historical report is not modified.
- **Progress:** A **Weight history & edit** button lists previous weigh-ins and lets you correct their date, value and note without overwriting their record IDs. **Photos & categories** allows category/date/note corrections, with original images preserved, plus existing side-by-side comparisons.
- **Circumference:** New optional weekly measurements from **Mon 16 Nov**, stored as additional rows in the existing `measurements` store. Review or correct individual records and see 3–4-week comparisons once available. Circumference is not a precise measure of fat loss by body part.
- **Discovery:** A small offline weekly recap distinguishes something achieved, an emerging data pattern (only if sample thresholds are met), and a practical experiment. Observational comparisons are never described as causal evidence.
- **Learning:** An applied, shorter challenge with choices, feedback, optional deeper original evidence and a take-away replaces the long default lesson reader. Core exercises for Days 1, 3 and 12–20 are tailored; the rest of the 174 lessons have a topic-based challenge as a first pass. Original complete lessons, sources, dates and lesson completion records are retained.
- **Forecast:** The early Madrid target-date extrapolation is withheld until there are 21 distinct weigh-in dates covering at least 28 days. The existing bodyweight and nutrition data, dynamic 50%-exercise credit and training paths remain unchanged.
- **Coaching fixes:** Removed a misleading generic higher-calorie statement from reports that are within their target; improved distinction between short sleep and actually reporting tiredness; fixed the empty 'you flagged as challenges' text. Some previous coaching limitations remain in the backlog.

### Data safety and compatibility

- **IndexedDB:** Existing `HealthDashboardDB`, **schema version 5**, **17 stores**. No new database version, store clearing, bulk overwrite or silent migration.
- **Encrypted backup:** The `.healthdash` export/import implementation is unchanged. This release adds no new encrypted backup format.
- **Historical report preservation:** A corrected weigh-in is not silently applied to an already-banked report. It may therefore differ from the historical snapshot by design. Reopening/rebanking days should remain a deliberate user action.
- **Photos:** Original local `dataUrl`, storage record IDs and image contents remain intact when metadata is edited. Photo comparisons require two photos in the same category.
- **Lessons:** The 174 original lesson entries and old `completedAt` timestamps remain; newly completed lessons optionally save `experienceV14` alongside the same entry.
- **Offline:** All new analyses run locally in JavaScript. No AI API, remote health integration or internet access is used for coaching. Going online is necessary only to install/update from GitHub Pages.

### What was actually tested

- Syntax checked every JavaScript file using Node.
- Used a **360px mobile viewport Chromium DOM simulation** with a synthetic in-memory implementation of the 17-store database; tested rendering, opening reports, corrections to weight and photo metadata (record IDs unchanged), photo comparison, Monday measurement entry/correction, lesson completion and preservation of 12 synthetic banked reports and 174 lesson records.
- Tests found and corrected a startup reference error and a report-button event error. No browser JavaScript exceptions remained in the final synthetic interaction suite.
- The **real Samsung-installed PWA**, real IndexedDB upgrade, service-worker activation, encrypted backup restore and actual GitHub Pages hosting **were not end-to-end tested in this environment**. Validate those with the existing backup safely saved before deployment.

See `CHANGELOG.md` for release notes, `BACKLOG.md` for outstanding items and `TESTING.md` for a short acceptance checklist. **Never uninstall, clear site storage or reset the app as an upgrade step.**
