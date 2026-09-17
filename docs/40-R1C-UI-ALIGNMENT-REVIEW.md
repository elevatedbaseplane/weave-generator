# R1C UI alignment review

Date: 2026-09-16  
Build: `WF-R1C-UI-ALIGN-20260916`  
Phase/batch: R1C — control-panel alignment and complete one-influence vertical slice  
Status: implementation and focused automated checks passed; visual acceptance pending

## Reference boundary

The preserved original at `work/weave-generator` was inspected as the product, panel, and workflow reference. The rebuild adopts its clear three-column workspace, vertical accordion, direct manipulation, visible field extent, grouped controls, live feedback, layer visibility, theme modes, and saved-object hierarchy. No original mutable project state, localStorage persistence, sampled geometry/crossings, or prototype polyline implementation was copied.

## Visible change

- The existing stable three-column shell now has an ordered right rail: Project / Study, Boundary, Carrier, Weave Study, Field Forces, Display, and Exchange + Backup.
- Field Forces is a first-class section that appears and opens after creating a Weave Study. It contains the real Attractor, Repeller, and Deflector controls, fixed certified falloff label, Source/Derived comparison, guide visibility, state, reset, removal, and usage instructions.
- Boundary's vertex sliders are grouped inside Boundary. Backup actions moved from the saved-object tree to Exchange + Backup.
- Project / Study reports revision counts and shows the workflow. Deferred stages are static Upcoming labels and cannot be mistaken for controls.
- The canvas shows live Source, Derived, and Guide counts/state. Light, Dark, and Neo remain view-only and are available both on the canvas and in Display.
- Opening control sections does not change the center canvas column. Panel collapse remains available from the header.

R1C behavior remains the certified `weave-study-v3` implementation recorded in documents 37 and 39. R1D multiple influences and seeded variation remain deferred. R2 has not started.

## Verification

- Focused R1C behavior, worker, codec, persistence, rendering, and UI checks: 20/20 passed.
- Module syntax and served-build identity checks passed.
- A focused Playwright smoke scenario was added for rail order, stable canvas, themes, all three influence types, direct drag, Enabled state, Undo/Redo, save, and reload. The managed session's Chrome launch was blocked by `spawn EPERM` before navigation; this is an environment launch block, not an application failure. The scenario remains available as `scripts/r1c-browser-smoke.cjs` for a normal host if needed.
- Exhaustive storage, migration, capacity, recovery, and performance certification was not repeated.

## Preview and next gate

Preview: `http://127.0.0.1:43830/?r1c-ui-align=20260916`

R1C awaits visual acceptance. After acceptance, the next scheduled action is the R1D architecture gate for multiple influences, composition/order, selection, guide visibility, deterministic seeds, and bounded combined workloads.
