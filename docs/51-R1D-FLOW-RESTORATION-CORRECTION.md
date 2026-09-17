# R1D flow restoration correction

Date: 2026-09-16  
Build: `WF-R1D-FLOW-RESTORE-20260916`  
Status: locally complete; visual acceptance pending; unpublished

## User-visible corrections

- Boundary no longer exposes redundant Save As or Update Boundary controls. `Make Square` creates and saves the new Boundary immediately; direct vertex and imported-boundary changes retain the established automatic update path.
- `Create Weave Pattern` now forces Original Grid visible, clears result-only display layers, saves the Pattern, and shows its editable family geometry before any influence exists.
- Selecting a Weave Pattern in the saved tree restores its most recently saved influenced child when one exists. If that child references an older Pattern revision, it is retargeted through the certified worker and saved against the current Pattern before commit. A Pattern without a child opens as its editable original grid.
- Each influence now has an integer Falloff slider from 1 through 5. `1` spreads influence across more of the radius, `5` concentrates it near the center, and `3` is the accepted prior behavior.

## Compatibility and accuracy

Existing schema-5 influence records that omit `falloff` remain valid and evaluate as exactly `3`; their geometry and fingerprints are unchanged. New and edited records store the selected value. Interval-certified evaluation uses the selected integer exponent. The accepted exponent-3 displacement and curvature bounds remain unchanged; other exponents use conservative complete-support bounds. Invalid, fractional, or out-of-range values fail before a commit.

The existing transactional IndexedDB, compact encoding, immutable revisions, atomic commit, recovery, backup, stale-result rejection, workload limits, clipping, and source lineage paths remain in force.

## Verification

- Focused affected suite: **81/81 passed** across carrier, display, saved hierarchy, UI, R1C/R1D geometry, worker execution, compact storage, backups, and weave behavior.
- New checks cover the adjustable Falloff range, rejection values, complete certified output at Falloff 1 and 5, and exact legacy omitted-value behavior.
- Static/private-output check passed.
- The running local server returns the new HTML and application build identity.

Preview: `http://127.0.0.1:43830/?r1d-flow-restore=20260916`

## Remaining work

Visual acceptance is required. R1 remains at its R1D review checkpoint until the user accepts this correction and the broader R1 phase checkpoint is completed. R2A and publication remain closed.
