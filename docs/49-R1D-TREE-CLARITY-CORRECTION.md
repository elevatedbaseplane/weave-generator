# R1D saved-tree clarity correction

Date: 2026-09-16  
Build: `WF-R1D-TREE-CLARITY-20260916`  
Status: locally complete; visual review required; unpublished

## Visible correction

The left rail now labels every saved-object level as `BOARD`, `BOUNDARY`, `WEAVE PATTERN`, or `INFLUENCED GRID`. Each object shows its revision count and, where applicable, its nested-child count. Increasing indentation and distinct connector treatments make parentage visible without changing the saved model.

Boards, Boundaries, Weave Patterns, Influenced Grids, and each object's Revision History are independently collapsible. Expansion choices survive ordinary interface rerenders during the session. The existing rename, duplicate, delete, select, and revision-restore actions remain in their object rows.

## Scope and verification

This correction changes only the tree renderer, tree presentation, build identity, and focused UI assertions. Geometry, workers, schema-5 persistence, IndexedDB records, compact encoding, backup, lineage, and immutable revisions are unchanged.

- Module syntax passes.
- Focused hierarchy, dynamic-family, storage round-trip, duplication/deletion, and UI checks pass `20/20`.
- Static entrypoint and private-output checks pass.
- Visual acceptance remains required in the local preview.

R1D remains the active review batch. R2A and publication remain closed.
