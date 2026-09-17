# R0B — editing, dependency and revision contract

Approval update — 2026-09-16: user approved the revised contracts as applicable to R1A and authorized exact R1A implementation and local verification. These R1A decisions are settled. Later R1B and R2 gates remain deferred; publication is forbidden. Earlier draft/approval-pending wording below is historical. Current implementation/verification status is in document 19.

Status: **draft for review; planning only**. It assumes the recommended R0A defaults in [15-R0A-SOURCE-GEOMETRY-CONTRACT.md](15-R0A-SOURCE-GEOMETRY-CONTRACT.md); those defaults are not yet settled. No implementation, automated run, browser operation or publication is authorized.

## 1. Editing records

Edits are durable records against source identity. They never overwrite accepted carrier recipes or replace source geometry with sampled screen coordinates.

### Manual source geometry

A manual strand is an ordered chain of straight bounded primitives. It owns a stable strandId; each primitive owns a stable UUID and local u in [0,1]. Moving endpoints preserves material u correspondence but invalidates geometric conditions. Splitting or merging replaces the affected primitive IDs unless an explicit versioned parameter map migrates references. Keeping an old ID on a shortened segment with renormalized u silently relocates references and is prohibited. Unaffected primitive IDs survive.

### Control overrides

**Future design recommendation, to settle at R2D:** a control override is a source-located additive displacement anchor. The earlier draft shape below is provisional, not a schema to implement in R1A:

```text
ControlOverride {
  editId
  sourceLocation
  targetPoint
  editVersion: "piecewise-offset-v1"
}
```

Withdraw the fixed one-spacing taper, targetPoint-minus-changing-source rule and edit-before-field order. These alter visible behavior and need a worked regeneration example before R2D. Recommend storing explicit document-space offsets applied after fields so the authored offset survives regeneration; fixed world-space targets are a separate possible behavior. Interpolation/support and composition remain R2D design decisions. No control-edit schema or inert controls are introduced in R1A.

**Consequences:** users get predictable local reshaping without destructive source replacement, and edits survive display resampling. The first edit surface is piecewise-linear rather than a smooth spline. Later curve support requires a new edit version.

**Evidence needed:** one-anchor and multi-anchor displacement fixtures; exact taper endpoints; folded-source editing; insertion/deletion identity behavior; undo/redo as one transaction; deterministic save/reload; and negative cases for duplicate, missing and out-of-domain source locations.

### Exclusions

**Recommended default:** an exclusion is an enabled durable record keyed by `strandId`. It removes that strand from derived geometry and every downstream analytical stage while retaining the source definition and ancestry. Display visibility is a separate preference and has no analytical effect.

**Consequences:** exclusion is reversible and reproducible; hiding a family cannot accidentally change results. Any exclusion change invalidates crossings, relationships, measures, points, synthesis and exports derived from the prior included set.

**Evidence needed:** exclude/restore across reload; family visibility toggles with identical fingerprints; downstream stale markers after exclusion; and export proof that an excluded strand is absent while its source record remains.

### Locks

**Future design recommendation, to confirm at R2C:** freeze the committed in-boundary strand fragments and their source map at an exact revision. A boundary expansion does not extend locked geometry. Source/field regeneration cannot move it. Keep old clip-fragment ordinals scoped to their snapshot.

Any boundary edit removing part of locked geometry reports a conflict before commit, not only an edit removing the entire strand. The earlier partial-reclip rule silently shortened a lock and is withdrawn. Recommend unlock, explicit exclusion or Cancel to resolve. Confirm this user-visible policy at R2C; it does not block R1A. Source deletion must retain an unresolved lock rather than silently erase it.

**Consequences:** a lock means “keep this geometry,” including through source-regeneration attempts, while boundary integrity remains analytical. Boundary shrink cannot silently erase locked work. Lock snapshots add saved data and must count against backup limits.

**Evidence needed:** field movement with one locked and one unlocked strand; source spacing change; boundary shrink that retains one fragment; concave reclip that produces two fragments; rejected no-fragment shrink; exclusion of a lock; exact undo and JSON recovery.

## 2. Reference failure and conflict behavior

**Recommended default:** a record applies only when the strict R0A identity check succeeds. A missing strand, primitive or incompatible parameterization makes the record `unresolved`. Nearest-coordinate repair is prohibited.

The last accepted immutable study remains renderable from its snapshot. Persist unresolved/stale working intent in browser storage and JSON recovery; block only a complete named output or current geometry export until required references resolve. Separate computation completeness, authored-reference status and saved/working status. Density deselection or clipping outside the boundary makes an existing source inactive, not deleted. A valid source reference does not validate an old crossing. The user can undo, delete an edit or explicitly rebind it with old/new provenance.

**Consequences:** no edit disappears or silently moves to a plausible neighbor. Some source changes require explicit repair before a new complete save or export.

**Evidence needed:** deletion and replacement of referenced sources; coordinate-coincident negative matches; recovery by undo, delete and explicit test-only rebind fixture; exact unresolved state across reload; and proof that the prior accepted revision remains exportable.

## 3. Dependency and invalidation map

`stale` means the old output remains inspectable but is not current. Failures preserve prior committed inputs and result atomically; never commit new inputs while presenting an old result as current. Collective dependencies are not necessarily strand-local: changing one strand can change nearest neighbors, global ranks, density or synthesis elsewhere. Invalidate the whole consuming stage unless a narrower support is proven complete.

| Change | Direct effect | Invalidates |
| --- | --- | --- |
| Boundary geometry | Reclip source, unlocked derived and locked snapshots | All downstream geometry/analysis whose fragment set or coordinates changed |
| Carrier recipe or source geometry | Regenerate affected source strands and unlocked derived strands | All downstream records dependent on affected strand IDs or parameters |
| Control override | Recompute affected unlocked strand | Intersections onward for affected dependencies |
| Relational field | Recompute affected unlocked strands | Intersections onward for affected dependencies |
| Exclusion | Change included-strand set | Intersections, relations, measures, points, synthesis and exports |
| Lock/unlock | Freeze or resume one derived strand | All downstream results involving that strand |
| Over/under assignment | Change precedence only | Weave notation, rhythm/sequence analyses that consume precedence, related exports |
| Connection/binding decision | Change graph relation; an operation may separately change geometry | Connected components and consumers; if geometry also changes, invalidate from geometry onward |
| Analytical condition/rule | Reclassify existing geometry | Measures, significance, points, synthesis and analytical export |
| Significance weight | Re-score eligible conditions | Selected significant points and all dependent synthesis |
| Theme, camera, visibility | View only | Nothing analytical |
| Symbol style | Presentation only | Marking render/export appearance, not geometry or classifications |

Intersection, crossing, precedence, connection and analysis remain distinct:

- an **intersection** is a geometric contact result;
- a **crossing** is a proper-intersection classification under a versioned geometric rule;
- **over/under** is an authored precedence assignment at a crossing;
- a **connection** is an authored binding relation and may exist only where its later eligibility rule permits;
- an **analytical condition** is a derived interpretation with its own rule/version and never silently edits geometry.

## 4. Revision, save, migration and undo

**Engineering resolution:** schema 4 and immutable Weave Study revisions. Implement only data introduced in R1A; future edit/lock/exclusion records below are obligations for their own batches. Detailed creation, restore, fork and raw migration contracts are in document 18. One revision saves:

- exact Carrier Study source revision or embedded recovery snapshot;
- boundary, coordinate system and `referenceSpacing`;
- all manual sources, control overrides, exclusions and locks;
- all algorithm versions and fingerprints;
- the complete derived geometry snapshot and source mapping;
- diagnostics, unresolved count and completeness state.

Only a complete state with zero unresolved required records may become the latest accepted revision. Saving the same name appends a revision and updates a latest pointer; it does not mutate ancestry. A JSON backup contains the entire revision chain and retains schema-3 Carrier Studies. Schema-3 import upgrades by wrapping existing carrier data without changing `rect-v1` geometry; it creates no edits, exclusions or locks.

Every user gesture is one working-state undo transaction. Save libraries remain append-only and are never rolled back by Undo. Successful regeneration and stale/current transitions belong to the initiating transaction. Rejection preserves working inputs, geometry and undo pointer. Restoring a revision creates a new working state; it does not rewrite libraries. Preserve the current 100-step working history.

**Consequences:** accepted work remains recoverable and dependencies can identify exact sources. Backups grow because complete derived snapshots are retained. Schema 4 must ship with forward validation and schema-3 recovery fixtures before it can replace the current working schema.

**Evidence needed:** repeated same-name saves and ancestry; schema-3 import followed by exact carrier comparison; schema-4 backup round-trip; undo after successful and rejected regeneration; old dependent revision inspection after a new latest save; malformed and future-schema rejection without loss.

## 5. Required R0B walkthroughs

1. Move a field: the unlocked strand changes, the locked strand does not, and only dependent outputs become stale.
2. Delete a referenced source primitive: the edit becomes unresolved, the prior accepted revision stays intact, and current save/export is blocked until repaired.
3. Shrink a boundary against a lock: under the R2C recommendation any loss of locked geometry reports conflict and preserves the prior transaction.
4. Undo after regeneration: source, derived geometry, stale markers and latest working fingerprint return together.

## 6. R0B disposition

R0B engineering contracts are ready for R1A review with document 18. Lock clipping policy remains a material R2C decision; offset/world-target response and interpolation remain R2D decisions. Their earlier invented formulas are withdrawn. These later choices do not block the identity-only R1A foundation.
