# Build 1 Phase 1C — Project Library

Build: `WF-B1-P1C-PROJECT-LIBRARY-20260918`.

## Visible model

The left rail now presents three flat contextual lists: Projects, Boundaries in the selected Project, and Weaves in the selected Boundary. The selected row uses the application accent, each Boundary and Weave has a compact thumbnail, and the canvas header shows `PROJECT / BOUNDARY / WEAVE` context.

Revision history and the former Influenced Grid level are internal. A visible Weave includes its line families, thread appearance, crossing rules, and latest saved field-force result. Rename, Duplicate, and Delete operate on the selected Boundary or Weave. New Boundary saves a square immediately. New Weave opens the preset/saved-weave picker.

Selecting a Boundary opens it without carrying another Boundary's working geometry. Selecting a Weave restores its latest field-force result. Selecting a preset still creates and displays the Weave immediately.

## Reusable weaves

Selecting a Weave retains it as the reusable source. After opening another Boundary, `Apply Selected Weave to This Boundary` creates an independent Weave there. Its recipe, family identities and metadata, thread appearance, crossing rules, deterministic variation, and field forces are copied. Influence centers are normalized from the source Boundary into the destination Boundary and extents scale with the destination. Derived geometry is recalculated and saved against the destination Boundary; source-derived paths are never reused.

The persisted schema and immutable revision records remain compatible. `project-library.mjs` is the domain adapter that exposes logical Weaves while the existing carrier and certified-result records remain independently validated internally.

## Verification

18 focused tests pass for the Project Library adapter, reusable field adaptation, immutable nested saves and duplication, post-influence pattern editing, preview cancellation, direct workflow controls, and static entrypoint checks. Module syntax checks pass.

Managed-browser verification created a Boundary, selected Square Grid, added and automatically saved an Attractor, opened a different Boundary, applied the selected Weave, and confirmed one destination Weave with two families and one retained field force. The worker completed the reuse calculation and the result survived reload.

The exhaustive suite was sampled once and still contains unrelated historical/outdated assertions already present across old R1 UI labels, schema-5 expectations, and SVG presentation. They were not weakened or reopened in this correction.

## Status

Build 1 remains in Phase 1C correction for user review. Phase 1D structured seeded crossing variation and Phase 1E checkpoint remain. Build 1 is incomplete. No publication occurred.

Preview: `http://127.0.0.1:43831/?project-library=20260918`
