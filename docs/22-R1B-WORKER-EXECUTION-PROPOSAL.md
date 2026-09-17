# R1B architectural review — latest-request worker execution

2026-09-16. Status: proposed for review only. This document responds to the measured R1B performance failure in [21](21-R1B-ARCHITECTURAL-REVIEW-EVIDENCE.md). It changes execution and acceptance timing, not geometry. No implementation, executable experiment, publication, R1C work, or Tangent/Overlap change is authorized or claimed.

## Recommendation

Run every active nonlinear R1B derivation in a dedicated module Web Worker under a **latest-request-wins** protocol. Keep the last complete committed weave on the canvas while a candidate is being certified. A worker result becomes authoritative only after the main thread proves that it belongs to the current session, board, study, committed base, exact latest candidate, protocol and algorithm versions, then completes storage preflight and one atomic workspace commit.

The approved deformation equation, falloff, tension, source parameterization, epsilon, interval enclosures, complete expanded source enumeration, workload limits, analytical clipping, diagnostics, schema rules, immutable saves and atomic failure behavior in document 20 remain unchanged. The worker runs the same full-quality evaluator used for commits. There is no coarse geometric preview and no partial geometry is labeled complete.

This reopens one statement in document 20: the old synchronous `p95 <=100 ms` derivation target is replaced by separate main-thread responsiveness and certified-completion gates below. That is an explicit architecture revision based on the recorded `205.72 ms` derivation p95, not a reduction in accuracy or workload.

## 1. Authority and state separation

The persisted workspace continues to contain only a complete, validated working state. Pending candidates and worker bookkeeping are transient application state, outside the workspace, undo history, saved revision libraries, backups and geometry hashes.

```text
CommittedState       last complete validated workspace and geometry
PendingCandidate     exact proposed working inputs, held only in memory
ActiveRequest        identity and lifecycle of the worker job, or null
QueuedLatest         newest coalesced candidate waiting for dispatch, or null
DisplayState         theme/visibility/view plus pending presentation; non-authoritative
```

The DOM and canvas never become sources of geometry. The worker receives a deep structured-clone snapshot containing only the exact candidate inputs and required immutable source context. It does not receive or write localStorage, history, saved libraries, DOM objects or display state. It returns a pure result envelope. The main thread remains the only owner of workspace persistence and history.

The worker module imports the same versioned numerical kernel used by non-UI verification. There is one evaluator implementation, not a fast preview formula and a separate commit formula. Worker use is an execution boundary, not a new derivation version by itself. A result still declares `derived-attractor-v1`, `bounded-polyline-v1`, `polygon-polyline-v1`, numeric policy and completeness from document 20.

## 2. Request and version identity

At page initialization create a random `sessionId`. Maintain a monotonically increasing safe-integer `requestSequence` for the lifetime of that page. Each job carries exact keys only:

```text
protocolVersion: 'r1b-worker-v1'
workerBuildId: application build identity
sessionId
requestSequence
requestId: sessionId + ':' + requestSequence
boardId
weaveStudyId
baseCommittedFingerprint
candidateInputFingerprint
algorithmVersions
candidate: complete immutable boundary/carrier/source-context/generation snapshot
```

`baseCommittedFingerprint` is SHA-256 over the canonical committed working inputs and active complete result identity. It prevents a result produced before an undo, restore, import, board switch or another successful commit from attaching to a changed base. `candidateInputFingerprint` uses the existing canonical sorted-key serialization and covers every geometry-affecting candidate input and all algorithm/numeric versions; it excludes request/session identity, timing and view state. The main thread computes it before dispatch. The worker recomputes it before work, rejects disagreement, and echoes it in the result.

The result envelope echoes all identity fields and adds the complete derived result, deterministic diagnostics, canonical result/content fingerprints, worker start/finish monotonic timings and a success or typed failure. Timing never enters a geometry hash. Messages reject unknown keys, unsupported versions, nonfinite data and oversized inputs/results. Do not accept a worker's claimed fingerprint without independently recomputing the candidate fingerprint and validating the returned schema on the main thread. The main thread need not rerun the expensive derivation for a result produced by the same versioned local worker; automated independent numerical tests remain the proof of the evaluator.

## 3. Latest-request lifecycle and coalescing

Only one worker computation may be authoritative at a time, and only one not-yet-dispatched candidate is retained.

1. On pointer/input start, capture the committed state and gesture identity. Update the transient attractor guide and numeric controls immediately.
2. Coalesce input events to the newest candidate once per animation frame. Replace `QueuedLatest`; never build a FIFO of obsolete positions.
3. During continuous input, wait for 40 ms of input quiet before dispatch. Pointer-up, keyboard commit, checkbox action, Remove and Add dispatch the final candidate immediately. This debounce changes scheduling only; it does not approximate geometry.
4. If no job is active, dispatch `QueuedLatest`. If a job is active for a different candidate, mark it stale, terminate that worker, and dispatch only the newest candidate in a fresh worker. Do not wait for obsolete computation to finish.
5. A new event received between termination and dispatch replaces the queued candidate. At most one final snapshot is sent.

Termination is the normative cancellation mechanism for v1. It is prompt and does not depend on `SharedArrayBuffer`, cross-origin isolation or a worker event loop reaching a cooperative checkpoint. Browser module/script caching may reduce restart cost but is not correctness state. A worker can additionally check internal cancellation between bounded batches for tests and graceful diagnostics; correctness cannot rely on that check. Every newly created worker must receive the same immutable module/build versions. Worker start cost is included in the completion gate.

Display-only toggles, zoom, pan and theme changes dispatch no geometry request. Source/carrier/boundary edits use the same request protocol when a v2 attractor weave is active. Identity shortcuts—absent/disabled/zero strength/maximum tension—remain exact R1A derivations and may commit synchronously only if their existing representative main-thread gate still passes; they never invoke the nonlinear evaluator.

## 4. Pending-state display

Pending begins as soon as a valid candidate differs from the committed state, before debounce or worker start. The canvas continues to draw the **last complete committed derived geometry**. It is visually de-emphasized and accompanied by a persistent, accessible label:

`CALCULATING — SHOWING LAST COMPLETE RESULT`

The pending attractor center/ring follows the candidate immediately and uses a distinct pending style. Numeric controls show candidate values. The committed source/derived overlays remain tied to the committed result; they must not appear to respond to the pending guide. The status includes a spinner/progress phase (`QUEUED`, `CERTIFYING`, `VALIDATING`, `SAVING`) and elapsed time, but no invented percentage because the workload is data-dependent. Screen-reader status is polite for phase changes and assertive only for failure.

The last complete geometry is never relabeled with the pending candidate's counts, fingerprints or settings. Summary text explicitly shows `COMMITTED` values separately from `PENDING` values. The pending guide is an authored-input preview, not derived geometry and not exportable.

When the exact latest result commits, replace geometry and controls together on one animation frame, remove the pending treatment and announce completion. On cancellation or failure, restore committed controls/guide/geometry and report the typed reason. If there is no prior complete geometry—for example, first Add Attractor—show the existing identity weave as the committed base plus the pending guide; do not show an empty or partial nonlinear result.

## 5. Stale-result rejection and atomic commit

A successful message is eligible only when all of these still match:

- active request object and `requestId`;
- current `sessionId`, boardId and weaveStudyId;
- request sequence equals the latest dispatched sequence;
- current committed fingerprint equals `baseCommittedFingerprint`;
- current pending candidate fingerprint equals `candidateInputFingerprint`;
- protocol, worker build, evaluator, approximation, clip, study and schema versions;
- complete-result schema, limits, deterministic diagnostics and returned hashes.

Any mismatch discards the message silently as stale, except a development diagnostic counter. It never changes the canvas, controls, workspace, history, persistence or error status for the newer request. A message from a terminated worker is stale by definition. Duplicate success is idempotently ignored after the first commit.

For an eligible result, construct the proposed complete working state off to the side. Validate structural/source/identity invariants and the worker envelope without recomputing nonlinear geometry on the main thread. Preflight the complete backup serialization and canonical localStorage compare-and-swap. Then write the new workspace. Only after successful persistence swap the in-memory workspace, record one history entry from the captured committed state to the new complete state, clear pending state and render it.

If validation, serialization, quota, concurrent-tab protection or localStorage write fails, the canonical store, in-memory committed workspace, saved libraries and undo pointer remain unchanged. Restore the controls and canvas to committed values. A worker success is not a commit until this sequence succeeds.

Result transfer and main-thread materialization are part of the responsiveness gate. Prefer transferable `ArrayBuffer` payloads for large point/error arrays with a small exact manifest; validate lengths, offsets and numeric finiteness before creating model objects. Canonical durable serialization remains the document-20 JSON model. Transfer layout is an internal protocol version, not saved geometry. If structured-clone/materialization/JSON preflight creates a >=50 ms main-thread task on the representative workload, the implementation fails review even when worker computation meets its own target.

## 6. Cancellation, navigation and undo

Escape or an explicit Cancel action while pending terminates the active worker, drops the queued candidate, restores committed controls/guide/geometry and creates no history entry. Pointer-cancel does the same for that gesture. It does not undo older committed work.

Undo while pending first performs this cancellation and leaves history unchanged. A subsequent Undo affects the previous committed transaction. After a successful request, the entire initiating gesture—including field inputs, complete result and downstream stale state—is one undo transaction. Undo/Redo never reruns or resumes the canceled request; applying a historical state that already contains complete saved geometry is immediate. If an Undo/Redo source state requires derivation because it was not itself stored complete, that history entry is invalid under this contract and must be rejected by tests.

Switching boards, restoring a revision, importing a workspace or closing the active weave cancels pending work before the action. The new action proceeds only from committed state. Page unload may terminate the worker; because pending state was never persisted, reload opens the last complete workspace. Saved immutable revisions are never changed by cancellation or Undo.

## 7. Save, export and other actions while pending

While pending, disable Save Weave Revision, derived SVG export, carrier/boundary edits that would change the request base, workspace import, revision restore, and any future downstream computation. Their accessible explanation is `Wait for certified geometry or cancel the pending change.` Do not queue these actions invisibly.

Portable JSON backup remains available but is explicitly labeled `DOWNLOAD LAST COMMITTED BACKUP`; it serializes only the committed workspace and excludes the pending candidate. Raw recovery download remains available. View toggles, theme, zoom, pan, rail controls and inspection of already-saved revisions remain usable. Board switching is allowed only by first canceling pending as specified above.

Save/export buttons re-enable only after an eligible complete result has persisted. A failed or canceled candidate cannot be saved through another route. Export always recomputes/checks the stored result identity contract applicable to its version; it never exports the pending guide or last geometry under pending settings.

## 8. Worker failure and unavailable behavior

Treat worker construction failure, module/CSP load failure, crash, message decode failure, timeout, numerical/precision rejection, budget overflow and result-version mismatch as distinct typed errors. None commits partial state.

One unexpected worker crash or load failure may trigger one automatic fresh-worker retry for the exact same request, with the same identity and a new attempt number that is excluded from geometry hashes. A deterministic evaluator failure, precision failure or workload-limit failure is never retried automatically. A second infrastructure failure marks nonlinear computation unavailable for the page session and restores committed state.

There is no synchronous nonlinear fallback: the measured 205.72 ms p95 would violate the purpose of this review and freeze the main thread. When workers are unavailable:

- R1A identity studies and all unaffected foundation capabilities remain usable;
- an already loaded and validated complete v2 revision may be viewed and exported from its committed geometry;
- Add/Edit/Enable of an active nonlinear attractor is blocked with a clear worker-unavailable message;
- disabled, zero-strength and maximum-tension identity changes may use the exact synchronous identity path;
- raw recovery remains downloadable.

Schema-5 startup and import need an asynchronous validation gate for v2 content. Parse and structurally bound raw JSON first, but do not activate or rewrite a v2 workspace until a worker recomputes and validates its complete result under the saved algorithm version. Show `VALIDATING SAVED STUDY` while the last known application shell is read-only. Schema-2/3/4 and v1 studies retain their established synchronous validation path. If the worker is unavailable for an unvalidated v2 load/import, leave canonical bytes untouched, block activation/writes and offer raw recovery; do not trust fingerprints or silently downgrade the study. This is the required consequence of keeping import validation by recomputation without blocking the main thread.

A request exceeding the completion maximum below terminates, restores committed state and reports a timeout. It may be retried manually once. Repeated timeout on the representative supported fixture is a failed performance gate and returns to architecture review, not a reason to save partial output.

## 9. Performance gates

Evidence 21 measured the optimized evaluator alone at p50 181.01 ms, p95 205.72 ms and maximum 206.20 ms for 30 warmed dense/100-edge runs. It produced 30,345 certified segments. Moving that exact computation to a worker removes the main-thread block but adds worker startup, message transfer, result validation/materialization and atomic persistence. Targets must reflect both facts.

### Main-thread responsiveness — required

On the recorded R1A Windows/Intel host in the supported local Chromium browser, for default and dense representative fixtures:

- pointer/input handlers p95 <=8 ms;
- pending guide and label visible by the next animation frame, and p95 <=50 ms from input event;
- no main-thread task >=50 ms attributable to derivation, worker result transfer/materialization, validation or commit;
- display-only controls remain interactive during certification, with animation-frame interval p95 <=34 ms while the pointer is moving;
- cancellation/board switch visibly restores committed state p95 <=50 ms, excluding intentional localStorage failure reporting.

Measure with browser PerformanceObserver/event timing plus explicit marks; Node timings cannot establish this gate. Test result arrival and persistence separately so a fast handler cannot hide a long parse/stringify task.

### Certified completion — required, separate from responsiveness

For 30 warmed runs of each document-20 representative workload, report worker startup, certified evaluator, transfer, main validation/materialization, backup preflight/localStorage commit and total final-request-to-complete timings separately.

- dense spacing-2.5 / 100-edge evaluator inside worker: p95 <=300 ms, maximum <=400 ms;
- dense final request through successful atomic persistence and committed render: p95 <=500 ms, maximum <=750 ms;
- default 500-square/spacing-50 final request through commit: p95 <=200 ms;
- cancellation of an obsolete dense request must not delay dispatch of the newest final request by more than 50 ms;
- near-limit rejection returns a typed complete failure without partial state: p95 <=300 ms.

The 300 ms worker target gives roughly 46% headroom over the measured 205.72 ms p95 for browser-worker/runtime variance without pretending that thread relocation accelerates arithmetic. The 500 ms end-to-end target gives another 200 ms for startup, transfer, validation, full backup preflight, localStorage and render. The 750 ms maximum detects stalls while allowing ordinary run variance. These are proposed supported-host targets, not universal promises for all devices. A visibly responsive pending state is why a half-second certified completion is acceptable; completion is still bounded and measured.

Cold first-worker startup must be reported independently and must complete within 750 ms on the representative host. The first result may use the maximum gate; warmed p95 gates still use 30 subsequent runs. No precomputed result, persistent cache or excluded setup may make a cold correctness case appear warm.

Failure of main-thread responsiveness, worker p95, end-to-end p95, maximum, deterministic equality or atomic persistence returns to architecture review. Do not raise the targets, hide startup, change epsilon, shrink the fixture or truncate output inside implementation.

## 10. Worker verification additions

Retain document 20's numerical, clipping, persistence, migration, negative and five visual tests. Add automated protocol tests for exact message keys/versions, main/worker fingerprint agreement, out-of-order and duplicate results, terminated-worker late messages, board/undo/restore base changes, request-sequence overflow prevention, malformed/oversized transfer buffers and one-retry worker crash behavior.

Use a controllable fake worker to prove coalescing: a burst retains one queued latest candidate; pointer-up cancels an active stale job and dispatches exactly the final state; only that result commits. Prove Escape/Undo pending cancellation creates no history, and successful completion creates exactly one entry. Inject worker success followed by validation, quota, concurrent-tab and backup-size failures; every case preserves canonical bytes, workspace, libraries and history.

Browser tests must hold a dense job pending while toggling overlays, panning and canceling; record event/long-task metrics. Test worker-unavailable first load, one crash/retry, repeated failure, v2 reload validation and backup import validation. Validate that Save/Derived SVG/import/restore are blocked pending, committed backup remains available and stale geometry is visibly labeled. Independently compare worker output byte-for-byte/canonically with the numerical reference fixtures and confirm the same error certificates and analytical clip output regardless of request timing.

The five live acceptance tests remain those in document 20, with one observable addition: during each nonlinear edit, the guide moves immediately, the last committed paths are labeled pending, and final certified geometry replaces them without an intermediate partial shape. Exhaustive cancellation/rejection cases remain automated.

## 11. Comparison with alternatives

| Approach | Benefit | Problem | Disposition |
| --- | --- | --- | --- |
| Latest-request worker | Removes the measured 205.72 ms computation from the UI thread; supports reliable stale-job termination and atomic final commit; preserves one exact evaluator. | Does not reduce completion time; adds protocol, async-load validation, transfer and failure handling. | Recommended because it directly addresses responsiveness while keeping the approved geometry contract. |
| Staged certified computation on main thread | Can split strands/batches across frames and show progress without a worker. | Total work remains; repeated yielding complicates atomic error handling and can still consume frame budget. Partial results cannot be presented as complete. | Reject as primary. The worker may batch internally, but only its final result is authoritative. |
| Coarse/staged geometric preview | Gives immediate moving curves. | A different sampling/error path risks showing geometry the certified result rejects; document 20 requires the same full-quality algorithm and forbids incomplete committed output. | Do not use. Immediate feedback is the authored guide plus clearly stale complete geometry. |
| Cached source/index/certification intermediates | Can reduce repeated nearby edits and avoid rebuilding unchanged boundary/carrier data. | Cold loads, changed boundaries, imports and cache misses still need the full workload; invalidation/version errors could compromise certification. | Optional worker-local optimization after correctness. Cache key includes all source/numeric versions; cache is disposable and cannot be required to pass cold/representative gates. |
| Incrementally deform prior Q/geometry | Appears fast for dragging. | Violates evaluation from P, risks accumulation, invalidates source-parameter/error proofs and makes request order affect output. | Forbidden. |
| Raise synchronous target only | Minimal engineering change. | Leaves a measured ~206 ms main-thread block and degrades interaction; it does not meet the plan's responsive-preview requirement. | Reject. |
| Reduce accuracy/workload | Reduces segments and time. | Directly violates the approved epsilon, representative fixture and user instruction. | Forbidden. |

The worker is therefore the smallest architecture change that separates responsiveness from certified completion without changing mathematical output. Worker-local caches and boundary indexes may improve it, but acceptance is measured on cold correctness plus declared warmed runs, never on a hidden cache dependency.

## 12. Scope and next handoff

If approved, the revised R1B implementation batch is document 20 plus this execution contract: versioned worker protocol; latest-request coalescing/cancellation; pending presentation; asynchronous v2 validation; atomic persistence/history; worker-unavailable recovery; transferable result handling; and the separated gates above. All document-20 controls, fixtures, saves, migration, SVG and five live tests remain in scope.

Remain afterward: R1C/R1D, interactions, crossings, locks/manual geometry, analysis, extraction, synthesis, receiver work and publication. No service worker, cloud backend, worker pool, speculative storage replacement or general job framework is authorized.

This proposal needs approval before it becomes a settled implementation handoff. After approval is recorded and the user explicitly reauthorizes R1B implementation, the batch follows established decisions and can return to Sol Medium. The implementation must stop again for architectural review if any numerical, atomic, main-thread responsiveness or certified-completion gate fails. Publication remains a separate explicit decision.
