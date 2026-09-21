# SP1 foundation development preview — 2026-09-17

Build: WF-SP1-FOUNDATIONS-20260917. Status: partial implementation, not accepted or published. R1 remains development-complete by the user's decision; its remaining full host certification is deferred debt, required once before publication. No external host command is requested.

## Implemented in this local version

Two finite foundation sources (Double Herringbone alternating foundation and Herringbone Square foundation), stable cell/run identities and finite [0,1] parameters; recipe sliders and reset; existing field tools routed through role-specific generation; compact v3 geometry and schema-6/v2-root/format-3 persistence paths; automatic pattern/field saving; role-aware SVG rendering. The existing three-column layout and collapsible controls remain.

The new adapter uses the existing deformation and clipping kernel. This is not a claim that every new numerical/storage exit requirement has been certified. Legacy geometry tests remain passing; prior failure evidence is unchanged.

## Verification actually completed

37/37 focused tests passed: tests/stitch.test.mjs, tests/r1d.test.mjs, tests/pattern-tree.test.mjs and tests/storage-codec.test.mjs. See evidence/sp1/focused-tests-20260917.txt. Includes source coordinates, finite support intervals, stable identities, bounds rejection, exact new-codec round trips, sync/async parity and related legacy/incremental storage behavior.

Managed browser, isolated origin http://127.0.0.1:43831/?sp1=20260917: created boundary, selected Double Herringbone, created immediately visible pattern, added an attractor, and observed an atomic saved commit with schema 6, v2 storage root and previous recovery root. Full read-only snapshot preserved in evidence/sp1/default-browser-20260917.json. The existing 43830 origin was not cleared or migrated for this test.

## Stop evidence

The first default add-influence interaction recorded total 416.59999999403954 ms versus retained default target 200 ms. Worker 164.69999998807907 ms and render 12.800000011920927 ms were within their limits. Derive 82.69999998807907 ms; encode 73.90000000596046 ms; validation 1 ms; admission 3.900000005960465 ms; transaction 18.599999994039536 ms; history 0.09999999403953552 ms. Dispatch telemetry was 197.5 ms. These labels are recorded measurements, not an established causal profile or additive decomposition. This single cold interaction is not a p95 measurement or an R1 regression certification.

Implementation stopped under document60's retained performance stop condition. No timeout, workload, geometry, certificate or target was relaxed. Next bounded work is to determine preparation/dispatch/encoding cost and repair it with exact-equivalence verification, before resuming SP1 exit checks. No PowerShell run is needed for that analysis.

## Remaining before SP1 completion

- Resolve the observed default-interaction target miss internally.
- Finish new finite-source certification review: outward candidate bounds, support/endpoint bounds, concave clipping and completeness negatives; explicit construction/crossing-intent metadata.
- Finish mixed legacy/new migration, immutable revision/reload/Undo, backup admission/capacity and failure-recovery checks justified by the new storage discriminator. The focused legacy tests are not substitutes for these new-format checks.
- Verify Square, parameter edits after fields, selection/reload and backup through the local UI; check pending behavior and relevant worker timing.
- Finish role-specific wording/footer and ensure source-control refresh stays synchronized after commits.

Do not claim complete schema migration/capacity certification or full SP1 acceptance. Use this isolated origin for disposable visual test patterns while those checks remain outstanding.

## Five concise visual review scenarios

1. Select the saved Boundary in the left tree. In Weave Pattern, choose Double Herringbone — alternating foundation in Preset and click Create Weave Pattern. Expect repeated diagonal bands immediately.
2. Adjust Pitch, Height and Overlap in Weave Pattern. Expect the foundation to resize/change overlap, with equal line styling.
3. Open Field Forces, click Add Influence, then drag its center. Expect distortion and a saved completion; change a preset dimension afterward and check the influence remains attached.
4. Create Herringbone Square — foundation; adjust Width, Height and Gap X/Y. Expect extended square motifs with gaps and no backside connectors. Use Undo/Redo and compare source/derived using Display.
5. Switch between saved patterns and reload. Expect each pattern's dimensions and influences to return. Backup/restore acceptance remains pending automated new-format recovery checks; do not use valuable existing projects for this preview.

These are review scenarios, not assertions that all five have passed. Only the Double Herringbone create/add/save sequence has been observed in the managed browser so far.

## Next scheduled work

Finish this SP1 batch, return a reviewed local preview, then follow the recorded R2A crossing-event/diagnostic batch. Over/under notation follows in R2B; curved lacing and other stitches remain later. No SP2, R2 implementation or publication began.
