# Stitch-based weave delivery reconciliation and crossing contract

2026-09-17. Planning completed in response to “do it” following the proposed plan reconciliation. Production build remains WF-SP1-GRID-PRESETS-20260917; no application changes or publication in this review. User's intended direction is recognizable researched stitch constructions, not further generic grid additions.

## Reconciled delivery order

1. Complete SP1 prerequisite repair: default-interaction timing, finite-source numerical/new-format integrity checks already recorded in66–69, exact source-anchor access, explicit construction-intent templates. R1 stays development-complete with deferred full host certification. Do not revive R1 harness blockers.
2. R2A: complete crossing analysis on the declared certified polyline, with diagnostic layer and stable source references. This is the next feature batch after SP1 prerequisites pass.
3. R2B: resolve the verified Herringbone Square cyclic intent and Double Herringbone within-band alternating intent to unique events; render local underpasses separately from authoritative geometry. Continuous-field cross-row events remain neutral/unresolved until an explicit field-wide rule is justified; do not claim traditional construction from arbitrary alternation.
4. SP2: interval-certified curved lacing, then the researched stitch recipes in document56 according to their prerequisite/reference gates. Do not promise all named stitches from straight grids.

This updates the active priorities in12–14; it does not weaken the numerical, storage or performance gates of57–60. “Keep working” authorizes bounded continuation but does not justify claiming SP1 complete or bypassing an actual unresolved geometry/data-integrity dependency.

## Actual-source findings

Read-only audit of preserved field-reload.json found278 fragments;69 have interior vertices, totaling1547 interior vertices. A representative fragment has5 points but only u0/u1. Adaptive segments cannot recover their source parameters by evenly distributing that endpoint interval, by segment index, or by arc length. Source code currently drops the intermediate clipped segment parameters when merging fragments. See evidence/sp1/crossing-readiness-audit.json.

The source construction record contains an intent identifier string and backside sequencing, not the explicit run-pair source brackets promised by57. Continuous-field metadata already states that its cross-row intent is unresolved. Thus automatic historical over/under matching is not implementation-ready. No new user numerical tolerance is requested; these are engineering obligations.

## Recommended bounded SP1 anchor repair

Add an optional analysis-only trace collector to deterministic derivation. For every output polyline segment capture the already computed clipped source parameter endpoints with its run identity and fragment association, before fragment merging discards them. Do not change coordinate operations, certificates, clipping, existing fingerprints or compact bytes.

Trace is a transient cache keyed by complete source/generation/algorithm and derived provenance fingerprints. It is not silently appended to v3 persisted payloads. Reopening an older saved revision reconstructs trace from its embedded recipe and generation in a worker, checks exact geometry/certificates against that revision, and only then exposes anchors. Failure leaves the saved drawing untouched and analysis unavailable with a reason. A newly derived result can produce trace in the same pass. No second full derivation on every edit.

This avoids assuming the remaining 10MiB backup headroom can accommodate a parameter per vertex. Measure worker/main-thread memory and transfer cost; preserve the established gates. Future persistence of traces would require a separately versioned capacity proof. Tests must prove unchanged canonical text, fingerprints and compact buffers for all supported source versions, plus exact trace continuity, clipped endpoints, adaptive interior parameters, concave fragment gaps and failure behavior. Do not implement R2A against inferred source parameters.

Embed bounded declarative run-pair intent templates in a new explicit construction version. Preserve old records exactly; old identifier-only recipes may use a versioned built-in interpreter for analysis only, with provenance recorded and no silent stored rewrite. Pattern mutation/migration must retain atomic commits and exact backup admission. Freeze positive/negative intent fixtures before releasing that version.

## Exact R2A scope

Input is every segment of every fragment of the complete committed derived representation, including same-role pairs, repeat neighbors and nonadjacent self-pairs. Render visibility never selects analytical input. Do not connect concave-separated fragments. Adjacent segments sharing their own tessellation vertex are not counted as a new crossing; nontrivial self-contact remains diagnostic.

Use conservative segment AABB indexing for candidate generation and robust orientation/collinearity predicates on represented binary64 endpoints. Endpoint/contact classifications do not use epsilon as a fuzzy intersection threshold. Exact represented-polyline topology and smooth deformed-curve topology are distinct: proximity of approximation tubes is an uncertainty diagnostic, never proof of a true smooth crossing. Ill-conditioned intersection coordinates are unresolved with evidence; never fabricated.

Classify transverse crossings, endpoint contacts, collinear overlap intervals, local polyline touches and multi-way meetings. Do not label a polyline touch as certified smooth tangency. Deduplicate tessellation-boundary events using canonical segment incidence and verified source anchors. Retain overlap intervals instead of inventing crossing points. No global spatial rounding or screen-distance clustering.

Event record: analysis version; input provenance fingerprint; type; unordered canonical run pair; bounded source-parameter locations/intervals on both runs; represented intersection coordinate/enclosure; local segment incidence; completeness and uncertainty diagnostics. Event identity is version-specific to the immutable input plus canonical source references. Surviving correspondence across changed geometry is a separate resolved match, never guaranteed from an ordinal or nearest point. Coincident multi-way meetings retain constituent pairs and are unsuitable for automatic binary precedence until resolved.

Worker protocol: latest-request, complete result only, stale input rejection. During pending edits show last committed geometry and label analysis stale; do not attach old marks to new geometry. Cache by provenance fingerprint. Cancel or failure clears the pending analysis and retains the last valid committed drawing. Analysis failure does not discard a valid geometry save. An authoritative geometry/storage failure still rejects its commit.

Workload preflight: retain all existing geometry ceilings. Proposed initial independent analysis ceilings are2,000,000 narrow-phase pair tests and100,000 emitted pair events, with explicit analysis-unavailable failure rather than truncation. These are provisional engineering limits, not a claim of maximum-fixture coverage; benchmark sparse/dense/degenerate fixtures before settling them. If the full approved representative workload cannot complete, optimize indexing or return for review, not silently filter families or crossings. No arbitrary raising of established worker/end-to-end deadlines. There is no measured crossing performance pass yet.

## Minimum complete UI

Add a real collapsible Weave Analysis section after Field Forces with Analyze/Refresh, completeness/status counts, and independent Crossings/Contacts/Overlaps visibility. Select a mark to highlight its two source runs and explain the classification. Display filters never change totals or stored geometry. Reset clears only analysis view selection. Save/reload retains the source document; analyses recompute from exact saved provenance rather than serializing unproven data into backups. Undo/Redo invalidate/rebuild against the restored root. No interactive Over/Under placeholder in R2A.

## Focused automated checks

Known transverse and endpoint intersections; near-parallel disjoint segments; exact overlaps; three-way meeting; same-role and nonadjacent self events; adjacent tessellation joins; concave gaps; rotated/translated inputs; index versus exhaustive oracle on bounded fixtures; canonical pair-order independence; ambiguous smooth topology; exact trace correspondence; stale/cancel/error behavior; save/reload/Undo root binding; full counts despite hidden marks; admission/atomicity for any newly persisted metadata. Only affected system certification is broadened, not unrelated R1 proofs.

## Five visual acceptance tests for R2A

1. Open a saved herringbone field; Weave Analysis → Analyze. Expect visible crossing marks, a completed status and counts.
2. Toggle Crossings off/on. Expect identical weave geometry and unchanged total counts.
3. Select a crossing. Expect its two participating runs highlighted and a classification explanation.
4. Move an attractor. Expect pending/stale analysis followed by refreshed marks at the new geometry; Undo restores the old arrangement.
5. Save/reload a pattern and reanalyze. Expect matching counts/source references. Contacts/overlaps, when present, appear distinctly and never masquerade as ordinary woven crossings.

R2B later adds visible over/under gaps without cutting saved paths. Only uniquely matched authored intent is applied; extra/missing/ambiguous crossings show Modified interlacing. Square's cycle cannot be implemented by one global draw order per strand. Continuous-field row intersections require their own declared design rule; do not pass them off as researched stitch instructions.

## Next action

Implement and verify the bounded SP1 trace/intent prerequisite and timing repair before starting the R2A vertical slice. No product-choice question is necessary at this stage. Return a local review version after the next meaningful implementation update. No new build, external host run or publication was produced by this planning review.
