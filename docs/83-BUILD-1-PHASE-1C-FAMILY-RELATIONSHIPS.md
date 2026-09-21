# Build 1 Phase 1C — exact family relationships

## Version and scope

Build `WF-B1-P1C-FAMILY-RELATIONSHIPS-20260918` locally completes Build 1 Phase 1C. The user explicitly deferred Phase 1B visual acceptance so feature development could continue; Phase 1B remains internally verified and can be reviewed together with Phase 1C. Phase 1D seeded structured variation and Phase 1E precedence/checkpoint have not begun. Nothing was published.

## Product behavior

The Over / Under target selector now contains the whole-pattern default, each family, and every exact family pair. Selecting a pair exposes Alternating 1/1, Two Over/One Under, or Grouped N/M from the perspective shown by the label, for example `Family B over Warp`. The exact pair saves automatically, recomputes the woven presentation without changing geometry, and can be removed with **Use Inherited Rule for This Pair**. A visible precedence line states that a manual crossing override wins over the exact family relationship, which wins over the whole-pattern default.

The existing family target remains a convenience operation that writes the same bounded pair records for every relationship involving that family. The pair editor changes one of those records without touching other pairs. Up to eight families require at most 28 pair records, within the existing 36-record limit. No schema, geometry, identity, compact payload, migration, worker, storage, backup, or clipping contract changed.

## Verification

Forty-nine focused tests pass. New checks prove exact pair isolation, selected-family perspective conversion, removal without collateral changes, pair precedence over the whole-pattern default, immutable input handling, portable JSON roundtrip, and zero new geometry payloads. Existing crossing execution, continuous occlusion, thread appearance, family architecture, pattern tree, influence response, and storage tests remain passing. Syntax and static entrypoint/reference/private-output checks pass.

Managed-browser verification changed the saved `Family B ↔ Warp` relationship from Grouped 2/2 phase 2 to Two Over/One Under. All 81 crossings remained assigned, the crossing worker completed in 5.6 ms, and the rule survived a full page reload. Undo and Redo restored phase 0 and phase 2 respectively. The review fixture was returned to Grouped 2/2 phase 2 with 81 assigned, 0 unresolved, and 0 local overrides.

## Status

Phase 1C implementation is locally complete and awaits user visual acceptance. Phase 1D is the next bounded batch: deterministic seeded structured variation with balance and maximum-run controls. Build 1 remains incomplete.

Local preview: `http://127.0.0.1:43831/?b1-p1c-family-pairs=20260918`
