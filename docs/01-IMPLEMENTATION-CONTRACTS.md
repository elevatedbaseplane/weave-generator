# Implementation contracts and feature dictionary

Companion to the master guide. This is a proposed engineering design grounded in the user's requirements and the observed failures. It is not a fixed framework mandate or a claim that the existing source already meets it.

**2026-09-14 foundation settlement:** The implemented Phase 1A contracts and explicit local-storage decision are in [04-SOL-CHECKPOINT.md](04-SOL-CHECKPOINT.md). These supersede proposal/confirmation language below for the implemented foundation. Remaining layers stay in dependency order. Saved revision libraries are append-only; working-document edits are undoable. Current user instruction authorizes the first working foundation and its records, not advanced carrier work.

## A. Simple information paths

Use this one-way dependency chain:

`Document inputs → carrier geometry → interaction events and derived geometry → region analysis → point candidates → curated selection → relation graph → polylines → export adapters`

Rendering consumes the relevant objects. UI actions update document inputs or selection/display state through explicit operations. Persistence saves the document and versioned snapshots. Export adapters consume geometry and metadata directly. No stage should reconstruct its authoritative data from circles or paths currently visible in the browser.

Separate four kinds of state:

| State | Examples | Rule |
| --- | --- | --- |
| Authored document | Boundary, lattice, families, fields, seed, rules, manual edits | Durable source of truth; validated and undoable. |
| Derived model | Curves, crossings, stitch results, cells, scores, relations | Reproducible from a source revision and algorithm version; cached when useful. |
| Saved output | Weave revision, Point Set, Polyline Set | Stable snapshot with ancestry; downstream outputs do not silently mutate. |
| View/session | Zoom, pan, visibility, theme, expanded panels, active selection | Explicit persistence policy; does not alter geometric calculations. |

Prefer small modules for geometry, document validation, operations/history, derivation, rendering, UI binding, storage/migration, and export. File names and stack may change. Preserve a working dependency arrangement instead of selecting technology for its own sake.

## B. Coordinates, boundary and carrier

Use document coordinates with an explicit unit declaration and axis convention. Y-up is the existing model's stated convention; perform screen Y-down conversion at the renderer/input boundary. A 500×500 square can remain a convenient default without silently declaring 500 millimeters or architectural scale.

Pointer conversion must invert the actual viewport transform. Rotation, pan, zoom, letterboxing, and responsive layout must not offset field dragging. Keep lattice rotation distinct from camera rotation. Define whether fields are anchored in document space or attached to a source system, and apply that rule consistently.

Boundaries need first-class model validation: sufficient distinct points, finite coordinates, no zero-length edges, explicit closure, nonzero area, and a stated policy for self-intersection. Define holes/multiple regions as later scope unless intentionally supported. Unsupported SVG elements should produce an intelligible import result rather than an empty canvas. Preserve source units/transform metadata; offer deliberate fit-to-boundary where desired.

Analytical clipping and visible clipping are separate concerns. Preserve full authored source paths when useful, but use geometrically clipped segments for in-boundary analysis/output. An SVG clip mask alone cannot establish correct exported or analytical geometry. Test concave boundaries, edge-coincident segments, tangencies, and tiny fragments.

Families must have explicit identity and path membership, never even/odd array position as the semantic definition. Rectangular, triangular and radial modes need a stated A/B interpretation while retaining two source families. Define this before claiming those modes complete.

Controls: density 1–100 with 100 meaning the maximum available paths; lattice spacing; family direction and offset; tension; smoothness; seeded irregularity; regenerate. Avoid redundant controls whose effect cannot be explained. Tension 100 preserves the straight family source, including its chosen direction/offset. Zero force really means zero; use numeric defaults that do not turn zero into a fallback value.

## C. Fields and interaction rules

Local fields first: attractor pulls inward; repeller pushes outward; deflector applies directional influence. Radius, strength, falloff, direction, position, and enablement are explicit. Evaluate along paths through the field, not only at far-away endpoints. Deformation and smoothing need a measurable tolerance; smoothness must not hide an inaccurate shape.

Later fields: compression, void and alignment. Specify what each changes independently in carrier geometry and interaction rules. Field links can describe bridge, tension, exclusion, alignment or gradient relationships. Nearest/strongest/blend/override/mask are candidate combination policies, not interchangeable labels. Make priority and blending deterministic and inspectable.

Before implementing each stitch, record its input condition, parameters, derived geometry, connectivity effect, spatial interpretation, and a small test fixture.

| Operation | Required distinction / proposed behavior |
| --- | --- |
| OVER_A / OVER_B | Layer precedence and a calibrated underpass interval; a visible crossing is not automatically a connected junction. |
| BIND | An explicit local connection/tie, with source IDs and derived geometry; may support a seam reading. |
| GAP / RELEASE | Suppressed connection and/or intentional interrupted interval. Define which continuity is removed; do not merely hide a marker. |
| BYPASS | A derived reroute or avoidance relation; must not remain only a circle drawn over an unchanged crossing. |
| RUN | Repeated continuity/span between eligible anchors, with explicit rhythm. Distinguish it from the untouched carrier. |
| CROSS | A prescribed cross-connection operation/rhythm; distinguish it from detection of any geometric intersection. |
| LOOP | A defined return/enclosure operation. Scope and anchor selection need a prototype. |
| BRIDGE | A spanning connection across a release or separation, including its attachment points and source region. |
| WRAP | A derived path following around a void, edge or field condition; define offset, extent, and termination. |
| EDGE TIE | An edge-specific anchor, tie, termination or release with boundary provenance. |

Rhythm parameters retained in scope: interval, repeat, alternation, single/double, reversal, skip/release interval, accent, phase, density gradient and edge behavior. Start with a coherent subset and extend through the same contract.

Use typed events with stable references to source paths and positions on those paths. Do not use global event sort position as the sole ID or phase anchor: inserting a remote crossing should not arbitrarily reassign all existing stitches. Version derivation algorithms so saved results can be reproduced or explicitly regenerated.

## D. Geometry, connectivity and spatial readings

Do not collapse these distinct structures into one graph:

- Geometric arrangement: where derived edges lie in the 2D plane and what regions they delimit.
- Connectivity/precedence: which paths are tied, disconnected, bridged or above/below each other.
- Spatial interpretation: rule-based candidates such as a seam, pocket or threshold.

Over/under does not automatically create a traversable junction. A release may change connectivity without changing every geometric cell. A bridge may connect across a gap without erasing that gap's spatial role. State exactly which structure an operation modifies.

Begin interstitial analysis with finite, well-defined cases and measured properties: boundary, area, centroid or interior anchor, adjacency, opening width, elongated direction, bounding events, and source fields where justified. A centroid outside a concave cell is not a valid interior point. Distinguish closed cells from open corridors and disconnected fragments.

Use simple, inspectable classification rules. Labels such as privacy, permeability or gathering potential are designer-facing interpretations, not validated architectural outcomes. The user should see why a region received a tag and be able to revise its classification or parameters.

The analytical fixture library should include a closed pocket, an opened pocket after release, a seam of binds, a bridge across a gap, and an edge threshold. Advanced readings expand after these work.

## E. Point curation and relations

Retain candidates based on crossings/near-crossings, binds/releases, curvature changes, boundary events, field/density transitions and interstice anchors where useful. Each generated point records coordinates, type, source revision, source paths/events/regions, score components, and reason. Distinguish manual points explicitly.

Proposed presets: Dense Seams, Open Releases, Bridge Conditions, Field Transitions, Interstice Centers, Boundary Thresholds, Mixed-Family Events. Expose them only when the underlying analysis exists. Filters include type, field, family, region/lasso, and score. Support minimum spacing and candidate count without disguising analytical incompleteness.

Manual operations: pin, exclude, add, delete manual point, invert, select all visible, deselect, isolate. Define exclusion precedence and whether pins override spacing/count. If upstream changes remove a source event, report an unresolved/orphaned pin rather than silently attaching it to another event with a reused ID.

Selection and visibility are distinct. Hiding a layer must not erase saved candidates. A saved Point Set includes the intended candidate/selection snapshot regardless of which circles were rendered. Restoring a Point Set restores its exact source revision or displays its baked geometry independently.

Build relations before polylines. Explain each proposed link using shared thread continuity, common field/territory, seam, corridor, edge condition, intentional bridge, direction, distance and exclusions as applicable. Distance can constrain a relation but should not be its only justification. Constrained randomness is seeded and optional.

Polyline candidates record ordered point IDs, selected relation IDs, closure, source Point Set, settings and diagnostics. Validate finite coordinates, unique adjacent vertices, length, closure, minimum area for closed shapes, self-intersections, prohibited boundary/void crossings and the selected rules. A geometrically valid loop is not automatically an architecturally useful one. Keep/delete/lock preserves human curation.

## F. Saving, revision and portable exchange

Preserve a lineage chain from Boundary/Weave revision through events/regions to Point Set and Polyline Set. Fields, seed, algorithm version and extraction/connection settings accompany the relevant snapshot.

Approved same-name behavior: save a new immutable revision and let the named entry point to its latest revision. Existing dependent outputs continue to refer to their original revision. A separate name makes an alternative. Phase 1A implements this for boundary saves; extend the same contract to later Weave, Point Set and Polyline Set saves.

Deletion must not leave invalid references or make a board disappear on hydration. Prefer explicit dependency handling, archive/recovery, or retaining referenced snapshots. Do not cascade-delete descendants invisibly. Define full-document undo/redo boundaries; one drag is one action, and a new edit clears redo.

Persist active board and selected saved object. Validate and migrate schema versions. Keep a recoverable backup before migrations. Browser-local storage alone is not cross-device durability; provide a portable project export/import. Decide the actual storage engine from data size and atomicity needs, not habit.

Final required exports: weave geometry, points, polylines, separately selectable. Establish SVG and DXF as proposed first formats; verify the receiving tool before declaring compatibility. DWG remains a historical request/compatibility question: never relabel a DXF as DWG or claim native DWG support because a vendor library is present.

Export a declared coordinate system and units; preserve orientation, positions, vertex order and closed/open status. Define raw carrier versus derived weave export; do not accidentally export construction markers or only the viewport's visible subset. Use named layers for boundary/reference, carrier, derived weave, points and polylines when supported.

A versioned metadata sidecar can preserve IDs, lineage, roles, events, cells and spatial tags that generic vector formats cannot. Tangent and Overlap may initially ignore it; rich interpretation requires their own implementation and tests. Transferred outputs remain independent/baked, not silently live-linked.

## G. Performance, display and change strategy

Separate the complete event model from representative display samples. Use spatial indexing and bounded numerical tolerances for intersection work; handle endpoint intersections, coincident/overlapping curves and near-crossings explicitly. Dense preview sampling must be spatially fair, but is not a substitute for complete committed analysis.

Use one input/render lifecycle, stable layers and explicit invalidation. During field dragging, update the carrier at most once per animation frame. Recommended first policy: hide expensive event/candidate layers or mark them stale, recompute final analysis on release, then restore enabled layers. Do not accidentally use a coarse drag preview for a saved/exported result.

Add asynchronous analysis/worker execution if profiling justifies it. Version jobs and discard stale responses. Changing an unrelated visibility switch must not trigger analysis. Measure realistic dense saved studies, not only a tiny synthetic grid. Do not promise a frame rate before measuring representative workloads.

Preserve the visual language while replacing fragile implementation details. Explicit theme tokens are preferable to broad CSS inversion if the required Light/Dark/Neo appearance is retained. View changes never change geometry, width, offsets or object identity.

Readable source and bounded patches are part of reliability. Avoid duplicate listeners, nested render wrappers, permanent legacy paths, appended CSS overrides, and controls hidden to conceal broken behavior. Change the data model deliberately with migration/tests when a later phase requires it.
