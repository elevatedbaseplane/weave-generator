# R0 review — engineering resolutions and approval recommendation

Approval update — 2026-09-16: user approved the revised contracts as applicable to R1A and authorized exact R1A implementation and local verification. These R1A decisions are settled. Later R1B and R2 gates remain deferred; publication is forbidden. Earlier draft/approval-pending wording below is historical. Current implementation/verification status is in document 19.

2026-09-16. Planning review completed; no implementation/publication authorized. This record clarifies and governs the revised R0A–R0C drafts (15–17) where earlier text is provisional.

## Evidence and limits

Read AGENTS.md, master 00, plan/checklists 12–14, state 02, handoff 04, accepted carrier contract 07 and evidence 08. Inspected current document/storage/history/carrier/exchange modules and Tangent import/export source. Rebuild HEAD is 2120620b8a5e2b45af920846753a0744eba4b671. Comparing dist/ and tests/ to accepted 002ae94dacade531deb6c88a1414fbe6367b8356 showed no differences. Pre-existing documentation edits remain uncommitted and preserved.

Tangent local checkout is clean at a6cc3c2826b4e55f311b6a9e06b7d94c2ffe02a6. Its source supports SVG/DXF and a DWG decoding path, largest-polygon selection and no Weave companion ingestion. No network refresh, receiver experiment or live site verification occurred. Existing Phase 2A acceptance and benchmark evidence is retained, not rerun.

## Findings and corrections

| Finding | Resolution and reason |
| --- | --- |
| Three-point sampling was described as a bounded approximation | Withdraw the guarantee and universal subdivision caps. Between-sample excursions are unconstrained. R1A copies exact accepted linework; R1B needs an evaluator-specific conservative bound. |
| Small positional error implied stable crossing classifications | Separate committed-polyline facts from continuous-curve uncertainty. Near tangency/overlap requires future explicit ambiguous cases. |
| Evaluation margin expanded only along t | R1B must also expand candidate k normal range and preflight counts; current clipped paths omit potentially incoming strands. |
| Finite-support rule prematurely restricted future fields | Require bounded evaluability/displacement for the supported domain; compact support is optional. Combined-field bounds belong to R1D. |
| Splitting a segment reused its ID with new normalized u | Replace affected IDs or record an explicit parameter map. Unchanged IDs cannot silently change material reference meaning. |
| SourceLocation omitted saved revision context | Require exact source board/revision context and snapshot; distinguish stable material reference from stale geometric event. |
| Partial reclipping silently shortened locks | Withdraw; recommend any lost locked geometry be a conflict, confirmed at R2C. |
| Edit taper/order and world target were invented without workflow evidence | Defer visible edit behavior to R2D. Recommend explicit offsets after fields, with a comparison against fixed world targets. |
| Local invalidation was too narrow for collective analysis | Invalidate the consuming stage unless a narrower dependency support is proven complete. |
| R1A omitted required basic SVG export | Restore raw derived open-strand SVG per checklist 14. Tangent closed synthesis remains later. |
| Backup size called MiB | Current code checks JavaScript string length, not byte size. Preserve threshold, add actual serialized-output preflight, retain quota handling. |
| Forking a board only changed its ID | New persisted composite IDs/source links require validated rebase plus immutable origin lineage. |
| Kernel performance was treated as UI responsiveness | Keep existing benchmark goal; measure storage and UI separately. Withdraw invented 50 ms promise. |
| R0 was made contingent on all later behavior | Freeze exact R1A engineering; leave nonlinear/manual/receiver gates at their real dependencies. |

Actual carrier source does not fully implement every diagnostic described in accepted docs/07: omitted short-interval counts and comprehensive precision-ambiguity reporting are absent; its implemented parallel test uses 64*EPSILON*max(1,edgeLength) on a cross product rather than an entirely normalized threshold. Preserve accepted polygon-line-v1 output. Future improved diagnostics/kernel changes require their own version/scope and cannot be claimed already delivered. Current candidate-line limit is checked after building specs; preflight in the R1A entry path before calling that kernel prevents oversized allocations without rewriting accepted output.

## R1A geometry and identity — resolved

Versions: strand-source-v1, rect-distance-v1, derived-identity-v1, weave-study-v1; workspace schema 4. Preserve rect-v1, polygon-line-v1, density-v1.

Q(t)=P(t). Take only density-selected accepted paths, ordered A/B, k and t. Store analytical origin/unit direction and the finite min/max boundary projection on t; store separate clipped fragments with original endpoints, t and provenance. Retain full source recipe so no finite snapshot pretends the generated source has ceased to be infinite. R1A adds no subdivision.

Every SourceLocation resolves with sourceBoardId, sourceCarrierRevisionId, strandId, primitiveId, parameterizationVersion, parameterKind and parameter, either inline or via an explicit enclosing sourceContext. Generated primitiveId is axis and parameter is signed t. Old boundary-edge ordinals retain their exact boundary snapshot. Manual u semantics are reserved for the later primitive version.

Use a separate content fingerprint and provenance context: existing carrier fingerprint remains unchanged; new derived content uses SHA-256 over versioned canonical sorted-key serialization of geometry-affecting inputs, versions and geometry. IDs/provenance are validated independently; labels/view state do not change geometric content. Hash equality is not identity or trust. Same-input determinism applies to geometry/fingerprints, not UUIDs/timestamps of newly saved revisions.

A source t remains resolvable on an analytical line when clipped out or density-deselected. It is inactive for analysis, not deleted. A previously derived event must nevertheless recompute. Cross-revision working mappings cannot mutate saved references or claim an old crossing still exists solely because k survives.

## R1A lifecycle — resolved

- Create Weave Study requires an explicitly selected immutable saved Carrier Study revision. Unsaved carrier edits must be saved first by the user; no implicit save or latest-pointer substitution.
- Creation gives the working weave a distinct studyId and exact original source snapshot/context. It restores that selected source's boundary/recipe into working state as one transaction.
- Ordinary working boundary/carrier edits while a weave is active recompute its identity output atomically. They leave the original source revision fixed and mark current inputs modified. Saving another Carrier Study does not silently reparent the weave.
- Restore Carrier Study clears active working weave in the same undo transaction; saved Weave libraries remain. Restore Boundary preserves active weave and recomputes; Save Boundary preserves weave state.
- Save Weave Study captures original source context, current boundary/recipe and ancestry, versions, complete geometry and diagnostics. Same name appends only for that studyId; a different studyId needs another name. Existing boundary/carrier naming behavior is unchanged.
- Restore Weave revision restores working boundary/recipe/source context/result atomically. Undo/Redo act only on working state, preserving append-only libraries and current 100-step history.
- No current output is presented as complete after new inputs commit unless its derivation succeeded. Failed persistence/derivation leaves inputs, output, libraries and undo position intact.
- Empty selected output is a valid complete study. Exports contain empty A/B groups and zero-count metadata using boundary bounds for viewBox.

This is sufficient to implement R1A without deciding fields, manual locks or synthesis.

## Schema/storage/fork compatibility — resolved

Add null working weave and empty Weave Study library when normalizing schema 2/3; do not create revisions or populate future edit/field arrays. Preserve backup wrapper format weave-foundation/version 1 and canonical storage key weave-foundation-workspace-v2.

Before first schema-4 write, preserve exact original schema-3 raw JSON in immutable schema3-original recovery; a direct schema-2 upgrade preserves schema2-original. Recovery failure aborts the canonical write. Preserve previous-value backup, quota handling and byte-conflict checks. Old running tabs reject changed bytes; old reloaded clients reject schema 4. Do not create independently writable canonical workspaces.

Validate new fields and reject unsupported semantic/schema/algorithm versions rather than strip or reinterpret them. Existing source fields and metadata survive normalization. R1A validates snapshots against identity derivation, including finite coordinates, source/context consistency, ordering, completeness and fingerprints.

Preserve the existing text.length <= 10*1024*1024 import threshold and 100-board bound. Before a new revision/import is persisted, serialize its export envelope and verify it can be read back within that limit. A browser quota may be smaller; a size check cannot promise persistence.

Import exact duplicates without forking. For a changed same-ID board, construct an explicit old/new board mapping; rebase all local composite strand identities, source contexts, fragment identities and provenance fingerprints consistently, while retaining original source IDs in a separate immutable origin-lineage record. Revision IDs remain board-scoped. Validate the complete fork before merge; include a fork-of-fork case. Never mutate the exporting board's saved snapshots. Full source snapshot validation remains required after rebasing.

Future unresolved/stale authored records must be saved in working recovery and JSON backups even when complete-output save/export is unavailable. This avoids making “incomplete” synonymous with “cannot recover work.”

## Minimal future receiver example

One asymmetric closed path is sufficient for format preflight; it is not a preferred synthesis:
SVG path: M 0 0 L 120 0 L 20 -80 Z; viewBox -10 -90 140 100.
Companion planning instance:
{
  "version": "weave-tangent-v1",
  "geometryFile": "asymmetric.svg",
  "coordinates": {"units": "document-units", "yAxis": "up", "svgTransform": "negate-y"},
  "source": {"boardId": "fixture-board", "revisionId": "fixture-revision"},
  "shapeId": "fixture-shape",
  "closed": true,
  "vertices": [
    {"id": "v1", "point": [0,0], "sourceReferences": [{"kind":"authored","id":"p1"}]},
    {"id": "v2", "point": [120,0], "sourceReferences": [{"kind":"authored","id":"p2"}]},
    {"id": "v3", "point": [20,80], "sourceReferences": [{"kind":"authored","id":"p3"}]}
  ]
}

Final package adds exact SVG-byte SHA-256, canonical ordered geometry hash, serialization version and complete provenance records. No computed digest or round-trip pass is asserted here. Negating Y reverses winding without reversing vertex order; future signed-corner/radius interpretation must account for that. Tangent's own regenerated IDs/order require checking full import, not parseSvgText alone. Keep R1A open-strand exports and later closed-synthesis exports distinct.

## Later design choices and approval recommendation

Recommend approval of shared representation/identity/persistence rules and the exact four-part R1A scope in document 17. Routine choices above are engineering resolutions for that proposal, not additional user questionnaires.

Material behavior choices to confirm with examples only before the relevant batch:
- R2C: lock committed visible geometry strictly versus permit boundary reclip. Recommend strict preservation with conflict for any removal.
- R2D: persistent displacement offsets versus fixed world-space targets and edit support/composition. Recommend offset-after-fields as the initial behavior; no taper formula yet.
- R1B: visible attractor response and tension/falloff controls after an evaluator with defensible bounds is proposed. The engineer supplies numerical defaults and evidence.
- R1D and R3 onward: composition, directional analysis reference, detector thresholds and relational priorities at their own gates.

No design choice outstanding blocks exact R1A. On recorded approval of this package/scope, R1A follows established decisions and is suitable for Sol Medium, with explicit implementation authorization still required. R1B needs architectural reasoning before its next proposal. Publication remains separately authorized.

Verification in this review is read-only source comparison and document consistency only; no application tests, executable experiments, live checks or deployment.
