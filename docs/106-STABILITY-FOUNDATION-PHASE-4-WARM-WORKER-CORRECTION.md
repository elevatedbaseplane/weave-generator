# Stability Foundation Phase 4 — warm-worker correction

Date: 2026-09-21  
Build: `WF-STABILITY-P4-WARM-WORKER-20260921`  
Status: verified correction to the completed Phase 4 build; Phase 5 has not started.

## Reported failure

On the published Phase 4 Site, **Add Influence** reported `NOT APPLIED · CERTIFIED INFLUENCE COMPUTATION EXCEEDED THE 750 MS COMPLETION MAXIMUM`. The failed request retained the existing three-family weave and saved no partial influence.

Production worker telemetry recorded a first-influence request dispatched at about 309640 ms and rejected at 750.5 ms with `completion-timeout`. Earlier edits on the same page had returned `Identity combined configurations use identity derivation.` The application treated that typed evaluator response as a failed worker, terminated it, and left the later first-influence request to create and load a worker on the critical path.

## Correction

Combined identity candidates now select the existing exact `deriveIdentity` evaluator inside the combined certified worker. They still pass through the same request identity, dependency plan, validation, and result gates used by active influences.

A typed worker result failure no longer destroys a responsive worker. True worker load, crash, and timeout failures still terminate it and immediately prime a replacement. An idle worker is also primed at application startup. The 750 ms completion maximum and every other workload, geometry, storage, and recovery limit remain unchanged.

## Verification

- Full Phase 4 focused suite after the correction: 128/128 passing.
- Final affected worker tests: 9/9 passing.
- Preserved Phase 0 diagnostic, fixture, reload, and return checks: 8/8 passing. The historical Phase 0 production-byte assertion is intentionally outside this set because approved Phases 1–4 changed production files; its locked fixtures were not edited.
- All `dist/*.mjs` syntax checks, `node scripts/check.mjs`, and `git diff --check` pass.
- A Node persistent-worker regression sends an identity combined candidate and then the first active influence to the same worker. Both succeed; the identity result is exact `weave-study-v1`, the active result is the combined study, and each remains below the existing 400 ms worker maximum.

## Managed-browser result

An isolated three-family local project reproduced the relevant sequence:

1. Change Family A spacing while the combined generation has no active influence.
2. Confirm the certified identity edit applies and saves.
3. Immediately add the first influence.
4. Confirm `CERTIFIED CHANGE APPLIED · 29.1 MS WORKER`, followed by `APPLIED + SAVED · INFLUENCE ADDED`.
5. Reload and confirm one influence and 31 derived strands remain saved.

The existing Phase 0 fixtures were untouched. This correction does not begin Phase 5.
