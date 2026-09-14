# Phase 2A carrier architecture — approved contract

Status: Phase 2A contract approved as proposed by the user; decisions settled. Implementation is explicitly on hold and publication is not authorized. Phase 1B version 2 (build WF-1B-20260914, source e2bb9f844207a403b2fe7e52bbc7c9c1b69a018d) is user-accepted. No Phase 2 application code, tests, migration or deployment is authorized by this document.

## Scope and sequence

Approved Phase 2A scope: rectangular straight carriers with explicit A/B families, analytical boundary clipping, spacing/rotation/offset/density controls, separate visibility, immutable saved carrier studies, undo, reload and JSON backup. This completes the first usable carrier batch, not the entire Phase 2 roadmap.

Later Phase 2 batches retain triangular/radial modes, independent family directions, seeded irregularity and regenerate. Tension/smoothness become active controls only with a defined deformation operation. Fields, stitches, interactions, cells/interstices and their exports remain subsequent layers. Boundary-only SVG/DXF exports keep their current meaning; carrier interchange is a separate future batch.

Current source evidence: working state contains boundary plus boundary ancestry; History snapshots working state; saved boundary revisions are append-only. The retained lattice module has a fixed display center/span, outputs SVG strings and treats clipping as rendering. It is a reference, not a suitable authoritative carrier kernel.

## 1. Authored data and derivation

Use workspace schema 3 because older schema-2 clients can accept and later discard new fields. Preserve existing board IDs, boundaries, source metadata, revision IDs and ancestry. Add:

- working.carrier: null until explicitly created; otherwise {id, kind: rectangular, generatorVersion: rect-v1, clipVersion: polygon-line-v1, selectionVersion: density-v1, origin: {x:0,y:0}, angleDegrees:0, families:{A:{spacing:50,offset:0,density:100},B:{spacing:50,offset:0,density:100}}}.
- working.carrierSourceRevisionId: null or a saved carrier-study revision ID, independent of the existing boundary sourceRevisionId.
- board.carrierStudies: named append-only entries with latestRevisionId and revisions. Each revision stores its own ID, parent revision, timestamp, complete boundary snapshot (including metadata), boundary ancestry, carrier settings and derivation versions.
- View state: source-lattice visibility, A visibility and B visibility. These switches never remove source paths from the analytical model. All new layers initially off; creating a carrier does not reveal unrelated layers.

Carrier output is derived: {inputFingerprint, versions, paths, diagnostics, complete:true}. Each path records family, integer lattice index, analytic origin/direction, and clipped intervals. Persist authored inputs and immutable study snapshots; do not persist duplicated render paths or caches. Canonically serialize only geometry-affecting inputs to fingerprint them; exclude labels, metadata filename, theme and camera. Retain versioned generators needed to restore saved studies. Unsupported future versions must fail explicitly, never silently regenerate with a different algorithm.

Implementation modules: carrier generation, polygon clipping and study validation/operations, integrated with existing document/history/storage modules. No new backend or runtime package is required by this proposal.

## 2. Rectangular geometry and identity

At angle theta, A direction u=(cos(theta),sin(theta)); B direction v=(-sin(theta),cos(theta)). Family normals are nA=v and nB=-u. A and B remain perpendicular in 2A. Family F line k is:
P(t)=origin + nF*(k*spacingF + offsetF) + directionF*t.
t is signed document distance along the uncut source line, independent of clipping, viewport and sampling.

Enumerate integer k from the boundary's min/max projection onto the family normal; no fixed world span and no camera-derived extent. Sort A then B, k ascending, intervals by t. Keep offsets as signed document distances without modulo-wrapping or renumbering k. Accept angles in [-180,180] without hidden wrapping. Changing either transforms the same logical indexed sources.

Path key is (boardId, carrierId, familyId, k). Family assignment never comes from array parity. Changing density, boundary, clipping, visibility or camera does not renumber retained source lines. Spacing and rotation preserve logical k identity but change its geometry; they invalidate downstream derivations. Reset creates a new carrierId only through an explicit future reset operation, not on ordinary edits.

A fragment's key includes inputFingerprint, path key and sorted interval index. It is revision-local, not a stable anchor across boundary topology changes. Endpoint provenance records boundary edge index/vertex contact and t, scoped to the boundary geometry fingerprint. Later references use a saved source revision + path key + source parameter, not bare fragment index or rounded coordinates. If a boundary edit splits a line or removes an event, descendants become stale/unresolved; no nearest-point reassignment is permitted implicitly.

## 3. Density contract

Spacing controls the full lattice; density selects a repeatable subset. 100 retains all candidate paths intersecting the boundary. Density is integer 1–100 per family. Approved density-v1 rule: r=((37*((k%100+100)%100))%100); retain k when r<density. It retains exactly d slots per 100 consecutive indices, is nested as density increases, is deterministic for negative indices, and needs no seed.

On small boundaries the displayed fraction can differ from d percent and can be zero. Show retained/available source counts; do not force one path or change spacing to match a target count. Explain density as percent of lattice slots over the repeating selection pattern. This deliberately regular pattern is not seeded irregularity. A future seeded selector gets its own version and controls.

## 4. Boundary clipping contract

Use analytic line/polygon intersection on the complete valid closed polygon, then sort and deduplicate cut parameters and classify each open interval by its midpoint. Include strictly interior intervals; retain separate intervals across concave gaps. A U-shaped polygon cut through both arms must produce two fragments, never a bridge across the notch.

- Tangency or isolated vertex contact produces no positive-length carrier fragment.
- Collinear boundary overlap is classified as boundary contact and excluded from interior carrier geometry; retain diagnostic contact provenance for future edge work.
- Shared-vertex hits are deduplicated; reversal of polygon winding must not alter the geometric interval set.
- No SVG mask defines the model. Rendering, future analysis and future exports consume the same complete clipped geometry.
- Do calculations in a boundary-centered local frame to reduce cancellation, then return document coordinates. Keep the existing boundary validator unchanged.
- Approved clipping length tolerance tau=max(1e-8,64*Number.EPSILON*max(1,maxAbsCoordinate,boundaryExtent)). Use normalized signed distances for on-line tests and a separate dimensionless angular threshold of 64*Number.EPSILON for parallelism. Do not compare areas to a length epsilon.
- Merge cuts only within tau; omit intervals of length <=tau and report their count. Ambiguous geometry near the threshold yields an explicit precision diagnostic, not silently fabricated fragments. tau and all numerical choices belong to clipVersion.
- Reject carrier generation if spacing <=100*tau or if numeric/index limits are exceeded. Existing boundary data still opens, saves and exports. Such rejection concerns carrier derivation only.

Initial bounded workload: max 2,000 candidate source lines total before density selection, 20,000 clipped intervals, and 2,000,000 line/edge tests. Preflight candidate/edge work; enforce interval bound during derivation. Reject a proposed edit before persistence if limits fail; keep previous working state and undo stacks unchanged. These are approved protective limits, not measured speed promises. Profile representative cases during implementation; do not silently enlarge limits or truncate analysis.

## 5. Controls and editing

One collapsed Carrier section: Create Rectangular Carrier, separate A/B spacing, shared rotation, A/B normal offsets, A/B density 1–100, and retained/available counts. Default spacing 50 yields 9 interior paths per family on the centered 500 square; two edge-coincident paths per family are excluded as contacts. A begins horizontal, B vertical.

Source-lattice visibility shows the clipped full-density construction lines; A/B visibility show selected carrier families. Grid/frame and boundary retain their independent switches. All visibility is view-only and cannot trigger geometry generation. Camera Fit stays an explicit action, never repositions the lattice origin.

Numeric inputs and sliders share values. One completed slider gesture is one undo action. During a gesture, coalesce visual previews with animation frames; commit only a valid final result. Cancel returns to the prior state. Preview calculations do not enter persistence or future analysis as committed results. Failure leaves the last complete model intact with a clear message. No workers until measurement justifies them.

## 6. Saving, boundary edits and migration

Save Boundary remains boundary-only and must preserve any working carrier settings rather than replacing the entire working object. Restoring/importing/drawing/editing a boundary preserves the working carrier recipe and reclips it in the same document transaction. Carrier source ancestry remains its starting saved study; changed status compares the complete boundary/settings snapshot. Carrier failure rejects that whole edit without partial persistence. With carrier null, preserve Phase 1 behavior.

Save Carrier Study captures boundary + recipe + ancestry, without requiring a boundary save first. Same name appends an immutable revision. Restore Carrier Study restores boundary and carrier atomically, leaves both saved libraries intact, and is one undo action. Save itself does not become a destructive history operation. Working undo/redo must include both ancestry fields and both authored inputs. Saved studies are never replaced by a later boundary revision's latest pointer.

Normalize schema 2 to schema 3 in memory: add null carrier, null carrier ancestry and empty study libraries. Before the first schema-3 write, preserve exact pre-migration raw JSON under a dedicated immutable recovery key; abort on backup or storage failure. Keep the current canonical workspace key despite its historical v2 name: an old tab then sees changed bytes and refuses a stale write, and an old reloaded client rejects schema 3. Do not create two independently writable canonical workspaces.

Schema-2 and schema-3 backup import are accepted by the new reader; export schema 3. Validate version before normalizing. Exact-copy deduplication operates after normalization; changed boards fork as today. Board-scoped composite identities avoid cross-board aliasing on fork. Preserve boundary/library data byte-equivalent in meaning. Existing 10 MB/100-board and quota/conflict safeguards remain. Never migrate original Weave browser data.

## 7. Contracts for later layers

Later deformation consumes the uncut source definition and source parameter, then reclips the deformed result; clipping must not erase the source necessary to evaluate fields beyond today's boundary. Straight-carrier generation does not implement fields or promise the future curve algorithm.

Interaction records will need source revision/fingerprint, A/B path keys, source parameters, event type and separate connectivity/precedence. A geometric crossing alone is not a bind. Parameter changes invalidate descendant caches atomically; old saved outputs retain their original revision.

Interstice analysis will consume a complete planar arrangement of clipped/derived edges plus the enclosing boundary. Concave fragments, boundary endpoints and collinear contact diagnostics are provided now; region graph, snapping policy across multiple carriers, cell adjacency, over/under connectivity and spatial classification are later contracts. No polygon regions or stitch events are manufactured in 2A.

## 8. Approved automated verification and release gate

Retain all accepted Phase 1 regression evidence; run affected regression tests during implementation. New automated coverage must include:

- Exact 500-square counts/endpoints; rotated and translated families; negative indices; independent spacing/offset/density; monotone density subsets and deterministic repeat.
- Independently specified U-shaped interval oracle, convex/concave boundaries, winding reversal, tangency, shared vertices, collinear edges, tiny intervals and extreme/near-tolerance cases. Verify actual model intervals, not screenshots or a mask.
- Stable path keys under density/camera/boundary edits; fragment fingerprint scoping; no stale result re-use after input changes.
- Save two study revisions, change boundary, restore each exact snapshot; undo/redo including ancestry; old schema-2 boundary library preservation; cross-browser JSON round-trip and ID fork behavior.
- Migration backup failure, corrupt input, unsupported versions, quota failure, concurrent old/new tabs, limits and cancellation never overwrite committed work.
- View toggles perform zero derivations and preserve geometry; local browser controls match model; repeated changes do not accumulate paths/listeners.
- Performance report for sparse and dense square/concave fixtures: candidate/fragment counts, line-edge work, committed calculation time and gesture responsiveness on this host. Approved verification goal: p95 committed derivation <=100 ms for 400 candidate lines and 100 edges over 30 warm runs. Failure requires a bounded optimization or a return to architecture for a changed limit/worker plan, not hiding analytical paths.

All planned tests above remain unimplemented and unrun in this proposal. Local verification must precede any separately approved publication, followed by live version/build/access checks.

## 9. Five simple live acceptance tests (after an approved release)

1. Create the default carrier on the 500 square and show A/B. Expect 9 horizontal and 9 vertical interior lines; change spacing or rotation and see a corresponding change.
2. Use the supplied concave sample. Lines stop at its boundary and remain separated across the notch, with no connecting line through empty space.
3. Lower A density, then restore 100. B stays unchanged and the complete A family returns. Hide/show layers and resize; geometry stays in place.
4. Save a carrier study, change its boundary/settings and save another revision. Restore each, then Undo/Redo; the matching boundary and carrier return together.
5. Reload and transfer a JSON backup to another owner-authenticated browser. The saved studies and current carrier return unchanged.

All exhaustive rejection, precision and migration tests stay automated unless the user asks otherwise.

## 10. Approval and model checkpoint

The user approved this Phase 2A contract as proposed and requested that these decisions be recorded as settled. Approval covers the rectangular A/B model, identities, clipping, controls, immutable studies, migration/backup compatibility, automated verification and five live tests. Shared rotation and perpendicular families remain as specified; independent family directions remain deferred. The user explicitly instructed: do not begin implementation yet.

Sol Medium checkpoint: REACHED. The approved contracts and verification expectations are recorded, with no outstanding architectural decision blocking bounded Phase 2A. The user should switch to Sol Medium now, before the first implementation edit. Switching models does not authorize starting work: wait for the user to explicitly lift the implementation hold. Once started, Phase 2A implementation follows established decisions; substantial architectural reasoning is not required unless new evidence contradicts the contract.

A model change is user-controlled; no automatic task transfer or setting change is performed. If verification contradicts a contract, or requires new numerical topology, workers, revised persistence, or changed scope, pause that decision and return to Astra architectural reasoning. Triangular/radial semantics are not silently delegated to routine implementation.

Contract approval is recorded separately from permission to start: implementation remains on hold and publication is not authorized. For each future batch first present scope, delivered behavior, what remains, automated verification and 3–5 simple live tests. Record implementation and publication authorization explicitly; no further release is authorized at present.
