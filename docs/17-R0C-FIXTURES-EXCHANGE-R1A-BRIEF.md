# R0C — fixtures, exchange envelope and R1A brief

Approval update — 2026-09-16: user approved the revised contracts as applicable to R1A and authorized exact R1A implementation and local verification. These R1A decisions are settled. Later R1B and R2 gates remain deferred; publication is forbidden. Earlier draft/approval-pending wording below is historical. Current implementation/verification status is in document 19.

Status: **draft for review; planning only**. No application code, automated verification, browser work, receiver modification or publication is authorized.

## 1. Current Tangent evidence

The inspected local Tangent Systems reference is commit `a6cc3c2826b4e55f311b6a9e06b7d94c2ffe02a6`, whose UI identifies itself as build 04. Its current source establishes:

- SVG import reads closed straight `<polygon>`, repeated-endpoint `<polyline>`, unrounded `<rect>` and closed straight `M/L/H/V/Z` paths, including supported element/group transforms.
- It also imports closed ASCII DXF `POLYLINE`/`LWPOLYLINE` and locally decoded DWG, then selects the largest closed polygon when a file contains several shapes.
- Imported model coordinates are preserved; canvas fitting is a separate view transform. SVG does not infer physical units. DXF preserves `$INSUNITS` when present.
- Tangent treats polygon vertices as anchor inputs. Its importer does not consume a Weave JSON companion, strand identities, significance, radii or other proposed metadata.
- Tangent exports SVG and DXF. Its current UI does not offer DWG export.

These are local source observations, not a network refresh or live-browser acceptance run; deployed-source parity is unverified in this review. Current Tangent support is broader than its README's older build-02/future-DXF wording. Full import can assign new anchor IDs or normalize ordering, and SVG export rounds to six decimals; importer inspection is not proof of exact round-trip identity or geometry.

## 2. Recommended exchange envelope

**Default:** R8/R9 exchange is a two-file, versioned package:

1. an SVG containing the authoritative closed synthesis geometry Tangent can already ingest;
2. a same-basename JSON companion containing Weave identities, coordinate declaration, source lineage, significance, relational measures and later radius information.

For the initial contract, the SVG contains exactly one closed straight `M/L/Z` path. Weave keeps Y-up model coordinates; SVG writes `(x, -y)` and declares that transform in JSON. JSON coordinates remain Y-up. Stable vertex IDs and ordered source references live in JSON because current Tangent ignores custom metadata. Tangent ingestion of that metadata is a separate R9C receiver batch and cannot be claimed before receiver implementation and round-trip verification.

```text
weaveExchangeVersion: "weave-tangent-v1"
geometryFile
coordinateSystem: { units, yAxis: "up", svgTransform: "negate-y" }
sourceStudy: { boardId, revisionId, fingerprint }
shape: { shapeId, closed: true, orderedVertexIds[] }
vertices[]: { vertexId, point, sourceReferences[], measures, significance, radiusHint? }
relations[]
algorithmVersions
```

**Consequences:** geometry works with Tangent’s current importer, while richer meaning remains portable and versioned. Until R9C, Tangent edits only the SVG-derived anchors and cannot preserve companion semantics through its own saves/exports. Multiple synthesized shapes require separate SVG files or a later receiver change because current import selects the largest polygon.

**Evidence needed:** a known asymmetric polygon through Weave SVG export and Tangent import with orientation/scale verified; JSON schema and backup validation; vertex-order and ID round-trip in a test harness; explicit proof that current Tangent ignores rather than corrupts companion metadata; and, for R9C, receiver tests that bind JSON to the exact geometry fingerprint and reject mismatch.

## 3. Four relational fixtures

Fixtures use document units, Y-up coordinates and a `500 × 500` square boundary from `(-250,-250)` through `(250,250)`. Expected counts below are contractual seeds for later automated checks; they have not been run against unimplemented R1–R6 algorithms.

### F1 — regular field

- Family A: horizontal lines at `y = -200, -100, 0, 100, 200`.
- Family B: vertical lines at `x = -200, -100, 0, 100, 200`.
- Expected geometric baseline: 5 strands per family at spacing 100, 25 proper interior crossings, uniform 100-unit gaps. This differs from the accepted spacing-50 default's 9/9 paths and 81 crossings.

Purpose: zero-effect identity, deterministic ordering, uniform-measure and performance baseline.

### F2 — gradual approach and separation

- A1: `(-200,-120) → (0,-60) → (200,-20)`.
- A2: `(-200,120) → (0,60) → (200,20)`.
- A companion reverses traversal order without changing geometric shape.
- Expected baseline: no crossing; vertical cross-section separation at x=-200,0,200 is 240,120,40. These are not nearest-distance measurements. Reversing traversal changes a directional reading, not geometry; R3C must explicitly declare reference direction before classification.

Purpose: directional convergence/divergence without inventing a discrete crossing event.

### F3 — mixed rhythm

- Family A horizontals at `y = -120, -40, 0, 100` (gaps 80, 40, 100).
- Family B verticals at `x = -150, -20, 30, 170` (gaps 130, 50, 140).
- Expected geometric baseline: 16 proper crossings; deliberately nonuniform same-family gap sequences.

Purpose: local rhythm, intensity and significance ranking without random input.

### F4 — isolated condition

- Regular base: A horizontals at `y = -150, -50, 50, 150`; B verticals at `x = -150, -50, 50, 150`.
- Manual A segment: `(-25,225) → (25,225)` with its own stable strand and primitive IDs.
- Expected geometric baseline: 16 base crossings; the manual segment has no crossings and is 75 units from the nearest base A strand.

Purpose: retain an isolated, analytically eligible condition without forcing it into a connection or synthesized shape.

Each fixture also gets negative variants for endpoint touch, tangency, collinear overlap, outside-only geometry, duplicate IDs and an open exchange path.

## 4. Units and workload defaults

**Units default:** coordinates remain document-units/Y-up; no physical scale is inferred. Each generated revision records referenceSpacing as the minimum of both family recipe spacings, independent of visibility and density. A manual-only reference scale and physical units remain later contracts.

**Workload resolution:** retain 2,000 candidate lines, 20,000 intervals and 2,000,000 line-edge tests for R1A. One exact segment per clipped interval; no subdivision. Withdraw universal nonlinear subdivision caps. Actual backup guard is text.length <= 10*1024*1024 JavaScript code units, not MiB; preserve it and the 100-board guard. Check actual serialized backup size before adding revisions. Candidate preflight must precede allocation in the R1A entry path; the current carrier builds specs before checking its limit.

**Performance target:** retain the approved 400-candidate/100-edge, 30-warm-run p95 <=100 ms target for the full R1A identity derivation. Measure save/validation/restore and gesture timings separately with snapshot counts and host identity. Withdraw the unsupported 50 ms preview promise. A kernel result is not proof of whole-application responsiveness. Preserve the earlier Phase 2A evidence without rerunning it during planning.

**Consequences:** workload and accuracy are deterministic and portable; physical fabrication scale requires an explicit later choice. Complete derivation may reject extreme studies instead of degrading silently. Measured failure leads to a visible versioned limit or algorithm decision, never a user request to guess a tolerance.

**Evidence needed:** F1 at normal and rotated orientation; the 400-line/100-edge reference; exact cap-boundary cases; 30-run p50/p95/max report with host/build identity; the existing backup string-length boundary including non-ASCII labels; large-coordinate and tiny-spacing fixtures; and identical results after camera/theme changes.

## 5. Bounded R1A implementation brief

R1A is the first possible implementation batch after the R0 package is approved and implementation is explicitly authorized.

### Build

1. Create a distinctly identified Weave Study from a selected immutable saved Carrier Study revision. Exact identity equation Q(t)=P(t); copy accepted selected path intervals/endpoints and clipping provenance without resampling or changing rect-v1. Store analytical line definitions, finite boundary-projected evaluation domains and exact source snapshots. A zero-selected-path result is complete and valid.
2. Add independent Source and Derived overlay visibility on the existing canvas. Retain accepted A/B/lattice/boundary controls; no view toggle regenerates geometry. Show source name, modified status and counts. Technical fingerprints stay in diagnostic readback/metadata rather than primary controls.
3. Add schema-4 working persistence, named immutable revisions, restore/undo, schema-2/3 raw recovery, backup merge/fork rebasing, validation and exportable-size preflight according to document 18. Implement only R1A fields, without placeholder fields/locks/manual edits.
4. Export raw complete derived SVG: one open M/L path per clipped fragment grouped by A/B, explicit Y negation/viewBox, source/revision/fingerprint and t/provenance metadata. No Z, handles, symbols or bridge across gaps. Export all analytical included paths regardless of display visibility; use round-trip numeric serialization rather than the old boundary exporter's eight-decimal rounding. Preserve existing boundary exports. Empty results export empty family groups and zero-count metadata with a boundary-based viewBox.

### Remains afterward

R1B attractor and certified approximation; R1C repeller/deflector; R1D combination/variation; manual strands, locks/exclusions, crossings/precedence, analysis/significance, synthesis and relational exchange. Raw R1A open-strand SVG is a basic export, not a Tangent closed-shape handoff. Receiver changes and physical units remain later.

### Automated verification

- Same-input determinism and exact zero-effect equality to accepted carrier geometry.
- Default, rotated and concave F1 variants with ordered source mapping and no gap bridging.
- Identity survival through compatible reclipping and strict unresolved negative fixtures.
- Schema-3-to-4 migration, immutable revisions, undo and full JSON round-trip.
- Workload preflight, snapshot validity, incomplete-preview rejection and recorded p95 benchmark; separate storage/UI measurements.
- Raw SVG geometry/axes/metadata/empty output and hidden-family export; schema migration raw-backup failure, concurrent clients, quota, unknown versions, changed-board fork and fork-of-fork identity rebasing. Undo must preserve append-only libraries.

### Proposed live acceptance tests

1. On a 500 square with spacing 50/density 100, save Carrier Study SOURCE and create a weave from it. Expect 9 A/9 B; Source and Derived overlay exactly and toggles do not move them.
2. Set working A spacing 100 and rotation 30 degrees. Confirm clipped updates; Undo both to recover the default. Saved SOURCE remains unchanged.
3. Create a weave from a saved concave U carrier. Export Derived SVG and open in a browser: both arms remain, the notch is empty, orientation matches and handles are absent.
4. Save WEAVE TEST, change A spacing to 100, save again under the same study name. Restore each revision and reload; both remain available with their own geometry.
5. Download JSON backup and import in a separate empty browser profile/test origin. Restore both revisions and inspect source links. Do not clear the user's original workspace.

## 6. Decision and model checkpoint

R0C recommends approval of the reviewed shared source/persistence rules, fixtures, exchange direction and exact R1A scope above, including document 18's engineering resolutions. Nonlinear error calibration, lock behavior and manual-edit response are later gates. They are not proposed for blanket approval or implementation in R1A.

The review in document 18 resolves routine R1A engineering choices. The withdrawn numerical rules are not approval items. Lock scope (R2C), edit behavior (R2D), nonlinear bounds (R1B) and later receiver integration remain scheduled gates, not R1A blockers. Once this reviewed package and exact R1A scope are approved and recorded, R1A follows established decisions and can return to Sol Medium after explicit implementation authorization. Publication remains separate.
