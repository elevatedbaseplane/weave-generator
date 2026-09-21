# Build 1 Phase 1C correction — live control feedback

## Version and scope

Build `WF-B1-P1C-LIVE-CONTROL-FEEDBACK-20260918` fixes the blocking Phase 1C interaction report that Weave Pattern and Field Forces controls appeared not to update the visible weave. This is a control-flow and feedback correction only. Phase 1D has not begun and nothing was published.

## Cause and correction

Certified influence edits intentionally keep the last complete geometry visible until a worker result commits atomically. The prior interface did not make that wait clear. In addition, an enabled Original Grid or construction layer could remain over the derived result, making a real change difficult to see.

Weave Pattern and Field Forces now show explicit `PREVIEW`, `CALCULATING`, `APPLIED + SAVED`, and `NOT APPLIED` states in their section and at the lower-right canvas readout. Editing an influenced weave or field automatically selects the Distorted Only layer preset and keeps the influence guide visible for field edits. A pattern without an influenced result instead keeps its editable original grid visible. The saved project count refreshes after targeted certified commits.

The control rail now presents the primary edit sequence first. Weave Pattern starts with family selection, then spacing, rotation, offset, and density. Family naming, order, isolation, and future-export metadata are collapsed below the geometry controls. Field Forces is divided into influence shape (radius, falloff, direction) and family response (family selection, strength, tension). Existing paired sliders and typed number inputs remain the single save path.

Family changes on a pattern with influences preserve the current influences, recalculate certified geometry, update crossing presentation, and save the linked pattern and influenced grid together. Direct influence movement, type, radius, falloff, direction, strength, tension, reset, duplicate, and enabled state use the same visible feedback path. Atomic display, latest-request rejection, immutable revisions, IndexedDB storage, exact geometry, certificates, and performance thresholds are unchanged.

## Verification

Fifty-one focused automated checks pass across display presets, influence controls, certified combined fields, stitch controls, field adaptation, numeric entry, direct crossing editing, thread appearance, named crossing rules, family and exact-pair rules, persistence, backup, and SVG behavior. `dist/app.mjs` passes syntax validation.

Managed-browser verification on a saved influenced grid changed attractor strength from 80 to 75. The certified derived SVG path changed, the control retained 75, source layers were hidden, the influence guide became visible, and both section and canvas states reported `APPLIED + SAVED · STRENGTH 75`. A subsequent Family A spacing change from 507 to 509 changed the derived SVG path, retained the influence, committed in 178.2 ms total, and reported `APPLIED + SAVED · FAMILY A SPACING 509`. The preview was returned to the primary `WEAVE STUDIES` board and reloaded successfully with 36 rendered derived paths and no error state.

## Status

Phase 1C remains locally complete and awaits visual acceptance of this correction. Phase 1D seeded structured variation is next. Build 1 remains incomplete.

Local preview: `http://127.0.0.1:43831/?b1-p1c-live-feedback=20260918`
