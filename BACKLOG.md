# Health Dashboard remaining / future backlog after v1.1.0

## Intentionally deferred
- Automatic Garmin, Withings and Nutracheck integration: must have secure credentials and a separate service; app stays manual-first and offline-capable.
- Reliable scheduled mobile push while app is **closed**: not provided by local in-app reminder settings; would require a supported scheduling/push mechanism and platform/permissions testing.
- More extensive race-performance models using recent fitness/heart rate and course profiles: v1.1 only gives clearly labelled approximate conversions using real recorded race results or manual PBs.
- Stronger inference in Personal Insights after substantial logged history; current comparisons are descriptive, require minimum group sizes and never claim causes.
- Fully automated calorie calibration in maintenance: intentionally user-controlled and should only change with adequate trend/adherence evidence.

## Product rules
- Do not wipe real records during software upgrades.
- Offline remains the default. No AI chatbot dependency.
- No pressure-based injury return; adapt and suggest assessment if worsening/persistent.
- Do not penalise earned progress or use guilt-based gamification.
- Scores and advice should always have an accessible explanation.
- Build changes as consolidated, tested releases rather than numerous patches.


## Future polish beyond v1.1.1
- Optional permanent record of precise badge unlock timestamps (currently achievement status is derived, with no invented dates).
- Optional manual linking of historic planned activities where no plan-session record survived, without altering closed-day scores.
- Further evidence-backed coaching variation after several weeks of real observations.
