# R1B UI repair

Date: 2026-09-16  
Build: `WF-R1B-UI-20260916`  
Status: implemented locally; not published

## Delivered

- Repaired the attractor Enabled transition. The handler captures the requested state and candidate first, cancels any superseded pending worker request, then either commits identity geometry for Disabled or dispatches certified geometry for Enabled. Re-enabling no longer loses the requested state to a pending render.
- Removed visible typed number boxes from the current UI. Square size, all carrier settings and all attractor settings now use sliders with adjacent live value readouts. Hidden model inputs retain the existing internal IDs and data flow without becoming user-facing text boxes.
- Replaced the visible raw vertex-coordinate textarea with a Vertex Editor. One slider selects the vertex and separate X/Y sliders preview and commit its position. Selecting a vertex on the canvas synchronizes the editor. Each released coordinate slider movement is one undo step.
- Assigned a distinct local candidate build identity so this post-acceptance UI repair cannot be mistaken for the earlier accepted base build.

## Preserved

Geometry equations, certification, clipping, worker execution, transactional storage, immutable revisions, portable backup and saved-state schemas are unchanged. Saving remains unchanged.

## Deferred

Multiple influences are not part of this repair. The current phase schedule assigns multiple influences and their combination rule to R1D after R1C. Implementing them now would require a new versioned generation schema, combination semantics, expanded workload/capacity proof, migration, persistence and visual controls. R1C and R1D remain unstarted.

## Verification

- R1B UI checks: 5/5 pass.
- Focused carrier, weave, certified-attractor and bounded-render regressions: 38/38 pass.
- `dist/app.mjs` syntax: pass.
- Static entrypoint, local-reference, private-output and rebuild-target checks: pass.
- Served-preview inspection: build `WF-R1B-UI-20260916`; 16 visible model sliders; zero visible `type=number` inputs; Vertex Editor present; raw coordinate textarea absent from the visible UI.
- Preview: `http://127.0.0.1:43830/?r1b-ui-fix=20260916`.

Development-mode visual checks:

1. Add an attractor, uncheck Enabled, then check it again. The weave becomes straight and then returns to the certified bend.
2. Move Center, Radius, Strength and Tension sliders. Each readout follows the slider and the derived weave commits normally.
3. Move carrier spacing, rotation, offset and density sliders. Readouts and clipped preview update without a typed number box.
4. Open Vertex Editor, choose a vertex, move X and Y, then Undo and Redo. Canvas selection and readouts stay synchronized, and each released move is one history step.

No publication was performed.
