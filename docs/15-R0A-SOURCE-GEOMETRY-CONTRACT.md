# R0A — source and geometry contract

Approval update — 2026-09-16: user approved the revised contracts as applicable to R1A and authorized exact R1A implementation and local verification. These R1A decisions are settled. Later R1B and R2 gates remain deferred; publication is forbidden. Earlier draft/approval-pending wording below is historical. Current implementation/verification status is in document 19.

Reviewed 2026-09-16. [18 — Engineering review](18-R0-REVIEW-AND-DECISIONS.md) completes the normative R1A context and compatibility rules. Withdrawn numerical candidates below are review history, not implementation defaults.

Status: **draft for review; planning only**. No application code, tests, model switch, Site operation or publication is authorized by this document. The accepted Phase 2A implementation remains frozen at private Site version 3, build `WF-2A-20260914`, source `002ae94dacade531deb6c88a1414fbe6367b8356`.

Authority: [master guide](00-MASTER-GUIDE.md), [phased plan](12-PHASED-DEVELOPMENT-PLAN.md), [build batches](13-BUILD-BATCHES.md), [builder checklists](14-BUILDER-CHECKLISTS.md), current-state and model-handoff records. Documents 09 and 10 are historical examples rather than the governing sequence.

## 1. Current model review

The accepted carrier model already establishes useful source semantics:

- Document coordinates use Y-up and unspecified document units. View transforms never change model coordinates.
- A rectangular carrier owns a stable carrier ID and two explicit source families. A source path key is `(boardId, carrierId, familyId, k)`; spacing, offset, density and shared rotation do not replace the carrier ID.
- Each rectangular source path is an analytical infinite line with a unit direction, an analytical origin and signed distance parameter `t` in document units. Density selects source paths without renumbering `k`.
- Model-space polygon clipping produces one or more strictly interior intervals. Concave gaps stay separate. Tangencies and collinear boundary overlap do not become positive-length carrier fragments.
- The accepted tolerance is `tau = max(1e-8, 64 * Number.EPSILON * max(1, maxAbsCoordinate, boundaryExtent))`, evaluated in a boundary-centered local frame. Positive committed intervals must be longer than `tau`.
- A path identity survives boundary reclipping; a fragment identity is scoped to an input fingerprint and interval ordinal. Fragment identity is therefore revision-local and is not a safe cross-topology source reference.
- Derived carrier geometry is complete model data, independent of visibility and viewport state, but is recomputed rather than saved as authoritative output. Carrier Study revisions save the complete boundary snapshot, ancestry and carrier recipe.

The current output is specialized to infinite straight lines. R0A must generalize the output contract without changing `rect-v1`, its path keys, density rule or accepted clipping behavior.

## 2. Proposed source contract

Every future strand starts from one immutable source definition within one saved study revision.

```text
StrandSource {
  strandId
  sourceKind
  familyId: "A" | "B"
  sourcePathKey | manualSourceId
  orderedPrimitiveIds[]
  parameterizationVersion
  sourceGeometryVersion
  generatorReference
}
```

`strandId` is stable for the life of that logical source strand. Generated rectangular strands derive it from the accepted Phase 2A path key. Future manual strands receive a UUID when created and retain it until explicitly deleted. Copying a board changes the board identity and therefore the generated strand identity; saved ancestry retains the original revision snapshot.

A source consists of ordered analytical primitives. R0A initially requires only:

- `line`: the existing rectangular analytical line, with unit direction and signed document-distance parameter;
- `segment`: a bounded straight primitive with stable `primitiveId` and local parameter `u` in `[0,1]`.

Future curve primitives require a new source-geometry version and their own evaluation contract. They are not implied by this draft.

An authoritative source location is:

```text
SourceLocation {
  strandId
  primitiveId
  parameter
  parameterKind: "signed-distance" | "unit-interval"
}
```

For a Phase 2A line, `primitiveId` is the stable axis primitive and `parameter` is the existing signed distance `t`. For a bounded manual segment, `parameter` is local `u`. Downstream records reference this location rather than a sampled vertex, screen coordinate, clip-fragment ordinal or nearest point.

Every location requires an explicit enclosing sourceContext with sourceBoardId, sourceCarrierRevisionId, exact immutable source snapshot and parameterizationVersion. R1A uses strand-source-v1, rect-distance-v1, derived-identity-v1 and weave-study-v1. Bare locations cannot resolve across revisions. See document 18 for lifecycle and fingerprint rules.

## 3. Proposed derived-strand output

R1A should consume a saved carrier source revision and produce a versioned derived study without mutating the carrier recipe or `rect-v1` output.

```text
DerivedStrand {
  strandId
  sourceRevisionId
  sourceFingerprint
  derivationVersion
  parameterizationVersion
  orderedGeometry
  clippedFragments[]
  diagnostics
  complete: true
}
```

`orderedGeometry` is authoritative document-space geometry with a monotone mapping back to `SourceLocation`. Rendering samples are disposable. If adaptive approximation is used, each committed segment must carry its source-parameter interval and declared maximum error; downstream intersections are reported in source parameters rather than sample indices.

`clippedFragments` are ordered views of the same complete strand. Each fragment stores source-location endpoints, boundary-contact provenance and ordered geometry. A fragment key may use `(derivedFingerprint, strandId, fragmentOrdinal)` and remains revision-local. No downstream saved object may use a fragment ordinal alone as durable identity.

Diagnostics must include algorithm versions, tolerance/error values, input fingerprint, work counts, omitted degeneracies and `complete`. A hard-limit failure rejects the new derivation and preserves the prior complete working result. Preview output must say `complete: false` when reduced; it cannot be saved or exported as full geometry.

## 4. Clipping and tolerance policy

The accepted Phase 2A strict-interior policy remains the baseline:

- clip in document geometry using a boundary-centered local frame;
- include positive-length intervals whose midpoint is strictly inside the polygon;
- keep concave-separated intervals separate;
- deduplicate shared-vertex contacts within `tau`;
- exclude tangency-only contacts and boundary-collinear spans from strand extent while retaining diagnostics;
- preserve endpoint boundary-edge provenance and source parameters;
- never use an SVG mask as analytical clipping;
- never bridge an outside gap because sampled endpoints happen to be near one another.

For piecewise geometry, clip each primitive in source order and merge adjacent inside pieces only when their source locations are contiguous and the shared point agrees within tolerance. A fold vertex keeps one primitive endpoint on each side; it is not simplified away merely because its adjacent pieces meet within tolerance.

The existing `tau` remains the contact/classification tolerance for straight Phase 2A inputs. A separate approximation bound is required before R1A may commit deformed geometry. Approximation error and geometric contact tolerance must not be represented by one ambiguous number.

## 5. Identity and version rules

- Preserve `rect-v1`, `polygon-line-v1` and `density-v1` exactly for accepted Phase 2A studies.
- Introduce `strand-source-v1` only when a durable source envelope is implemented. It wraps existing identities; it does not rewrite them.
- Introduce derived-identity-v1 for R1A: Q(t)=P(t), preserving accepted endpoints exactly.
- A derivation fingerprint includes the exact source revision, boundary snapshot, derivation inputs, parameterization version and algorithm versions. It excludes labels, theme, camera and visibility.
- Stable identity means stable within the declared source/revision domain. Topology-changing regeneration does not promise automatic correspondence. Missing references become unresolved; nearest-point reassignment is prohibited.
- Sample vertices and clip fragments may be deterministically reproduced for the same complete inputs and versions, but they are not primary cross-revision identities.

## 6. Review scenarios

1. **Default carrier:** on the accepted 500 square, A path `k=0` retains the same strand/source identity and signed-distance parameter through derived zero-effect output.
2. **Rotated carrier:** rotating the recipe changes the fingerprint and geometry but preserves the logical Phase 2A path key for each retained `k`.
3. **Concave carrier:** one source path clipped into two arms has one strand identity and two revision-local fragments; source parameters remain ordered across the omitted outside interval.
4. **Hypothetical folded manual strand:** a piecewise path with stable segment primitive IDs retains an unambiguous `(primitiveId,u)` location on both sides of a fold. Moving or resampling display vertices cannot silently move a saved reference to a different primitive.

These are contract walkthroughs, not new automated or browser results.

## 7. Recommended defaults for the unresolved R0A decisions

These defaults are concrete planning recommendations. They become settled only when approved. The validation evidence listed here is required evidence for implementation acceptance; it is not a claim that the checks have already run.

### 7.1 Committed derived geometry form

**Default:** save a complete bounded-error polyline, its monotone source-parameter mapping, the exact derivation inputs and every algorithm version needed to reproduce it. Do not serialize an executable deformation function in schema v1.

**Consequences:** a saved revision is portable, inspectable and immutable without depending on a JavaScript closure or later runtime behavior. A geometry-algorithm change requires an explicit version change or migration. Snapshots are larger than input-only saves, but old work can still be rendered and exported exactly even when recomputation software changes.

**Evidence needed:** canonical same-input output equality; exact save/reload and JSON-backup recovery; correct source-location interpolation on every committed segment; old-version fixture loading after a derivation-version change; proof that incomplete preview geometry cannot enter a saved complete revision or export.

### 7.2 Approximation and subdivision policy

Every generated study saves positive `referenceSpacing` from the minimum of both recipe family spacings, independent of display visibility or density. A future manual-only study needs an explicit reference scale at its batch gate. Let `E` be `max(boundary width, boundary height)` and keep the accepted contact tolerance `tau` unchanged.

**Withdrawn as a guaranteed bound; calibration candidate for R1B only:**

```text
approximationError = max(8 * tau, min(referenceSpacing / 1000, E / 10000))
maximumSegmentLength = min(referenceSpacing / 4, E / 200)
```

Three interior samples cannot bound excursions between samples. A maximum chord length cannot fix that for arbitrary evaluators. The earlier 16-level/4,096/50,000 subdivision caps have no workload evidence and are withdrawn as universal contracts. R1A uses exact straight segments without subdivision or approximation; R1B must supply an evaluator-specific conservative error enclosure, split known formula breakpoints, and establish work caps before implementation. Preview sampling may be heuristic only when declared incomplete.

On a 500-unit square with spacing 50 the withdrawn candidate evaluates to 0.05 units and 2.5 units. Neither is approved accuracy. No user-entered tolerance is required. R1A copies accepted carrier endpoints exactly; approximation error is zero relative to that floating-point line representation, not a claim of exact real arithmetic.

**Consequences:** long straight paths stay cheap and Phase 2A parity remains testable. Later bounded spatial error alone cannot guarantee crossing topology near tangency/overlap. Analysis must distinguish exact facts about the committed polyline from uncertain claims about an underlying continuous curve.

**Evidence needed:** analytic line, circular-arc and high-curvature fixtures with known maximum deviation; convergence checks showing crossing/proximity classifications remain stable when the error bound is halved; deterministic output across reload; exact enforcement at each hard limit; and representative performance measurements before R1 accepts these limits. A failed accuracy or workload result changes the versioned formula, not a hidden epsilon.

### 7.3 First manual geometry

**Default:** the first manual-strand implementation supports ordered bounded straight segments with stable primitive UUIDs. A fold is an explicit shared endpoint. Bézier or other curves require a later `sourceGeometryVersion` and a new evaluation, mapping and export contract.

**Consequences:** R2D can provide direct point and segment editing, exact folds, predictable clipping and lossless straight-path SVG output. Users cannot author a truly curved manual primitive in the first manual batch; adding curves later will not reinterpret existing straight segments.

**Evidence needed:** create, move, insert and delete operations on a folded-strand fixture; identity checks showing unaffected primitive IDs survive each edit; concave clipping without bridging an outside gap; JSON round-trip; and straight `M/L` SVG round-trip. Workflow review must show a concrete task blocked by straight segments before curves are promoted into the first contract.

### 7.4 Generated evaluation domain outside the boundary

Let `[qMin, qMax]` be the boundary projection onto a strand's source parameter. R1A uses exactly that finite interval while retaining the analytical infinite source recipe. Future deformation needs a conservative displacement bound over the supported domain; finite influence support is not inherently required.

**Withdrawn candidate; insufficient as a complete enumeration contract:**

```text
evaluationDomain = [qMin - M, qMax + M]
M = Rmax + Dmax + 2 * maximumSegmentLength
```

For R1B, conservatively expand BOTH the normal candidate-index range and the tangential evaluation domain using the chosen evaluator's displacement/error bounds. Extending t alone misses source lines initially outside the boundary that bend into it. Apply density-v1 to original k and preflight before allocation. The actual carrier API returns only positively clipped paths; it cannot be the sole source enumerator for nonlinear deformation. Domain and budget proof is due before R1B, not R1A.

**Consequences:** the shared contract permits bounded-displacement fields with noncompact support and preserves possible incoming strands. R1A's zero-effect domain needs no artistic margin. Padding and field-combination bounds cannot be asserted without the selected evaluator.

**Evidence needed:** an outside-centered field that enters the boundary; a maximum-displacement return path; equality of interior results after expanding the domain by one additional maximum segment length; rotated and concave boundaries; and atomic rejection for missing bounds or cap overflow.

### 7.5 Cross-revision correspondence

**Default:** automatic correspondence exists only when `strandId`, `primitiveId` and `parameterizationVersion` all survive, and the stored parameter remains in the primitive domain. No coordinate proximity or nearest-point match may create a correspondence. A future explicit rebind operation records both the old and new references as an authored migration.

**Consequences:** ordinary reclipping and compatible source edits preserve valid references; deletion, primitive replacement or incompatible topology changes produce visible unresolved records. Users may need to repair references, but the system never silently attaches an edit or relationship to the wrong strand.

**Evidence needed:** spacing, density, rotation and boundary-reclip cases for surviving generated path keys; source and primitive deletion cases; manual segment insertion and replacement; exact unresolved state after save/reload and undo; and a negative test proving coincident coordinates do not cause automatic reassignment.

## 8. R0A disposition

The engineering review in [18-R0-REVIEW-AND-DECISIONS.md](18-R0-REVIEW-AND-DECISIONS.md) completes the source-context, identity and compatibility rules and supersedes earlier draft assumptions. R1A requires exact identity geometry only; nonlinear bounds and later editing behavior have explicit later deadlines. Approval and implementation authorization remain outstanding.
