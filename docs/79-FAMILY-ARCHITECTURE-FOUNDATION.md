# Family Architecture Foundation

Build: `WF-FAMILY-FOUNDATION-20260918`

Status: locally complete for review. No publication. W3 has not begun.

## Product result

Every pattern family now has a versioned catalog entry with a permanent identity, editable name, independent display order, and future-export inclusion setting. The Weave Pattern panel shows these controls with an export-ready count of strands, fragments, and segments. `Isolate This Family` is a view-only control that works for source, derived, and continuous over/under rendering and never changes geometry.

Family labels and order are presentation and organization metadata. The engine key remains the bounded internal A–H reference used by the certified evaluator. Deleting a family no longer renumbers surviving keys. A later family may reuse an unused engine key, but it receives a different permanent family identity.

## Architecture

- `family-catalog-v1` is optional on legacy working documents and carrier revisions. Legacy documents receive a deterministic read-only identity view; their prior bytes are not rewritten. The next explicit save materializes the catalog.
- New carrier revisions and weave snapshots retain the catalog through immutable saves, retargeting, backup, restore, and schema migration.
- `derived-family-index-v1` partitions the existing certified strand array by stable family identity using strand indexes and counts. It does not copy or recalculate geometry.
- Crossing-family indexing resolves exact crossing strand references to the same stable family identities.
- The compact geometry payload remains one transactional, content-addressed unit. Family metadata changes reuse its exact bytes. This preserves atomic commits, recovery, capacity accounting, and the certified geometry contract while providing export-ready per-family views.
- Compact payload dictionaries now accept bounded unique nonconsecutive A–H keys. This is required because family deletion no longer renumbers surviving geometry identities.

## Verification

Five new architecture tests pass: deterministic legacy identity, immutable backup round trip, label/order/export metadata with identical geometry and compact bytes, deletion without renumbering, family-indexed derived/crossing references, and nonconsecutive-key codec compatibility. The focused affected suite passes 45/45. All distribution modules parse, the static entrypoint check passes, and `git diff --check` reports only pre-existing end-of-file whitespace notices in project records.

Managed local-browser verification passed on the current stored workspace: the build identifier is visible; family rename saved and updated its tab/count label; Move Right reordered the tabs without changing the canvas; isolate showed only the selected family; Show All restored the full weave; reload retained the name, order, permanent identity, and export-ready counts.

## Deferred

Separate SVG/DXF download actions are not exposed yet. The new index and inclusion setting are the foundation for that export slice. Crossing priority remains controlled only by Over / Under; family order remains organizational. W3 richer preset work, W4 connection stitches, W5 analysis, W6 points, and W7 polylines remain deferred in the recorded sequence.

The next bounded implementation batch should add actual per-family SVG and DXF exports from the indexed post-influence strands, with explicit units and provenance, before expanding the preset library further. That batch follows the settled family architecture and does not require substantial geometry reasoning.
