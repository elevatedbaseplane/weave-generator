# Phase 5 correction — influence movement and saved-study recovery

Date: 2026-09-21  
Build: `WF-STABILITY-P5-WORKER-RECOVERY-20260921`  
Status: verified correction to the completed Phase 5 build; Phase 6 has not started.

## Reported failures

Moving an existing influence through the canvas could show a valid preview and then snap back on release with `CERTIFIED INFLUENCE COMPUTATION EXCEEDED THE 750 MS COMPLETION MAXIMUM`. The affected production tab also paused storage after reload with `SAVED STUDY VALIDATION EXCEEDED 750 MS` while opening an older five-influence weave.

Production telemetry showed that pointer movement repeatedly cancelled obsolete preview jobs. The release then cancelled an in-flight preview for the exact same final input and restarted it on a cold worker. The restarted request reached 754–760 ms even though the same five-family calculation completed in about 100–114 ms on a warm worker.

Reload validation separately created and loaded a new worker for every saved revision. The older five-influence revision therefore paid repeated worker startup costs and incorrectly caused storage protection to block later backups.

## Correction

Pointer release now promotes an in-flight preview when its canonical input and committed base exactly match the final release candidate. The same certified result completes the commit; it is not recalculated. When a genuinely obsolete preview must be terminated, a replacement worker is primed immediately.

Workspace reload and import validation now use one private persistent worker for the complete serial validation pass. Every saved revision still regenerates and compares its canonical certified geometry independently. The worker is terminated when validation finishes or fails.

No geometry, storage schema, saved revision, migration, workload, or timing limit changed. The 750 ms completion maximum remains enforced.

## Verification

- Correction and Phase 5 preservation suite: 75/75 passing.
- Frozen Phase 0 baseline: 8/8 passing.
- Syntax, static entrypoint/reference, and `git diff --check` checks pass.
- Regression coverage proves identical preview-to-release promotion, immediate replacement-worker priming, and one persistent reload-validation worker for current and saved revisions.

## Managed browser result

The local Phase 5 review project was expanded from one to five influences. Adding the fifth influence completed in 28.3 ms of worker work and its compact backup settled successfully. Moving that fifth influence directly on the canvas applied and saved in 50.3 ms of worker work. Reload restored all five influences, reported `storageBlocked: false`, and retained an idle, nonfailed autosave state.

The production workspace that reported the defect remains the final compatibility check after deployment. Phase 6 has not started.
