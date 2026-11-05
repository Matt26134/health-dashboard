# Health & Performance Dashboard — v1.1.4

Offline-first manual-tracking PWA hosted on GitHub Pages.

## Upgrade from any earlier v1.1.x (including v1.1.2)
1. While still using the current installed app, export an **encrypted backup** and keep the password.
2. Unzip this release and upload **all root files** to the existing GitHub repository. You **do not need** to install v1.1.3 first.
3. Deploy, visit `https://matt26134.github.io/health-dashboard/?release=1.1.4` online, and restart the installed PWA.
4. Check Settings shows v1.1.4, that three banked days remain, and that the nutrition, activity and photo data are intact. Do **not** uninstall the PWA, clear site data, or reset the local database.

All entries are stored locally by site origin in IndexedDB; uploading files to GitHub does not migrate or clear the database. The service-worker cache name changes to refresh application assets.

### What changed
- An actionable Day 4 plan (saved and recalled)
- A personal, dynamically generated Close Today report without modifying the archived report
- Actual bedtime target is visible and editable; actual bedtime confirmed in the morning
- Today displays total fluids when entered
- Includes the 1.1.3 decimal-input fix and all 1.1.2 activity-entry fixes

Test report and remaining backlog are in BACKLOG.md and CHANGELOG.md.
