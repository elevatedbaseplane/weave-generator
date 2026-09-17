# R1C reference UI correction

Date: 2026-09-16  
Build: `WF-R1C-REFERENCE-20260916`  
Status: focused checks passed; visual acceptance pending

## Defect

The first aligned shell reproduced the reference workflow order but remained visually too close to the earlier rebuild foundation. The user correctly rejected it as not looking like the original Weave Generator reference.

## Correction

The preserved original source in `work/weave-generator` was re-inspected for its rendered hierarchy and final drafting-terminal CSS. The rebuild now adapts these concrete visual patterns:

- `B.A.C: WEAVE GENERATOR..... V01` header hierarchy, build/lineage label, and header-level Boards, New Board, and Controls actions.
- Numbered Weave Field workflow strip above the canvas, with future Point Extraction and Polyline Composer stages visibly marked Upcoming and noninteractive.
- Boundary Context badge, bottom canvas legend, display modes, pointer coordinates, zoom readout, and drafting-grid dots.
- Boxed numeric readouts paired with ticked sliders while preserving the user's slider-only editing requirement.
- Stronger right-rail headings, full-width actions, compact saved-object lineage, and reference-like typography and spacing.
- A fresh view-preference key so existing project geometry remains intact while this visual version starts in Light mode with boundary, grid, source lattice, and carrier families visible.

Only view state and shell presentation changed. Certified field equations, interval reconstruction, clipping, worker protocol, IndexedDB storage, compact encoding, immutable revisions, backup/recovery, atomic commits, and stale-result rejection are unchanged.

## Verification

- Focused UI, R1C behavior, worker, persistence, and bounded-render checks: 21/21 passed.
- Module syntax, unique IDs, diff whitespace, served build identity, and reference controls passed.
- The existing browser smoke launch block remains environment-only; it was not rerun because this correction is an isolated shell/view change and the local preview is available for visual acceptance.

Preview: `http://127.0.0.1:43830/?r1c-reference=20260916`

R1C remains the active batch until visual acceptance. R1D and R2 remain unstarted. No publication occurred.
