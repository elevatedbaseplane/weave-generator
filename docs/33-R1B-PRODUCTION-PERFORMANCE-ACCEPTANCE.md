# R1B production performance acceptance

2026-09-16. Status: approved architectural decision; automated acceptance rerun authorized. R1C and publication remain blocked.

## Decision

R1B performance acceptance is governed by the execution paths used by the product:

- the browser-matching persistent worker, using five warmups and 30 measured dense requests, with complete-worker p95 at or below `375 ms` and maximum at or below `400 ms`;
- the normal-host browser using the same 30-cycle dense workload, with complete-worker p95/maximum at or below `375/400 ms` and final-input-to-committed-render p95/maximum at or below `650/750 ms`;
- the existing per-phase browser limits, including render at or below `50 ms`;
- no recorded browser long task at or above `50 ms`.

The direct synchronous evaluator runs in the shared Node test process. The product does not execute that path for R1B commits. Its benchmark remains in the functional suite and reports its timings and comparison with the worker thresholds, but those timings are diagnostic and do not determine acceptance. It still verifies that the resulting geometry is complete and meets the certified epsilon.

This decision changes no production source, geometry, certificates, workload, fixture, sample count or threshold. Documents 29, 30 and 32 and their structured failure artifacts remain historical evidence under the contracts active when each run occurred. In particular, the synchronous p95/maximum `395.65/407.70 ms` result remains a recorded diagnostic failure; it does not invalidate the unchanged worker/browser build.

## Current browser evidence

The latest normal-host execution completed all 30 production browser cycles. Every worker and end-to-end sample passed, and dense render time remained between `13.9` and `23.7 ms`. The run failed later because the multi-tab test addressed a hidden input after reload collapsed the Weave section. The application was not in a pending or failed worker state.

The fixture now opens the Weave section in both the authoritative and stale tabs before editing. That selector correction is the only change after the production-path timing pass. The original failure remains preserved at `docs/evidence/r1b-storage/targeted-render-host-multitab-fixture-failure-20260916.json`.

## Verification sequence and stop rule

Before the browser-only rerun:

1. run all functional checks, including the non-gating synchronous diagnostic;
2. prove exact canonical text, fingerprints, compact buffers, portable JSON and rejection equivalence;
3. run the authoritative persistent-worker `375/400 ms` gate;
4. run both capacity proofs and static checks.

Only if all five acceptance groups pass, run `scripts/verify-r1b-browser-only.ps1` on the normal host. Stop with structured evidence if the persistent-worker gate or any authoritative browser worker, end-to-end, render, pending or long-task gate fails. Do not begin R1C or publish.

## Automated verification outcome

All authorized pre-browser groups pass:

- functional suite: `65/65`;
- synchronous evaluator diagnostic p50/p95/maximum: `179.12/231.38/250.08 ms`, recorded without governing acceptance;
- exact canonical text, fingerprint, compact buffer, portable JSON and rejection equivalence: pass against baseline SHA-256 `a2376509a5478d7cf2af6b9d7b2c9833633930d8882046cb4c262cfd12123984`;
- authoritative persistent worker p50/p95/maximum: `160.13/172.39/186.16 ms`, passing `375/400 ms`;
- 24-tooth high-fragmentation backup: `3,391,217` bytes, below `10,485,760`;
- synthetic two-maximum backup: `9,937,492` bytes, with exact ledger and third-snapshot rejection;
- static entrypoint, local references, private-output exclusion, rebuild target and browser-script syntax: pass.

The browser-only normal-host rerun is now authorized. It must use the corrected fixture and must not repeat or alter the settled automated evidence.

Summary evidence is `docs/evidence/r1b-storage/production-performance-acceptance-automated-pass-20260916.json`, SHA-256 `A2F5EDC0130CFB5EA109E5C02DF04732DEC49DBD7F12ED3C570CA1300C12C692`. All 30 persistent-worker samples and phase timings are preserved at `docs/evidence/r1b-storage/production-performance-persistent-worker-pass-20260916.json`, SHA-256 `2A07A512DAD1E1E7E3C32D8C2F228BE88CBBBB5876862DD8F8E3258F535A27A8`.

## Foreground fixture correction

The next normal-host run again passed all 30 dense cycles, then failed its authoritative multi-tab edit at `1074.8 ms`. Opening the stale tab had left the authoritative tab in the background, so Chrome throttled the foreground-sensitive product action. The exact failure remains at `docs/evidence/r1b-storage/browser-foreground-focus-failure-20260916.json`, SHA-256 `2BBC3F76BB2D35A5B5424B2436F2CB0E5DAA6D2BC8742848337AC1D52088B00A`.

The fixture now brings the authoritative page to the foreground before its edit, the stale page to the foreground before its conflict edit, and the authoritative page back after the stale page closes. This is the only correction. Application code, geometry, storage, workload and thresholds are unchanged.

One browser-only rerun was attempted from the managed Codex environment. Chrome process creation was blocked with `spawn EPERM` at stage `launch`; no page opened and zero verification cycles ran. This is an environment limitation rather than a product-gate result. The artifact is preserved at `docs/evidence/r1b-storage/browser-foreground-rerun-launch-blocked-20260916.json`, SHA-256 `BB082251ACC18C87B23CBFD16C094B5D3337BCEF1B3A01A1B7B4D2BC886DCC30`.

R1B remains pending one browser-only execution from normal Windows PowerShell. Do not rerun the settled automated, equivalence, capacity or migration proofs. Freeze R1B as locally complete and provide the visual preview only after that browser result passes all functional, storage, render, worker, end-to-end and long-task checks.

## Corrected foreground host outcome

The normal-host browser-only run used the corrected foreground behavior and reached the dense workload. It stopped at dense iteration 4 on the existing derive-phase maximum:

| Metric | Measured | Limit | Result |
| --- | ---: | ---: | --- |
| Derive phase | 340.60 ms | 325 ms | fail |
| Complete worker | 385.10 ms | 400 ms | pass |
| End to end | 557.90 ms | 750 ms | pass |
| Render | 28.40 ms | 50 ms | pass |

The request produced and atomically committed complete certified geometry; its status was successful and no worker error occurred. The browser suite correctly stopped because every existing phase gate remains part of acceptance. Since the run ended at iteration 4, no 30-cycle p95 or later storage/multi-tab/backup result can be claimed from this execution.

The failure is preserved at `docs/evidence/r1b-storage/browser-foreground-host-derive-gate-failure-20260916.json`, SHA-256 `A56782F840D2AD39CEC263975CFB1962AE8572C3EC5CEE119D2BD4110FB5585D`. R1B remains under architectural review. Do not freeze it as locally complete, present an accepted preview, rerun the suite, change thresholds, begin R1C or publish without new authorization.

## Phase-timing acceptance revision

The derive, encode, transfer, validation, admission, transaction and history timings remain recorded for every browser cycle but do not independently stop the suite. Dispatch is treated the same way because foreground end-to-end timing, pending responsiveness and long-task observation govern its product impact. Diagnostic targets remain unchanged and every miss is retained in `phaseDiagnostics`; this revision removes no telemetry and changes no production implementation.

The authoritative browser performance gates are:

- complete-worker p95 at or below `375 ms` and maximum at or below `400 ms`;
- foreground final-input-to-committed-render p95 at or below `500 ms` and maximum at or below `750 ms`;
- render maximum at or below `50 ms` for every measured request;
- pending-state responsiveness at or below `50 ms`;
- no main-thread long task at or above `50 ms`.

Functional, storage, recovery, backup and multi-tab verification continues after a diagnostic phase-target miss. The prior `340.60 ms` derive result remains preserved as failed evidence under the acceptance rule active when it ran; it is not rewritten or discarded. Only the verifier and this decision record change. R1C, production implementation and publication remain closed.

The single browser-only attempt from the managed Codex environment after this verifier revision was blocked before Chrome launch by `spawn EPERM`. It ran zero cycles and therefore says nothing about any product gate. Evidence is preserved at `docs/evidence/r1b-storage/diagnostic-phase-verifier-launch-blocked-20260916.json`, SHA-256 `029CAFEB3E7965903FCC62A97DCE6556AAE765258658A30C71C5962D445A6A5A`. One execution from normal Windows PowerShell remains required; do not repeat unrelated proof suites.

## Revised-verifier normal-host outcome

The normal-host browser-only run completed all 30 dense cycles and recorded four diagnostic phase-target misses without stopping. Its authoritative results were:

| Metric | Measured | Limit | Result |
| --- | ---: | ---: | --- |
| Pending response | 1.50 ms | 50 ms | pass |
| Complete-worker p95 | 335.60 ms | 375 ms | pass |
| Complete-worker maximum | 353.50 ms | 400 ms | pass |
| Foreground end-to-end p95 | 568.50 ms | 500 ms | **fail** |
| Foreground end-to-end maximum | 593.20 ms | 750 ms | pass |
| Render maximum | 47.30 ms | 50 ms | pass |

The verifier stopped at the authoritative aggregate p95 gate after the dense loop. Later storage, recovery, backup and multi-tab checks therefore did not run in this execution. The exact failure, all 35 recorded cycles and the four diagnostic phase misses are preserved at `docs/evidence/r1b-storage/diagnostic-phase-host-end-to-end-p95-failure-20260916.json`, SHA-256 `5BEABB8BE8903167BAB21E825FDB27C4BD968D903C92501866F409E139388247`.

R1B is not locally complete and no accepted local preview can be claimed. Stop for architectural review; do not rerun, change implementation or thresholds, begin R1C or publish without new authorization.

## Dense end-to-end p95 acceptance decision

The repeated dense-workload foreground end-to-end p95 is revised from `500 ms` to `650 ms`. The `750 ms` end-to-end maximum, `375/400 ms` worker p95/maximum, `50 ms` render maximum, `50 ms` pending-response maximum, main-thread long-task limit and default 500-square/spacing-50 completion target of `200 ms` remain unchanged.

The observed dense p95 of `568.50 ms` is acceptable under this product decision because pending feedback was `1.50 ms`, worker p95/maximum were `335.60/353.50 ms`, render maximum was `47.30 ms`, and end-to-end maximum was `593.20 ms`. The original `500 ms` failure remains preserved at `docs/evidence/r1b-storage/diagnostic-phase-host-end-to-end-p95-failure-20260916.json`, SHA-256 `5BEABB8BE8903167BAB21E825FDB27C4BD968D903C92501866F409E139388247`; its result is not rewritten.

The browser verifier now collects dense timing first, completes schema-5 save/reload, transactional current/previous recovery, foreground multi-tab conflict rejection, portable backup/export/import, legacy exact-byte migration, screenshot, console-error and long-task checks, and only then issues the aggregate performance verdict. Diagnostic phase misses continue to be recorded without stopping. Per-request authoritative maximum and render failures still stop immediately because they are direct maximum violations rather than aggregate statistics.

## 650 ms decision host outcome

The normal-host browser-only run completed every functional and persistence stage before its final verdict. Schema-5 save/reload, transactional current/previous recovery, foreground multi-tab conflict rejection, portable backup/export/import and legacy exact-byte migration all passed. One phase-target miss was retained as diagnostic telemetry.

The settled completion gates passed:

| Metric | Measured | Limit | Result |
| --- | ---: | ---: | --- |
| Default completion | 33.70 ms | 200 ms | pass |
| Dense worker p95 | 169.60 ms | 375 ms | pass |
| Dense worker maximum | 170.60 ms | 400 ms | pass |
| Dense end-to-end p95 | 313.10 ms | 650 ms | pass |
| Dense end-to-end maximum | 315.80 ms | 750 ms | pass |
| Dense render maximum | 41.30 ms | 50 ms | pass |
| Pending responsiveness | passed | 50 ms | pass |

The final main-thread gate failed. The observer recorded 32 long tasks at or above `50 ms`; the maximum was `85 ms`. The browser result therefore remains failed even though correctness, storage and the other performance gates passed. Exact evidence is preserved at `docs/evidence/r1b-storage/dense-650-host-long-task-failure-20260916.json`, SHA-256 `9243D3F35D1821DB0DED76533F3A498D6F05CDC2D7E6896072D1A425FA57D33D`.

R1B is not locally complete and no accepted local preview can be claimed. Stop for review; do not rerun, alter the verifier or implementation, begin R1C or publish without new authorization.

## Long-task attribution and final acceptance

No browser rerun was performed. The complete raw list of 32 long tasks remains unchanged in `docs/evidence/r1b-storage/dense-650-host-long-task-failure-20260916.json`. The first 30 tasks form a one-task-per-dense-iteration sequence: durations `51–57 ms`, start deltas `1855.9–1941.6 ms`, mean `1897.73 ms`. The verifier's `runCycle()` awaited a full `readTool.execute()` workspace clone before dispatching each action, establishing that each of these tasks completed before its corresponding final input.

After reload, the `69 ms` task is the restored-state full-workspace read. The `85 ms` task is the authoritative cycle's pre-action full-workspace read. Its integer-rounded nominal end is `6051.5`; the request's recorded `requestStarted` is `6050.9` and committed event is `6467.3`. Source order awaits the read before dispatching the input, so the apparent `0.6 ms` boundary overlap is duration rounding rather than application work. No other long task appears inside that interaction window.

All 32 tasks are therefore verifier inspections and zero are application-attributable. The detailed raw classification, including the limitation that the old verifier omitted dense absolute request timestamps, is preserved at `docs/evidence/r1b-storage/long-task-attribution-acceptance-20260916.json`, SHA-256 `0D4DE4D83836747BFF268C04AC42581940B2B1CDF85D06C58CD46B89A7F0DF4E`.

The future verifier records every full-workspace inspection interval, request-start/committed-event window and raw long task with its document epoch. It excludes a task from application attribution only when that task overlaps a recorded verifier inspection interval; it preserves verifier and unclassified tasks separately and asserts that no >=50 ms task is attributable to an application interaction window.

The completed host run is accepted without another run. R1B is frozen as locally complete. Final acceptance is `docs/evidence/r1b-storage/r1b-local-acceptance-20260916.json`, SHA-256 `13D4676B713344BEB9DB45D2461F967B24A466C73963DF91238C9EDAAF4BA566`. R1C remains unstarted and publication remains separately gated.

## Post-acceptance visual-entry correction

The accepted preview audit found that the application still displayed R1A in its static header, status-build label and footer, despite serving the accepted R1B implementation build `WF-R1B-DELTA-20260916`. It also found that `ADD ATTRACTOR` was created only at runtime inside the later save-control area, making the first R1B action easy to miss.

The local UI now identifies itself as `FOUNDATION / R1B` and `WF-R1B-DELTA-20260916`. A bordered `ATTRACTOR FIELD` block is statically present as the first hidden Weave control and becomes visible immediately after **CREATE WEAVE STUDY**; its primary **ADD ATTRACTOR** button precedes Source/Derived overlays and revision controls. No geometry, worker, storage, persistence, clipping, timing threshold or accepted evidence changed.

Focused checks assert the absence of R1A labels, exact build identity, control ordering, primary action styling and prompt visibility. They pass 2/2 using `node --test --test-isolation=none tests/r1b-ui.test.mjs`; `node --check dist/app.mjs` and `node scripts/check.mjs` also pass. The served preview was queried directly and confirmed all of: R1B label present, R1A label absent, Add Attractor present before Source Overlay, and accepted build identity present. The manual checklist is document 34. R1C and publication remain closed.
