# Health & Performance Dashboard v0.99.0 — Full Dress Rehearsal

Local-first personal PWA for motivation, weight loss, running/performance, habits and behaviour-change learning.

## Architecture

- **GitHub Pages** hosts only the application files.
- **IndexedDB (`HealthDashboardDB`, schema v4)** holds personal records locally on the device/browser profile.
- **Encrypted `.healthdash` backups** protect portable copies using the existing password-based AES-256-GCM backup flow.
- **Service worker + manifest** provide installable/offline PWA behaviour.
- **Optional secure connector** is separate from this public repo. It holds Garmin/Withings secrets and returns normalised values for local import; it is not the long-term health database.

## v0.99.0 adds

- Full Road-to-Madrid curriculum: **174 daily lessons/review days** through 25 April 2027.
- Lessons now expand into real ~3–4 minute reads, evidence/further-reading links, practical experiments and a knowledge check before completion.
- **84 launch badges** spanning consistency, weight, training, learning, resilience, seasonal milestones and non-scale progress.
- Garmin/Withings connector UI and import logic; Nutracheck remains a fast daily-summary workflow.
- Progress photos stored locally (resized on-device) and included in encrypted backups.
- Screen-time and actual-bedtime fields in daily check-ins.
- Full Day-1 onboarding, launch preflight, reversible Test Drive, injury-aware coaching, transparent Momentum/H&P scores and weight-progress engine from earlier releases.

## Update an existing install

Upload all files from this folder to the root of the existing `health-dashboard` GitHub repo, replacing the existing files. Leave GitHub Pages settings alone. In the installed app use **Settings → Check deployed version → Reload latest**.

The upgrade is in-place. Existing v0.9 local records remain in IndexedDB. The lesson seed is intentionally bumped so an existing v0.9 database receives all 174 curriculum entries while preserving completed lesson state.

## Data connections

The PWA remains fully usable manually. For automatic Garmin + Withings imports, deploy the separate `HealthDashboard-Connector-v1.0.0` Cloudflare Worker package, configure its secrets privately, then enter only the Worker URL and the separate connector access token in **Settings → Configure connector**.

Never commit Garmin API keys, Withings client secrets, OAuth tokens or the connector bearer token to this GitHub Pages repo.
