# R1D field-edit visual clarity correction

Date: 2026-09-17  
Build: `WF-R1D-EDIT-CLARITY-20260917`  
Status: locally complete; visual acceptance pending; unpublished

## Reported behavior

Moving an influence faded the complete field, the selected influence was not visually distinct, blank workspace clicks did not reliably deselect it, and changing Pattern spacing after applying influences could lose or misapply the current field state.

## Correction

- Distortion fading now targets only the undeformed **Original Grid** layers. Certified Derived paths retain their normal family color and opacity while a field request is pending and after it commits.
- Pending calculation keeps the last complete certified Derived result fully visible until its atomic replacement. Status and animated guide styling communicate pending work without fading geometry.
- The selected influence has a heavier, highlighted center, extent, direction, and handle. Clicking a guide or list row selects it. Clicking elsewhere in the center workspace deselects it and disables object-specific controls until another influence is selected.
- Pattern-family edits begin from the latest transient field state. Completing a spacing gesture cancels any superseded preview, recalculates the same complete influence set against the edited Pattern, and atomically saves the coherent Pattern and influenced result.
- Saved influence identities, parameters, certified geometry, clipping, immutable revisions, transactional storage, backup format, and worker stale-result protection remain intact.

## Verification

- Complete focused R1 carrier/display/tree/UI/R1C/R1D/render/storage suite: **89/89 passed**.
- Final targeted Pattern-tree and UI suite after workspace-wide deselection: **27/27 passed**.
- Module syntax and static/private-output checks passed.
- No exhaustive migration, capacity, recovery, or performance certification was repeated because this correction does not alter those systems.

Preview: `http://127.0.0.1:43830/?r1d-edit-clarity=20260917`

R1D remains at visual acceptance. The broader R1 phase checkpoint follows acceptance. R2A and publication remain closed.
