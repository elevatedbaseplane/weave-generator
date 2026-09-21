# Stability Foundation Phase 4 — incremental performance

Date: 2026-09-21  
Build: `WF-STABILITY-P4-INCREMENTAL-20260921`  
Status: complete and published for review; Phase 5 has not started.

## Result

Every certified edit now carries an explicit `dependency-plan-v1` record. The plan identifies affected families and the dependent geometry, crossing, and presentation stages. It invalidates only one family when that family's response changes without changing the shared expansion margin, and conservatively invalidates all families when boundary, source, or shared numerical bounds change.

The persistent combined-influence worker retains worker-private per-family work. A later single-family edit rebuilds that family, reuses the unaffected certified families, reconstructs the complete ordered result, and produces the same canonical geometry and compact payload as a full derivation. Worker-private work metadata is excluded from the public result, storage schema, portable backup, hashes, and WebMCP output.

Rapid input replaces obsolete work immediately. An active obsolete worker is terminated, its handlers are detached, and only the newest pending candidate may commit. Returning to the current canonical source cancels obsolete work and reuses the current certified result without dispatch. The existing stale-result, accepted-version, storage-root, and payload validation gates remain in force.

Thread appearance stays on the presentation path. Exact crossing geometry is reused while woven markup is regenerated. Crossing telemetry now separates intersection work from markup work and records reuse. Autosave telemetry records complete settlement from input acceptance through durable backup.

## Formal limits

No limit was weakened. Geometry completion remains capped at 750 ms, crossing worker work at 400 ms, and crossing render at 50 ms. The existing workload, precision, certificate, storage, migration, and recovery limits are unchanged.

## Verification

- Phase 4 focused suite: 127/127 passing.
- Frozen Phase 0 baseline: 8/8 passing.
- Incremental full-result equivalence is byte-for-byte exact.
- Persistent-worker integration proves a Family B edit reuses Family A and returns the exact full result.
- All `dist/*.mjs` syntax checks pass.
- Static entrypoint/reference check and `git diff --check` pass.
- The broad legacy run still contains the previously recorded stale UI/schema/export assertions; no formal gate was weakened to satisfy them.

Evidence is retained in `docs/evidence/stability-phase4/`.

## Managed browser review

The existing `STABILITY PHASE 2 REVIEW` fixture was used and restored:

1. Three rapid family edits cancelled two obsolete worker jobs and committed only the newest value.
2. A Family C-only edit reported `families: ["C"]`; successive accepted edits reused Families A and B and settled in 98.4 ms and 81.2 ms, with worker work of 31.1 ms and 29.4 ms.
3. Returning to the current canonical source reused the current result without worker dispatch in 1.5 ms and 1.3 ms.
4. Thread width changed and returned to 2. Appearance applied in 9.1 ms and 8.4 ms. Crossing geometry was reused and the woven result completed in 82.4 ms and 72.4 ms.
5. At 1358.5% zoom the derived layer retained 49 overlap masks, zero pending woven groups, and zero raw top-level fallback paths.
6. Reload restored all five projects, Family A spacing 27, influence strengths A/B/C 99/71/65, Family A thread width 2, the exact certified geometry fingerprint, and an idle nonfailed autosave state.

An initial browser load caught worker bookkeeping inside persisted diagnostics. Exact validation rejected that candidate before it could be accepted as compatible. The bookkeeping is now non-enumerable worker-private state. Codec, migration, source-regeneration, and final browser reload checks passed after the correction.

## Next

Phase 5 is workflow and library simplification. It has not started.
