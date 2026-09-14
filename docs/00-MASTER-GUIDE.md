# Weave Generator — Master Guide

**Guide version:** 1.1 · 14 September 2026  
**Stage:** Phase 0 assessed; Phase 1A accepted; Phase 1B straight-SVG boundary import published privately and awaiting user acceptance. Publication/acceptance status is recorded in 02-STATE-DECISIONS-AND-TESTS.md. Stop before Phase 2 carrier architecture.
**Purpose:** One maintained guide for building a cleaner architectural tool, without repeating the history of fragile patches and incomplete handoffs.

## 1. The decision

Rebuild the foundation deliberately. Preserve the existing site and source history as references; retain useful modules when their behavior passes the new tests. Do not assume a complete rewrite or continue accumulating patches on the current interface.

The user's current direction is to build simple, dependable base layers first, then add complexity in dependency order. Each layer should have clear inputs and outputs. Plan for later capabilities without implementing speculative infrastructure. Change internal data structures, algorithms, or backend choices when evidence warrants it; preserve agreed behavior and saved work through explicit versioning and migration.

All expanded spatial goals remain in scope. A small first batch is a construction sequence, not a reduction of the final ambition.

**Authority:** Current user instructions → this reviewed guide and its decision log → verified source/tests → historical reports. Historical reports describe different dates and contain both user decisions and assistant claims. A feature appearing in code or a successful deployment does not establish that its behavior is correct.

**Maintained rebuild records:** [settled contracts and Sol Medium checkpoint](04-SOL-CHECKPOINT.md), [verification](05-VERIFICATION.md), and [current state](02-STATE-DECISIONS-AND-TESTS.md). Current decisions supersede the pending language in the original package: preserve the original; raw legacy backups before any migration; immutable named revisions plus latest pointers; separate owner-private rebuild; browser-local saves with JSON backups (explicit user selection). Later architectural questions do not block source protection.

The complete original guide package, historical reports and supplied book remain outside this checkout at `C:/Users/notbr/Documents/Codex/2026-09-14/confirm-you-have-editable-terminal-access/outputs/Weave-Generator-Guide`. Original reference links below refer to that package. Do not copy it into public output. `reference/` here contains original code only.

## 2. What the tool is for

Weave Generator is an authored, deterministic 2D spatial exploration tool. It turns carrier lines and fields into explicit stitch interactions, reads the spaces and relationships they produce, and develops curated points and polylines for Tangent Generator. Tangent develops forms; Overlap supports interpretation of their relationships and residual spaces.

The architectural intentions include multimodal stitching, calibrated permeability, atrium-fed diffusion, activated interstice, depth-buffered privacy, ambient co-presence, perceptual recomposition, and productive fracture. They motivate what to investigate; they are not claims that the software can automatically judge architecture or infer program.

The complete workflow is:

**Boundary + reference + lattice + two families + fields → carrier field → stitch interaction grammar → event map and derived weave geometry → interstitial/cell analysis → curated point set → relation graph → polyline set → Tangent → Overlap.**

A conceptual feedback loop allows the designer to compare the resulting forms with the original seam, void, bridge, and permeability intentions. Automatic synchronization between tools is not required.

## 3. Essential distinctions

| Term | Meaning for this project |
| --- | --- |
| Carrier field | Boundary, lattice, Family A/B paths, and deformation. The support for weaving, not the finished weave. |
| Two families | Two explicit source systems. Carrier emphasizes continuity; counter-thread can support secondary grain and enclosure. Derived ties do not introduce unlimited source families. |
| Stitch | An operation affecting derived geometry or relationships, with a corresponding visible notation. A symbol alone is insufficient. |
| Weave | Negotiated crossing, binding, release, routing, rhythm, and edge relationships. Two passively overlapping deformed grids are insufficient. |
| Influence | A condition that may change carrier curvature and, later, interaction type, density, phase, and hierarchy. |
| Field link / territory | A relationship or influence region that guides behavior; not automatically a final polyline. |
| Interstice | A measurable cell, pocket, corridor, seam, void, bridge, or threshold candidate produced by the weave. Spatial labels are explainable readings. |
| Point | A curated event or spatial reading with provenance, not a generic sampled location. |
| Relation graph | Candidate connections justified by shared threads, fields, cells, corridors, or explicit constraints. |
| Polyline | A selected, validated trace through meaningful relations; not an arbitrary group of three nearby points. |

Natalie Chanin's *The Geometry of Hand-Sewing* is a structural reference for anchors, stitch operations, repetition, variation, grid manipulation, and edge behavior. The architectural translation is this project's interpretation, not a claim made by the book. See [reference notes](references/06-BOOK-AND-SOURCE-NOTES.md).

## 4. Complete capability scope

| Layer | Capabilities to develop |
| --- | --- |
| Workspace | Tangent-derived shell; stable canvas; Boards; saved boundaries; perfect square; drawn/imported boundary; reference-image underlay; explicit scale/orientation. |
| Carrier | Rectangular, triangular, radial lattice; spacing/angle/offset; two explicit families; visibility, density 1–100, direction, tension, offset, smoothness, seeded irregularity and regeneration. Tension 100 preserves straight source paths. |
| Fields | Attractor, repeller, deflector; later compression, void, alignment. Position, radius, strength, falloff, direction where meaningful, enabled state, live editing and undo/redo. |
| Interaction | Over/under, bind, gap/release, bypass; expanded RUN, CROSS, LOOP, BRIDGE, WRAP, EDGE TIE. Rhythm, interval, repeat, alternation, single/double, reversal, skip, accent, phase, density gradient, edge behavior. |
| Linked influences | Bridge, tension, exclusion, alignment, gradient links; nearest, strongest, blend, override, mask combination rules. Exact semantics and sequence require prototypes. |
| Spatial analysis | Cells, pockets, corridors, seams, voids, bridges, thresholds; measured properties, classifications, source relationships, and an optional construction/reading view. |
| Point curation | Crossing/near-crossing events, binds, gaps, interstice centers, transitions, curvature and boundary events as justified; score/type/field/family/region filters; lasso; pin/exclude/add/delete-manual/invert/select-visible/deselect/isolate. |
| Relations and polylines | Explainable relation scoring, thread-following, seam/corridor tracing, field bridging and other justified modes; seeded variation; keep/delete/lock; diagnostics; valid open/closed output as supported downstream. |
| Saving and outputs | Saved boundaries, Weaves, Point Sets and Polyline Sets; provenance and active-state restoration; portable project backup; separate weave, point, and polyline exports; polylines usable in Tangent. |
| Richer downstream reading | Preserve roles, event references, interstices, and spatial tags in an extensible exchange format. Tangent/Overlap interpretation and a Reading Sheet remain roadmap items, not already working integrations. |

Specific algorithms, defaults, and preset names are proposals until tested. Preserve the scope while revising its implementation. Do not expose controls that have no complete behavior.

## 5. Build in this order

These phases replace the conflicting historical batch labels. Split a phase into smaller releases where necessary; do not jump over its exit criteria.

| Phase | Deliverable | Exit gate |
| --- | --- | --- |
| 0 — Protect and establish | Verify source access, preserve baseline and experiments, identify deployment destination, review contracts and pending decisions. | Source, live baseline, and experiments are distinguishable; no original work is overwritten. |
| 1 — Foundation | One project model; document coordinates; stable viewport; boundary drawing/square/save/restore; theme/display separation; project backup; undoable editing foundation. | Save two boundaries, switch, refresh, restore, undo/redo and resize without geometry drift. |
| 2 — Carrier | Start with rectangular lattice and explicit A/B families, then triangular/radial definitions; family controls and deterministic generation. | Every exposed parameter changes actual geometry and survives save/restore. Clipping and source identity are correct. |
| 3 — Local fields | Attractor/repeller/deflector on the carrier; smooth deformation; correct rotated editing; responsive drag. | Field marker and effect align; tension 100 and zero-strength behavior hold; repeated edits remain stable. |
| 4 — Actual interaction | Full event model, over/under, bind, release, bypass, rhythm/phase and local field response; separate display budget. | Known small fixtures produce correct relationships and geometry; toggles never affect analysis; final results are stable after release/reload. |
| 5 — Interstitial foundation | Detect bounded regions/openings and adjacency; derive a small set of explicit spatial readings. | A controlled bind/release change produces an explainable change in a measured region or relation. |
| 6 — Expanded spatial grammar | Add RUN/CROSS/LOOP/BRIDGE/WRAP/EDGE TIE as distinct operations; linked fields, territories, compression/void/alignment and combination rules. | Each operation has observable model consequences and updates the existing analysis correctly. |
| 7 — Curated points | Event/cell-based extraction, provenance, scores, filters and manual authorship; independent saved Point Sets. | Every automated point has a reason; pins/exclusions and source identity survive regeneration under defined rules. |
| 8 — Relations and polylines | Relation graph, constrained traces, diagnostics, keep/lock and saved Polyline Sets. | No arbitrary triangle grouping; valid traces retain their source points and relationship explanations. |
| 9 — Complete export/handoff | Separate weave/point/polyline exports; Tangent import round trip; metadata package and optional Reading Sheet. | Actual receiving tool preserves intended scale, orientation, closure and point order. |

Define export contracts in Phase 1 and exercise minimal round trips as geometry becomes available. Do not discover coordinate incompatibility only in Phase 9. Interstitial analysis in Phase 5 is deliberately small; expand it with Phase 6 rather than pretending all spatial classifications are solved immediately.

## 6. Rules that protect the foundation

- One authoritative document model. The DOM displays state; it does not store geometry or define saved output.
- Separate source paths, derived paths, events, regions, points, relations, polylines, and display state. Every derived object records its source revision.
- One document coordinate system. View transforms never change model/export coordinates. Import fit is an explicit operation, not hidden rescaling.
- Complete analysis is separate from preview/display simplification. A marker cap must never silently reduce analysis or export content.
- Determinism includes stable identity and versioned algorithms. Do not tie event IDs or stitch phase solely to arbitrary iteration order.
- Visibility and theme changes only affect display. No camera shift, full carrier rebuild, hidden state changes, or duplicate SVG accumulation.
- During drag, keep the carrier responsive; default proposal is to defer expensive final analysis until release and clearly handle stale layers.
- Saved work preserves ancestry. Same-name save behavior needs the versioning decision in the [decision register](02-STATE-DECISIONS-AND-TESTS.md).
- Evolve the code through small, readable modules and explicit migrations. Introduce workers, storage engines, or services only for a demonstrated need.

Detailed contracts and edge cases are in [01 — Implementation Contracts](01-IMPLEMENTATION-CONTRACTS.md).

## 7. Preserve the established experience

Use the real Tangent-derived design language: OCR-B-style uppercase, white/black/#eaeaea, sharp controls, roughly 250px Boards and 350px Controls rails, collapsible rails, closed control sections on opening, drafting-style checkboxes, linked numeric fields and ticked sliders. Retain actual font/assets where available; do not invent a generic replacement UI.

Keep the main workspace stable while panels scroll. Grid/frame, boundary, and source lattice have distinct explicit controls and initially stay off. Selecting a field must not reveal an unrelated hidden layer. Empty canvas deselects; field extents appear only when relevant. Light uses a gray carrier and legible dark commands. Neo appears green (#daff33), never accidentally blue. Modes preserve geometry, line weights, and interaction behavior.

## 8. Release and continuity protocol

For each completed implementation batch: implement → validate → record exact source → publish to the designated live site → confirm deployment succeeded → report. Planning and guide updates alone are not website builds. Do not publish a broken or partial batch simply to satisfy cadence.

Every release response contains:

1. **Batch intended:** the agreed deliverables.
2. **Delivered:** actual behavior, live URL, and verified build identity.
3. **Remaining:** incomplete items in this batch/phase, plus the next dependency.
4. **Test exactly:** actions and expected visible outcomes; distinguish automated checks from user acceptance.

Update the current-state record and decision register after every release. Keep this master guide concise; put detailed troubleshooting in supporting reports. At a handoff, record the exact repository, commit, deployment, dirty files, failed tests, and next action. Never rely on the memory of a previous chat or assume a Linux path exists in a Windows task.

## 9. Exclusions and unresolved choices

Deferred: literal textile physics, unlimited thread families, a generic motif sampler, automatic architectural judgment, AI floor-plan recognition as a dependency, automatic building/3D generation, and live bidirectional synchronization. A visual reference underlay is retained. Spatial intent does not require prematurely turning the tool into a 3D simulator.

Pending decisions do not block reviewing this guide: migration of old browser-saved boards; same-name save semantics; Tangent's exact accepted payload; working units/scale; geometric definitions of advanced stitch operations; first supported interstitial readings; measurable performance budgets; and rebuild deployment destination. Recommendations and decision timing are recorded separately rather than silently treated as user approval.

**Next:** Complete the Phase 1B live acceptance in [06 — Phase 1B verification](06-PHASE-1B-VERIFICATION.md), then return to higher architectural reasoning before defining a bounded Phase 2 carrier batch. Do not begin carrier implementation automatically.
