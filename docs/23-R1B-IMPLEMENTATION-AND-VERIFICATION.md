# R1B implementation and verification

2026-09-16 final status: R1B is locally complete. The final host execution passed functional, storage, recovery, multi-tab, backup/import and migration checks plus the settled worker, dense end-to-end, render, pending and default-interaction gates. Its 32 >=50 ms observer entries are all attributable to the verifier's full-workspace `readTool.execute()` inspections; none overlaps application work after inspection intervals are excluded. Raw evidence remains preserved, and the attribution/final acceptance records are `long-task-attribution-acceptance-20260916.json` and `r1b-local-acceptance-20260916.json`. No rerun was performed for attribution. R1C is not started and publication is not authorized.

2026-09-16 superseding evidence: the instrumented host run failed at dense iteration 0/request 7. Worker success was 259.7 ms; atomic persistence failed, total 909 ms. This confirms an implementation/storage and completion-gate failure; the prior uncertainty below is historical. [Storage architectural review 24](24-R1B-STORAGE-ARCHITECTURAL-REVIEW.md) preserves the structured host evidence and measurements. Planning only; no subsequent browser pass is claimed.

Build candidate: `WF-R1B-20260916`. Status: implementation complete through automated/static gates; required host-browser worker and responsiveness gate pending. No publication.

## Implemented locally

- Approved smooth-local attractor equation, tension profile and exact identity shortcuts from document 20.
- Outward binary64 endpoint enclosures, evaluator-specific chord certificates, complete expanded k/t source domain, incoming outside strands and bounded deterministic work.
- Versioned `polygon-polyline-v1` analytical clipping, concave fragments, source t/error/provenance and explicit unclipped-curve accuracy scope.
- Schema 5 with write-once schema-4 raw recovery, mixed immutable v1/v2 revisions, saved field recipe, backup/fork validation and complete raw derived SVG.
- Dedicated `r1b-worker-v1` latest-request execution, canonical request/base/input identities, worker termination, stale-result checks, pending guide/last-complete display, atomic trusted-result persistence and one-step history.
- Pending save/export restrictions, cancel/Undo behavior, worker timeout/retry/unavailable behavior and asynchronous v2 reload/import certification.

## Automated and static gates — passed

52 tests pass. New coverage includes exact deformation/tension fixtures, nextUp/nextDown boundaries, epsilon certificates, incoming sources, concave clipping and monotone source parameters, mixed immutable v1/v2 saves, schema-4 raw recovery, exact worker request/result identity and typed failure envelopes. All 43 earlier foundation/R1A tests remain represented and pass with schema-5 expectations where applicable.

Latest dense certified-kernel run (30 warmed, 100-edge alternating boundary, both families spacing 2.5, R=150): p50 190.97 ms, p95 202.84 ms, maximum 220.38 ms. This passes the worker computation limits p95 <=300 ms and max <=400 ms. The latest result governs this report.

All public modules pass syntax checks. Static entrypoint/local assets, private-output exclusion, rebuild-only hosting target and `git diff --check` pass (existing line-ending notices remain).

## Required browser gate — failed; instrumented rerun required

`scripts/r1b-browser.cjs` covers pending display, latest-request/coalescing, pending Undo cancellation, 30 dense browser-worker completions, schema-5 save/reload certification, clean console and Long Task checks. `scripts/verify-r1b-local.ps1` runs it from a normal Windows PowerShell host.

The first normal-host run failed in the 30-run dense worker loop at the old `scripts/r1b-browser.cjs` line 19. Its `waitCycle()` observed `CALCULATING` but timed out after 2000 ms while waiting only for the success phrase `CERTIFIED ATTRACTOR COMMITTED`; PowerShell then reported `R1B browser checks failed`. The failed run produced no `browser-results.json`. The old harness did not retain the failing iteration, request identity, final application status or typed worker error, so this evidence does not distinguish an application timeout/failure from the harness's transient-status race. It is a failed gate, not a pass and not evidence supporting a larger timeout.

The revised instrumentation records every request sequence and request ID, the dense-loop iteration, worker and request-to-commit timings, terminal event, typed error, final status, pending/active request and recent lifecycle events. It writes `browser-failure-latest.json` and `host-browser.log` on failure. The observer allows at most 1100 ms only so Playwright can capture the application's terminal state after its deadline; the application timeout and asserted maximum remain exactly 750 ms. The harness no longer depends on seeing transient `CALCULATING` or success text and therefore removes that test race. A revised host run is required to determine whether the previously hidden terminal outcome is an implementation failure or whether the request commits within contract.

Codex's Windows sandbox cannot start Chrome (`spawn EPERM`), the same IPC restriction encountered during R1A. Do not claim R1B locally verified until `verification/local-r1b/browser-results.json` exists and is reviewed. The required gates remain pending <=50 ms, worker p95/max <=300/400 ms, end-to-end p95/max <=500/750 ms and no attributable main-thread task >=50 ms.

No Site, Tangent, Overlap or R1C change occurred. Publication remains forbidden.
