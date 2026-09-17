# R1B — One attractor: architectural proposal

2026-09-16. Approval/status update: the user approved this architecture and authorized its exact implementation and local verification. Implementation then stopped at the mandatory performance gate: optimized dense representative derivation p95 was 205.72 ms against <=100 ms. Executable source was restored to verified R1A; evidence is in [21](21-R1B-ARCHITECTURAL-REVIEW-EVIDENCE.md), and [22](22-R1B-WORKER-EXECUTION-PROPOSAL.md) proposes a planning-only latest-request worker revision. This document remains the approved geometry/accuracy contract, but is not currently an implementation-ready handoff. Publication, R1C, Tangent and Overlap changes remain forbidden.

## Baseline and exact proposed scope

Read against master 00, phased plan 12, schedule 13, checklist 14, reviewed R0 contracts 15–18, actual carrier/weave/document/storage source, and R1A evidence 19. R1A implementation is `15fa7772f3e37c0840fd944f015a4d1fbd580828`; verification-record HEAD is `f07a63f9d884110b2debfa9a1284205695e2755a`. Its 43 automated tests and nine host-browser scenarios passed; browser timings were spacing gesture 15 ms, save 38 ms, reload 47 ms, with no page errors. These are R1A results, not evidence of nonlinear performance.

The live owner-private site remains accepted Phase 2A, version 3 / `WF-2A-20260914`, source `002ae94dacade531deb6c88a1414fbe6367b8356`. R1A remains local and unpublished.

Build only after separate authorization:

1. One authored attractor on an active Weave Study, with center, radius, strength, tension, enable/disable, placement/drag and independent guide visibility.
2. Deterministic deformation of complete analytical source paths, error-controlled polyline reconstruction and analytical boundary clipping, including strands initially outside the boundary.
3. Atomic preview/commit/undo, versioned immutable saves, recovery-safe migration, backup/fork compatibility and preservation of the existing raw derived SVG capability for the new geometry.
4. Automated numerical/lifecycle/regression checks, measured performance, local browser verification and five simple visual tests below.

Remain afterward: R1C repeller/deflector; R1D multiple influences, combination/order and seeds; all R2 crossing/rhythm/lock/manual-edit gates; analysis, significance, point extraction, synthesis, relational exchange and receiver work. No simulation, inertia, mutual response, force integration, workers, cloud storage or new export format is included.

## 1. Deformation and falloff

Use the existing analytical source `P(t) = O + n*(k*spacing + offset) + d*t`. Preserve `rect-v1`, signed-distance `rect-distance-v1`, density selection and original integer k identities. The formulas below use ideal unit source directions; numerical bounds must include the actual stored binary64 direction norm as described below.

For document point p, authored center C, radius R > 0, strength S in [0,100], and tension percentage H in [0,100], define:

```text
T = H / 100
a = 0.8 * (S / 100) * (1 - T)
s = dot(p - C, p - C) / R²
w(s,T) = (1 - s)³ * (1 + T*s)   when 0 <= s < 1
         0                       when s >= 1
Q(t) = P(t) + a*w(s,T)*(C - P(t))
```

When absent, disabled, S=0 or H=100, take the exact R1A identity path, without evaluating this equation or subdividing. “Restore source” here means identity of the **current working carrier/boundary**. R1A's optional Source overlay still represents the original saved carrier revision and may differ after working carrier edits.

This is an authored geometric deformation in document units, not calibrated textile physics. Evaluate from P each time; never deform the previous Q, accumulate drag steps or feed output back as input. Both families receive the same point transformation. A point at C stays at C; no normalization by distance or center singularity occurs. Outside the radius the displacement is exactly zero. The displacement and its first two derivatives join continuously at the support circle. Radius means support radius, not diameter or Gaussian standard deviation.

**Strength versus tension:** strength scales displacement uniformly for a fixed tension. Tension reduces overall response while the `(1+T*s)` factor gives the outer response relatively more weight than the inner response. Therefore tension changes the normalized profile as well as amplitude; it is not another strength multiplier. At H=100 the entire field has zero response. Label it “Tension” with concise help: “Resists the pull and changes its spread; 100 keeps straight carriers.” Do not add a separate smoothness/inertia slider. Falloff is a named, fixed “Smooth local” profile in R1B, not a menu of unverified laws.

For 0<=s<=1, w decreases from 1 to 0: its derivative in s is `(1-s)²*(-3+T-4*T*s) <= 0`. Since a<=0.8, radial scale `1-a*w >= 0.2`; radial derivative is also >=0.2. The ideal map is one-to-one and orientation preserving. It compresses spacing and bends strands without folding them or creating new intersections between originally disjoint full strands. Original full-plane A/B intersections move with the field; clipping can change which are visible. This is an intentional first-attractor restriction, not a universal contract for later influences. The committed polyline's topology is not proved solely by this continuous-map fact.

## 2. Controls and proposed ranges

Use the established canvas and collapsed panels/themes. Add a usable Attractor section to the active weave controls, not an inert seven-workspace navigation shell.

| Control | Default / behavior |
| --- | --- |
| Add attractor | Requires an active weave; one record maximum. Center at current boundary bounding-box center, even for a concave boundary. |
| Position | Place tool or center-handle drag; numeric X/Y in document coordinates. Center may be outside the boundary. |
| Extent | Radius R, default 0.3 times the larger boundary bounding-box extent E. Ring handle and numeric input. |
| Strength | S=50; slider and numeric input, 0–100. |
| Tension | H=0; slider and numeric input, 0–100. |
| Falloff | Fixed “Smooth local”; the exact versioned equation is above. |
| Enabled | Initially true; off retains all authored settings and restores identity geometry. |
| Show attractor guide | Independent display-only center/ring; never changes geometry or saves. |
| Remove | Removes the working field as one undoable operation; saved revisions remain. Re-adding creates a new field ID. |

Numeric coordinates retain the existing absolute 1e9 magnitude ceiling. Radius must be finite and 0<R<=1e9. Reject NaN, infinity, missing values, negative strength, invalid percentages and unsupported versions; do not clamp persisted data. A convenience radius slider spans E/100 to 2E, limited to the numeric range; valid typed radii outside its convenience span remain valid and visibly represented. E changes do not rescale or move an authored field. Spacing/rotation changes affect the source, not C or R. Document units remain unspecified physical units.

Numeric validity is necessary, not sufficient: a valid number can still fail precision or work limits. The size/range choices bound serialization and retain coordinate compatibility; they are not evidence that every 1e9-scale configuration is resolvable.

## 3. Complete source domain and deterministic reconstruction

The current carrier API returns already-clipped positive intervals. Using only those paths would miss incoming strands. Add a separate nonlinear enumerator; do not alter `polygon-line-v1` or its accepted output.

A conservative displacement bound is `D = a*R*(1+T)/4`. This follows because `max(sqrt(s)*(1-s)³)=216/(343*sqrt(7)) < 1/4`. D includes the maximum anywhere on a source, not just at sampled points. With maximum strength and zero tension, D<=0.2R.

Let epsilon be the reconstruction target below. Expand boundary projection ranges in BOTH normal k and tangential t by D+epsilon+tau, using outward-rounded arithmetic. Derive ranges for the actual accepted d/n vectors, accounting for their norms and dot products rather than assuming floating-point exact orthonormality. Include uncertain endpoint candidates and apply the unchanged density-v1 selection to original k. Preflight safe integer index bounds and candidate/work counts before allocation. A source that can reach the boundary must lie in this expanded domain. The expansion also contains any reconstructed chord that could clip into the boundary within epsilon. Viewport, zoom, overlay visibility and source endpoint clipping cannot reduce this domain.

Process selected paths in A/B, ascending k, then ascending t. Start with the finite expanded t interval. Use deterministic midpoint subdivision and interval distance tests: a subinterval certified outside the support is straight and needs no curved sampling; others use the curvature bound below. Unknown support classification is treated as potentially affected, never dropped. The field is C2 at its support edge, so a subinterval crossing the edge is covered by the same bound; exact circle roots are unnecessary. Retain monotone t at every committed vertex and per-segment error/provenance. Use the same full-quality algorithm for previews and commits; if a preview is pending, show the last complete geometry explicitly as pending, never as a result for new committed inputs.

## 4. Approximation: proposed bound and precision policy

Let `sref=min(current A spacing,current B spacing)` before density selection, and E be the current larger boundary extent. Set:

```text
epsilon = min(sref/200, R/2000, E/10000)
tau = existing scale-aware carrier contact tolerance for the current boundary
```

The three terms limit error relative to source spacing (0.5%), field radius (0.05%) and document extent (0.01%). Example: E=500, spacing=50, R=150 gives epsilon=0.05 document units. These are proposed engineering accuracy targets, not display pixel tolerances, physical measurements or previously verified results. Do not ask the user to tune them. The identity shortcut has zero approximation error relative to R1A's stored geometry and does not need this nonlinear precision gate.

For an active nonlinear field, require epsilon>=16*tau. Reject an unresolvable configuration rather than increasing epsilon to a hidden floor. This ratio reserves separation between reconstruction accuracy and contact classification; it does not certify real arithmetic by itself.

An evaluator-specific conservative second-derivative bound along a unit-speed line is:

```text
M = a*(10 + 23*T)/R
max ||Q(t) - linear_chord(t)|| <= M*(t1-t0)²/8
```

Derivation: write `w0=(1-s)³`. Inside support, along a unit-speed line, `|w0'|<=7/(4R)` and `|w0''|<=6/R²`. For `v=1+T*s`, `|v|<=1+T`, `|v'|<=2T/R`, `|v''|<=2T/R²`. Thus `|w'|<=(7+15T)/(4R)` and `|w''|<=(6+15T)/R²`. From `Q''=a*(w''*(C-P)-2*w'*P')`, its norm is at most `a*(9.5+22.5T)/R`, bounded by M. Outside support it is zero; C2 continuity extends the bound across the support. The linear-interpolation integral remainder has kernel integral at most `(t1-t0)²/8`; this bounds vector error at matching t, not just three test samples. Multiply M by an outward upper bound on the actual direction norm squared for the accepted floating-point line.

Implementation must enclose, not merely estimate, arithmetic error. Use outward-rounded binary64 interval operations for the polynomial evaluator, range calculations and error comparisons; implement/test nextUp/nextDown on IEEE-754 values. Use a boundary-centered local frame. Include source point formation, actual stored coefficient/direction values, endpoint evaluation and conversion back to stored coordinates. For a segment require `analyticBound + endpointNumericBound <= epsilon`. The interval-to-stored-endpoint Euclidean distance can conservatively use the sum of absolute coordinate bounds. Bound all intermediate operations; nonfinite arithmetic or uncertain acceptance means subdivision or rejection. Do not label ordinary rounded evaluations plus “8*tau” a proof. Treat stored binary64 source coefficients as the reference geometry, without claiming exact transcendental sin/cos values.

The enclosure implementation and its independent verification are substantive R1B tasks. Record both target epsilon and achieved upper bounds per segment/result; no silent simplification may exceed them. This plan derives the analytic bound but does not claim an implemented floating-point certificate or a cross-browser numerical pass.

## 5. Analytical clipping and accuracy limits

Introduce `polygon-polyline-v1`. Clip each reconstructed segment against the validated current polygon in document coordinates. Sort contacts in segment/source order; classify intervening positive-length spans by strict-interior tests. Retain separate concave fragments. Join adjacent inside pieces only across their original shared source endpoint with no outside interval between; spatial proximity alone cannot close a gap. Preserve current strict-interior policy for boundary-collinear spans and tangency-only contacts, with explicit omitted/contact diagnostics.

Use normalized distance predicates and length-scaled segment-parameter thresholds, not an unscaled area-versus-length comparison. Enclose uncertain predicates with interval arithmetic; a predicate straddling its tolerance decision must resolve by refinement or reject with a precision diagnostic. Exact boundary contact cases have explicit on-boundary handling, not an infinite retry loop. Compute clipped endpoints from segment interpolation and store their source t by the same interpolation; this locates them on the committed approximation, not an asserted exact root of the nonlinear curve. Include boundary snapshot/edge indexes and vertex-contact classification. Bound endpoint rounding within tau/4; include it separately in diagnostics. Count discarded spans of length<=tau; never silently bridge them.

The continuous curve-to-polyline bound applies **before clipping**. Near tangency, epsilon-close curves can have different intersection counts or tiny in/out excursions. Do not claim identical topology or epsilon-close clipped endpoints for the ideal curve. The authoritative R1B output is the analytically clipped committed polyline; later crossing/interstice algorithms consume it and its uncertainty metadata. Save this distinction explicitly as `accuracyScope: 'unclipped-curve-to-polyline'`, with a separate clipping rounding bound. No contact is certified as an exact continuous-curve event. Testing at finer epsilon is diagnostic evidence, not a substitute for the bound or a reason to mutate a saved revision.

## 6. Work limits and performance gate

Retain accepted carrier validation limits and its unchanged kernel. Proposed ADDITIONAL limits for the new nonlinear evaluator, per derivation:

| Limit | Proposed value / reason |
| --- | --- |
| Expanded candidate lines before density | 2,000; preserve the existing carrier candidate ceiling on the actual larger domain. |
| Reconstructed segments | 65,536; bounds memory/work before clipping. |
| Subdivision depth per source interval | 20; finite escape guard, never permission to accept excess error. |
| Segment/boundary-edge pair tests | 8,000,000; explicit upper bound, preflight segment count times edge count before each clipping chunk. |
| Clipped output segments | 65,536; separate cap because concave clipping can multiply pieces. |
| Positive clipped fragments | 20,000; retain the existing order of output capacity. |

Count all generated work, including discarded subdivision nodes and rejected candidates; bound subdivision nodes by twice the segment ceiling plus the candidate ceiling. Check limits before allocating the next item. All enabled families participate regardless of display state; density filtering remains the authored selection, not a preview shortcut. One derivation failure returns a useful category/count and preserves the previous complete state. Empty selection is a complete valid result.

These finite safety ceilings are **proposed caps**, not a claim that their worst cases fit the 100 ms goal. They are specific to this algorithm and must not become universal future-evaluator constants. Candidate/segment counts, maximum error, contact omissions and precision decisions belong in deterministic diagnostics; elapsed time belongs in verification reports, not geometry hashes.

Measure 30 warmed runs on the recorded R1A host for: default 500-square/50-spacing; dense 500-square/2.5-spacing (about 400 source paths), R=150; rotated/concave 100-edge boundary; and near-limit rejection. Report p50/p95/max, counts and error bounds separately for derivation, validation, save, reload and backup of five immutable revisions. Retain the inherited <=100 ms derivation goal on the declared representative workloads; measure browser gesture latency separately. If full-quality preview misses that goal, return to review with evidence for smaller workload limits or another bounded execution strategy. Do not silently reduce accuracy, truncate geometry or add workers/storage infrastructure. Serialized backup stays <=10*1024*1024 JavaScript code units, <=100 boards, with actual browser quota failure handled atomically.

## 7. State, identity, cache and compatibility

Current source checks exact weave fields, schema 4 and weave-study-v1, and recomputes identity snapshots during validation. Adding an unversioned field property would violate that contract. Propose workspace schema 5 and explicit dispatch that retains the old v1 validator/deriver unchanged.

An active v2 weave retains existing studyId, sourceName, sourceContext, originLineage and derived, adding:

```text
weaveVersion: 'weave-study-v2'
generation: {
  version: 'single-attractor-v1',
  tension: 0,                    // percentage, global to this one-field generation
  attractor: null | {
    id, kind: 'attractor', center: {x,y}, radius, strength, enabled,
    falloffVersion: 'smooth-local-v1'
  }
}
```

Use `derived-attractor-v1` and `bounded-polyline-v1` version identifiers alongside `polygon-polyline-v1`; the field-disabled/zero/max-tension route records its `derived-identity-v1` geometry path explicitly. No placeholders for multiple influences or manual operations. Adding the first attractor promotes only the working weave to v2. Removing it leaves a v2 generation with attractor=null; restoring an old v1 revision restores that exact v1 working snapshot. Ordinary new identity studies remain v1 until an attractor is added. A mixed v1/v2 revision chain is valid; each revision envelope's weaveVersion must agree with its snapshot/validator. Saved old payloads and fingerprints do not change on workspace migration.

Preserve the source board/revision snapshot and axis/k identities. Field identity is stable through edits, undo, save and restore; it is board-scoped on backup forks, like revision IDs. Rebase all composite references and provenance hashes using the existing validated board map, retaining immutable origin lineage. A location is resolved using enclosing sourceContext plus strandId, primitiveId='axis', signed t and parameterization version. Each segment retains its t range and error bounds; fragment/sample ordinals are not durable identities. Density-deselected and outside strands are inactive, not deleted.

Hashes use the existing versioned sorted canonical serialization/SHA-256 rules. The v2 content hash includes current boundary/recipe, generation settings excluding field UUID, evaluator/approximation/clip versions, numeric policy and complete output; provenance includes board/revision/study/field identity context. View, labels and timing do not enter geometry content. Disabled/zero settings can have different input hashes while producing exactly equal identity coordinates; tests must not demand equality to the entire v1 fingerprint payload. Do not infer a current crossing solely from a stable source ID. Conservative invalidation: source/field edits invalidate the derived working result and any later consuming stages; view-only changes do not. No later-stage placeholders are implemented now.

Before the first schema-5 write preserve exact original schema-4 raw JSON in a write-once schema4-original recovery key. Continue schema2/3 originals, previous-value recovery, canonical storage key, text-conflict protection and backup wrapper weave-foundation/version 1. Validate old formats under their own rules before normalization; unsupported/future versions fail without stripping data. Existing older clients will reject schema 5: compatibility means new code reads old backups and preserves old revisions, not that old deployed Phase 2A can open R1B backups. Do not touch its browser store or site during local verification. Preserve full new geometry/settings through reload, export/import and fork-of-fork. Recovery-write, quota, validation and size failures leave canonical state and libraries intact.

Update existing raw derived SVG to dispatch by version and serialize stored complete clipped fragments and full metadata irrespective of visibility. Retain open M/L paths, round-trip numbers, Y negation and escaping; no new synthesis/receiver/radius behavior. Validation/import uses supported versioned recomputation, not trust in supplied fingerprints. Future algorithm changes require a new version; never reinterpret an old saved certificate under changed tolerances.

## 8. Gesture transactions

At pointer/input start capture the committed working state. Coalesce pending input to the newest request once per animation frame; derive at most one full-quality preview at a time. Cache by complete canonical geometry-affecting inputs/versions, never viewport; any reused result must match the exact candidate state. Preserve separate original-source rendering cache.

On pointer release or numeric commit, derive/validate the final candidate if no exact complete preview is available, preflight persistence, then commit inputs/geometry/history together as one working undo step. Escape/pointer cancellation restores the pre-gesture display with no save/history entry. A final precision/budget/storage failure cancels the transaction, restores controls and geometry, and reports the reason; do not commit the last successful intermediate value as if it were the user's final choice. Preview pending/error is transient, not an invalid persisted working document. Disable, remove and restore are also single transactions. Saves remain append-only; Undo does not remove saved revisions.

## 9. Fixtures and automated checks (required, not yet run)

Positive fixtures:

1. **Off-axis midpoint:** C=(0,0), R=100, S=50, H=0, source P(t)=(t,50), long endpoints at t=+-250. Endpoints are unchanged; Q(0)=(0,41.5625). This catches endpoint-only evaluation. At H=50, Q(0)=(0,45.25390625). Independently assert both formula values.
2. **Tension shape:** compare radial distances R/4 and 3R/4 at H=0 and H=50. After matching displacement amplitude at one radius by changing strength, the other must differ. Assert H=100 is exact identity. This tests distinct behavior rather than merely monotone sliders.
3. **Incoming source:** square [-250,250]^2, B spacing=20/offset=0, angle=0, C=(240,0), R=100, S=100, H=0. Source B k=-13 is x=260 and absent from the original clip; Q at y=0 has x=245.844224, inside. It must be enumerated and clipped. Also test a boundary-external center and tangential domain expansion.
4. **Rotation and concavity:** rotate/translate the entire carrier, polygon and attractor together and compare transformed geometry within declared numerical bounds; vary carrier rotation alone with C fixed to prove document-space placement. Use the accepted U polygon with the field near its notch; no outside gap may be bridged. Retain boundary contact provenance and ordered t.
5. **Persistence:** v1 study -> add/edit v2 -> two saves -> restore each -> undo -> reload -> isolated backup import -> conflicting-ID fork -> fork-of-fork. Compare old snapshot payloads unchanged and every new source/field reference resolvable. Hidden derived SVG must match complete saved geometry.

Negative and boundary fixtures:

- Absent/disabled/zero/max-tension identity, center point, exactly on/outside support circle, wholly outside field, empty density selection and valid empty result.
- Values just either side of the support and boundary tolerance; tangency, edge-collinear runs, shared vertices, short omitted intervals and near-tangent continuous-versus-polyline disagreement. Expected diagnostics must acknowledge the scope of accuracy, not assert unsupported topology.
- NaN/infinity/negative or zero radius, invalid strength/tension, excessive coordinates, unknown version/keys, altered recipe/snapshot/hash/error declaration, unsafe k indices and malformed provenance.
- Each work cap exactly at/below/above where constructible, depth exhaustion, numerical enclosure failure, large translations/tiny radii and epsilon<16*tau. Fail atomically before oversize allocation; retained geometry/history/library equal pre-action state.
- Recovery key write failure, canonical write failure/quota, concurrent tab bytes, oversized aggregate backup, interrupted gesture and failing final pointer-up after a valid preview.

Automate analytic bound review with independently authored evaluator/reference checks: interval primitive tests against exact rational arithmetic for binary64 inputs; signed-zero/subnormal/overflow and nextUp/nextDown edge cases; subdivision proofs/assertions for every accepted segment; independent high-precision or rational polynomial reference evaluations over deterministic stress cases. Dense sampling may catch mistakes but cannot certify between-sample error. Circle/support classification and candidate range tests must independently check completeness. Clip segment intersections with independent fixture oracles and strict interior checks, not snapshots generated by the function under test.

Retain all 43 R1A/foundation tests and nine R1A browser scenarios, updating only justified latest-schema expectations. Add coalescing/one-undo/cancel tests, zero derivations for display toggles, exact save restore, five-revision timings, mobile/themes, clean console, static/private-output checks and complete raw SVG round-trip. Report source/build identity with actual results. No R1B pass exists yet.

## 10. Five simple visual acceptance tests

Run locally after authorized implementation; run on the private site only after separately approved publication. These steps require no tolerance calculations or exhaustive rejection testing.

1. **Local pull:** create the default 500-square carrier and identity weave. Add the default attractor (center 0,0; radius 150; strength 50; tension 0). Nearby off-center lines bend inward; distant portions stay straight. Hide/show Source and Derived to compare.
2. **Place and resize:** drag the attractor toward the right edge, then enlarge and shrink its radius. The affected area follows the center/ring. Undo once after each completed drag restores that whole gesture.
3. **Strength, tension and disable:** increase Strength and observe a stronger pull. Increase Tension and observe reduced bending; at 100 the working carrier is straight. Return tension to 0, disable the attractor and re-enable it: straight geometry then the previous bend return.
4. **Concave boundary:** use the existing U-shaped boundary and move the attractor near its notch. Curved paths stop at the boundary and remain separate across the notch; no line connects across the empty gap. Rotate the carrier and confirm clipping updates while the attractor stays in place.
5. **Save and return:** save two differently positioned attractor revisions, reload and restore each. Each recovers its center, radius, strength, tension and geometry. Download a JSON backup and import it into an isolated test workspace; both revisions must remain available and match.

## 11. Review recommendation and handoff point

Recommend the bounded smooth radial pull, fixed falloff and profile-changing tension above. The material design decisions are: one shared A/B transformation preserving full-plane crossing structure; fixed compact support; and tension as geometric resistance/profile control rather than physical simulation. These are recommendations awaiting review, not changes already approved by the R0/R1A authorization. No user-supplied tolerance is needed.

Engineering evidence still required during implementation: correctness of outward enclosures and clipping predicates, representative workload cost, five-revision storage/browser latency, visible usefulness of the tension profile and radius defaults, and cross-browser deterministic serialization. Failure that changes visible behavior, error policy or workload scope returns to architecture review; it is not permission to improvise an algorithm under the old version.

The exact Sol Medium checkpoint is **after this equation, behavior, accuracy scope, schema/identity rules, limits, fixtures and bounded scope are approved and recorded as settled, and the user explicitly authorizes R1B implementation**. At that point the batch follows specified decisions, although certified numerical implementation remains technically demanding. Sol should implement the stated contracts and tests; a failed bound or insufficient performance requiring a new strategy reopens architectural reasoning. Today the proposal is awaiting review; do not treat checklist presence as implementation authorization. Publication is a separate gate, and R1C/R1D/R2 remain outside R1B.
