# Stability Foundation Phase 3 — compact background autosave

Date: 2026-09-21  
Build: `WF-STABILITY-P3-COMPACT-AUTOSAVE-20260921`  
Status: complete and ready for review; Phase 4 has not started.

## Result

Accepted family, influence, appearance, interlacing, and Undo/Redo edits now update the in-memory workspace and visible result before persistence. A compact autosave coordinator waits 180 ms, replaces queued candidates with the newest accepted candidate, and serializes a newer candidate behind an in-flight backup. Storage success and failure are reported separately from edit acceptance. A backup failure leaves the accepted working document visible.

Explicit project, boundary, library, and import operations remain synchronous because their workflow depends on a durable result before navigation or completion. They first settle the autosave coordinator so an older queued backup cannot overwrite them.

## Storage and recovery bounds

- Named weave saving continues to replace the current compact snapshot rather than exposing autosave ancestry as library objects.
- Portable-capacity admission runs on the final compact candidate, after freshness validation and revision compaction.
- Undo remains an independent in-memory history bounded by its existing 100-entry limit.
- Transactional recovery retains the current root, previous root, and the newest eight recovery roots. Unreferenced snapshots, records, and payloads are removed in the same strict transaction.
- Existing schema-6 data, portable backups, canonical source decisions, certified geometry, family identity, and Phase 0 fixtures remain compatible.

## Worker ownership

Worker requests now include a monotonic accepted-document version. A background storage-root change cannot invalidate a worker based on the current accepted document, while a newer accepted edit still rejects an older completion. Worker completion accepts and renders the validated result before scheduling backup. Autosave state transitions are available in the existing development telemetry.

## Verification

- Phase 3 affected suite: 93/93 passing.
- Frozen Phase 0 baseline: 8/8 passing.
- Syntax checks: `dist/app.mjs`, `dist/storage.mjs`, and `dist/compact-autosave.mjs` pass.
- Static entrypoint/reference check and `git diff --check` pass.
- Phase 0 evidence is unchanged from commit `dbfc7c2`.
- A supplemental historical bundle passes 29/39. Its ten failures are the already-known stale UI labels, schema-5 count, and superseded SVG expectations; the complete output is retained and is not represented as a full legacy-suite pass.

## Managed browser review

The existing `STABILITY PHASE 2 REVIEW` fixture was used and restored:

1. Family A spacing was edited rapidly through 25, 26, and 27. The visible source reached 27 while storage advanced once after debounce.
2. Undo restored the prior accepted value and was backed up separately.
3. The original spacing 24 was restored and survived reload.
4. Influence 1, Family A strength changed from 71 to 72. The accepted worker result appeared before backup, autosave advanced generation 353 to 354, and telemetry recorded `accepted`, `autosave-saving`, then `autosave-saved`.
5. Strength 71 was restored, backed up at generation 355, and survived reload.
6. The final reload contains one derived weave group, 52 overlap masks, zero raw top-level fallback paths, no blocked storage, and no pending or failed autosave.
7. All five pre-existing projects remained present. No new review project or library object was created.

An early browser pass exposed an unbound injected timer callback in the coordinator. The timer is now wrapped at construction, and the final automated and browser runs were completed after the correction. The interrupted early test output is retained as development evidence.

## Remaining work

Phase 4 will add explicit dependency invalidation and incremental recalculation. It has not started. Phase 5 workflow/library simplification and Phase 6 stabilization verification also remain.

