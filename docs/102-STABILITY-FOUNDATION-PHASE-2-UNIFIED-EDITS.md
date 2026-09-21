# Stability Foundation Phase 2 — unified editing and recalculation

Date: 2026-09-21

Phase 1 and its document-101 corrections were accepted by the user. Phase 2 is implemented and locally verified; ready for user review. Phase 3 has not started. Publication status is recorded separately in the delivery evidence; a local pass is not a deployment.

## Visible changes

Family and stitch sliders, typed entries, influence controls and canvas influence movements retain their exact prepared preview source on release. Family controls change only their selected parameter. Influence controls change only the selected shape or response property, preserving other fields and independent families even when a render refreshes controls during a gesture. Width, edge weight and hierarchy preview their captured appearance and save that same appearance. No new user steps or features were added.

The hierarchy 6-to-3 correction and continuous woven-presentation retention from document 101 remain intact. Existing projects, geometry algorithms, numerical limits, storage schema, family IDs, crossing precedence and input-bound override behavior remain unchanged.

## Internal changes

`weave-edit.mjs` provides canonical validation and a bounded, single-gesture candidate owner. A release with the same captured value reuses the prepared project, including its exact carrier revision and source ancestry. A different final value is prepared from the original gesture base. Invalid preparation does not replace the last valid candidate; cancellation discards the gesture.

The application's `updateWorking` is the shared validated gateway for family/stitch edits, influence controls and direct moves, preset application, boundary changes, appearance and crossing commits. Certified studies use the existing worker pipeline for both preview and commit, including identity settings. Legacy identity/carrier-only documents retain their version-compatible deterministic synchronous calculation. Appearance/crossing-only changes retain their geometry-free save path.

The canonical source feeds calculation; preview geometry is never an alternate input. Preview ancestry accompanies the transient project. Worker identity and latest-request rejection remain intact, with an additional rejection after asynchronous head validation and before an obsolete request can begin storage preparation. Calculation failure retains the committed drawing. Existing transactional persistence behavior is retained; immediate in-memory acceptance/background persistence is Phase 3 work.

## Verification

- 66 focused automated tests pass: exact captured preview/release source and ancestry, changed final values, rejected candidates, unchanged independent families/influences/crossing settings, exact native portable roundtrip and regeneration, actual UI adapter/gateway branches, stale worker results, supersession during head validation, calculation failure, appearance, crossing execution, duplicate content-addressed storage reuse, multi-tab guards, and woven overlap retention through viewport redraws.
- Eight frozen Phase 0 checks pass. The entire Phase 0 evidence directory is unchanged from the final diagnostic-cleanup commit `dbfc7c2`. Its historical production-byte identity assertion remains correctly scoped to Phase 0, not later app builds.
- Changed-module syntax, static entrypoint/reference/private-output checks and diff whitespace checks pass. No full legacy-suite, dense sustained performance or deferred R1 host certification is claimed.
- The old influence-gesture source-regex test was replaced by behavioral tests executing the new gesture owner and actual adapter. The cancellation harness now supplies and verifies the new gesture-clear dependency. Early test-only failures (obsolete regex/missing mock and attempting to save an existing fixture study under a different name) were corrected without changing product validators or expected geometry.

Managed local UI review used a new **STABILITY PHASE 2 REVIEW** project. All four existing projects remained exactly equal to their pre-test readback. Tested square boundary and direct Square Grid preset; A strength 71 with B unchanged at 50; A spacing 50→64 then rapid range steps finishing at 65; rotation 12; width 5; hierarchy 1→6→3; second influence changed to repeller, radius 180 and A tension 15; 2-over/1-under rule and a manual crossing swap; center movement; Undo; reload; boundary departure and saved-weave return; Herringbone Square on a second boundary with width 80→84. Woven presentation remained available after settlement.

The browser drag adapter reported an error after partially moving the handle. Application readback independently confirmed the resulting center (5.386011, 3.375125), a successful certified commit, and a complete woven presentation. Undo restored the exact prior working document. This is evidence for the actual accepted move, not a claim that the requested full screen-distance drag completed.

Reload reproduced the exact working document. Returning through the library reproduced the exact named saved weave. Existing Undo semantics retain saved library revisions: undoing the working document does not roll back the named library snapshot. The initial return comparison against the undone working state therefore differed only by the saved center and its derived geometry; comparison against the last saved named weave was exact. This existing behavior is preserved, not silently redefined by Phase 2. Geometry changes retain manual override records but make them inactive until their original geometry returns, as before.

Observed ordinary worker commits during this review ranged approximately 88–233 ms total, with sampled worker times below 49 ms. These are development samples, not sustained percentile certification or proof of the Phase 4 target.

## Exact user visual checks

Open the local preview and select **STABILITY PHASE 2 REVIEW → Boundary 01 → Weave Pattern 01**.

1. Change family A spacing with its slider, then type a value. Release, reload and confirm the final value remains. Family B and both influences should retain their own settings.
2. Change A's strength and tension; drag an influence center and radius. The last complete woven view should remain visible while calculation finishes.
3. Change A hierarchy to 6 and back to 3; adjust width. Confirm B is unchanged when linking is off.
4. Set a weaving rhythm, select an eligible crossing and swap it. Reload and confirm the saved rule/override. Geometry-changing edits intentionally deactivate input-bound overrides.
5. Leave for Boundary 02, edit Herringbone Square width, then return and select Weave Pattern 01. Confirm its saved settings return.

## Remaining work and next phase

Phase 2 implementation and focused local verification are complete. User visual review and publication remain delivery steps. Phase 3 is compact background autosave: immediate memory acceptance, debounced compact persistence, bounded snapshots/recovery/Undo and separate backup-failure reporting. Do not begin Phase 3 before review. No Build 1B feature work has started.
