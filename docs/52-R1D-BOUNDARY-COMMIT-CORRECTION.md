# R1D Boundary commit correction

Date: 2026-09-17  
Build: `WF-R1D-BOUNDARY-COMMIT-20260917`  
Status: locally complete; visual acceptance pending; unpublished

## Failure and cause

The reported tab rendered the working square but retained zero saved Boundaries, kept Create Weave Pattern unavailable, and labeled the canvas as unsaved. The save path uses an IndexedDB compare-and-swap generation check. When another open preview tab advances the same browser-local workspace, the older tab correctly rejects its stale commit. The global error status was too remote from the Boundary action, making this appear as an inert button.

## Correction

`Make Square` retains the atomic stale-write rejection. On its first typed `concurrent-change` only, it now:

1. reads and decodes the newest committed IndexedDB root;
2. validates that complete workspace;
3. confirms the same Board still exists;
4. reapplies the independent new-square command to that Board; and
5. commits once against the refreshed head.

A second conflict still fails; a removed Board fails; other storage and validation errors fail. The command never overwrites the stale root or merges mutable geometry. Successful completion adds the Boundary to the tree and makes Create Weave Pattern available.

The Boundary panel now contains an inline live result below Make Square: saving, synchronization/retry, success, or the exact failure. This prevents a storage error from being hidden in the distant workspace status bar.

## Verification

- Focused Boundary, carrier, tree, UI, compact-storage, backup, and incremental-storage suite: **45/45 passed**.
- Application syntax and static/private-output checks passed.
- Served HTML exposes the inline result and build identity.
- Served application module contains the bounded latest-head retry path.

Preview: `http://127.0.0.1:43830/?r1d-boundary-commit=20260917`

## Remaining work

The user must verify that Make Square produces a Boundary tree node and unlocks Create Weave Pattern in the affected multi-tab browser profile. R1D otherwise remains at visual acceptance. R2A and publication remain closed.
