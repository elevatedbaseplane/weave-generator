# Stability Foundation Phase 6 — stabilization verification

Date: 2026-09-21

Build: `WF-STABILITY-P6-VERIFICATION-20260921`

## Status

Phase 6 implementation and internal verification are complete. The review build preserves the Phase 0 fixtures and all established product limits and behavior. It contains no Build 1B feature work. Publication supplies the acceptance surface; the Stability Foundation completion declaration remains pending the user's review of the five protected workflows.

## Product changes

The visible build identity and footer identify the Phase 6 review build. The final reload route exposed one restoration mismatch: persisted per-family response values survived, but the scope checkbox returned to its HTML default. The control now reconstructs linked scope from the persisted family responses, so an independent Family B value restores with “apply to all families” off. Geometry, storage, recovery and rendering contracts are unchanged. One historical dense-browser test harness was also updated to provide the event target and edit adapter that the current production pointer-up handler already requires.

## Automated verification

The governing current-contract matrix passes **240/240**. It covers:

- deterministic geometry and exact canonical regeneration;
- preview/release equivalence and exact final-value commits;
- independent family geometry, appearance, influences and stable identities;
- influence type, position, per-family response, persistence and worker protocols;
- crossing detection, rule precedence, local override persistence and woven occlusion;
- schema migration, compact codecs, bounded autosave and capacity admission;
- interrupted-save recovery and accepted-state preservation after backup failure;
- stale worker rejection, latest-request-wins behavior and warm-worker recovery;
- reusable weave adaptation, library separation, reload and source lineage.

All **8/8** preserved Phase 0 diagnostic and frozen-fixture checks pass. The initial unfiltered historical suite recorded 270 passes and 13 stale failures. The governing matrix excludes four audited historical files: the intentional Phase 0 production-byte lock, an obsolete R1B UI string/source harness, a stitch-control VM missing a modern typed-slider adapter, and legacy weave expectations for schema 5 and pre-outline SVG. No valid product assertion was weakened.

Evidence:

- `docs/evidence/stability-phase6/governing-matrix.txt`
- `docs/evidence/stability-phase6/frozen-phase0-fixtures.txt`
- `docs/evidence/stability-phase6/full-suite-initial.txt`
- `docs/evidence/stability-phase6/browser-workflows.json`

## Five protected workflows

The managed local preview completed the full route in a dedicated `PHASE 6 REVIEW` project:

1. Created a 500-unit square Boundary 01 and applied the Triangular grid preset as a saved three-family weave.
2. Changed Family A to spacing 64 and rotation 12°, with thread width 5 and visual hierarchy 6. Families B and C remained independent.
3. Added three influences, changed type, radius, strength and tension, gave Influence 3 an independent Family B strength of 35, then moved an influence center directly on the canvas. The final move saved in 24.2 ms worker time. Reload restored Family B at 35 with “apply to all families” off.
4. Applied whole-weave alternate 1-over/1-under, selected an eligible crossing and swapped its upper thread. The weave retained one active local override with 181 assigned and zero unresolved crossings.
5. Visited additional saved boundaries, returned to Boundary 01, reopened its weave and reloaded. The restored state retained 31 source paths, 31 derived paths, all three influences, the exact family values, the rule and one local override.

After reload, compact storage reported `storageBlocked: false`, 82,075 active-project backup bytes and 10,403,685 bytes remaining under the unchanged 10 MiB limit.

The expanded whole-workspace read-only diagnostic exceeded the browser automation transport timeout on the eight-project fixture. The compact storage diagnostic completed, the UI showed the exact accepted settings before and after reload, and the canonical regeneration suite independently verified every frozen revision. This is diagnostic transport debt, not an application failure.

## Review

Review the published build by checking that the canvas remains woven while zooming, Family A still shows 64 / 12 / 5 / 6, Field Forces lists three influences, and Individual Crossings reports one local override after reload. Phase 6 stops here for acceptance. Build 1B has not started.
