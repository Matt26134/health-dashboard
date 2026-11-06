# Health Dashboard 1.2.0

Offline-first GitHub Pages PWA. Upload ALL files in this ZIP to the **root** of your existing health-dashboard repository. Do not uninstall the PWA, clear browser site data, create a new repo or reset the app. Your private data lives in the existing IndexedDB database in your browser profile.

## Safe update
1. Open the currently installed app and export a password-encrypted `.healthdash` backup from Settings; store it safely.
2. Extract this ZIP. Upload/replace every file (including `experience-v120.js`, `index.html`, `styles.css`, `sw.js` and `version.json`) in the existing repository.
3. Wait for GitHub Pages to deploy; open `https://matt26134.github.io/health-dashboard/?release=1.2.0` once while online, then restart the installed app.
4. Verify Settings shows v1.2.0 and your previous weights, activity history, lessons, photos and banked reports are still present.
5. Check the live calorie target and open Training; if stale, close all installed app tabs and revisit the URL online. Do not clear browser storage.

## Scope and limitations
Manual Garmin, Nutracheck and Withings input remains the primary workflow. Exercise credits are approximate; neither Garmin nor the app can accurately measure exact energy expenditure. New and legacy activity calorie types may be unclear. The 50% fraction is a configurable policy of this release, **not** a guaranteed medically appropriate intake. Banked days are never automatically reopened or re-scored. In-app reminders cannot reliably send notifications when the app is closed.

## Files
Static JavaScript/CSS/HTML, curriculum, manifest, service worker and icons. There are no account credentials, medical records or personal photos bundled in the ZIP.
