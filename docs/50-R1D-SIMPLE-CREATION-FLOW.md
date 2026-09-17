# R1D simple creation flow

Date: 2026-09-16  
Build: `WF-R1D-SIMPLE-FLOW-20260916`  
Status: locally implemented and automatically verified; visual acceptance required; unpublished

## Product behavior

The visible workflow is now creation-first rather than storage-first:

1. `Make Square` creates and saves a new Boundary immediately.
2. `Create Weave Pattern` creates and saves a Pattern beneath the active Boundary immediately.
3. `Field Forces` follows the Pattern directly. Adding the first influence creates, certifies, and saves its Influenced Grid automatically.
4. Completed Pattern and Field gestures update the current named object automatically. No routine second save action is exposed.

The tree shows only each named object's current version. Internal immutable revisions, recovery roots, source identities, and portable backup data remain intact but are no longer exposed as a Revision History subtree. Same-name Boundary updates advance the current pointer rather than creating a second visible object.

Boundary changes append updated current Pattern revisions clipped to the new Boundary. The active influenced result is recalculated through the certified worker and committed atomically. Other saved influenced alternatives retain their immutable source until opened; opening one transparently retargets, certifies, and saves it against the Pattern's current revision.

Pattern-family spacing, angle, offset, density, add, duplicate, and remove operations preserve the influence set. Distorted results receive worker-backed live updates while the control moves and a named saved revision on gesture completion.

## Display simplification

The secondary dashed-family option is removed. One `Original Grid` control replaces the separate Pattern-family style toggles. All Pattern families use the same neutral color, line weight, and hierarchy. The Original Grid automatically fades when enabled fields or seeded variation create a distorted result.

The separate right-rail Influenced Grid setup section is removed. Export remains available in Field Forces after a result exists.

## Preserved contracts

- Schema 5 and all stable object identities remain.
- Geometry equations, clipping, certificates, workload limits, worker protocol, stale-result rejection, and 500/750 ms interaction limits remain.
- IndexedDB transactions, compact encoding, immutable recovery history, backups, lineage, and atomic failures remain.
- Historical revisions remain readable and portable.

## Verification

- Module syntax passes for the changed application, document, display, and weave modules.
- Focused carrier, display, hierarchy, R1C/R1D geometry, worker, codec, backup, and export checks pass `79/79`.
- Added checks prove same-name Boundary replacement and Pattern reclipping, active influence preservation across family add/remove, the simplified Field Forces transition, hidden revision history, Original Grid behavior, and equal family styling.
- Static entrypoint and private-output checks pass.
- Served build identity and manual visual acceptance remain.

R1D remains in visual review. R2A and publication remain closed.
