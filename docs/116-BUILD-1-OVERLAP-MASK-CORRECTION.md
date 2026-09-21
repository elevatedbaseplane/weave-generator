# Build 1 overlap-mask correction

Date: 2026-09-21  
Build: `WF-B1-OVERLAP-MASK-CORRECTION-20260921`  
Published application commit: `0260c8bb944e2c844066f34cbb47676943a82eab`  
Public Site version: 19

## Reported defect

In dense regions, some over/under gaps had no visible upper thread crossing them. The certified crossing decision was intact, but the rendered white space made the weave appear broken.

## Cause and correction

Each lower thread uses an SVG mask cut from the local upper ribbon. When crossings were close together, a second mask could erase the thread that the first crossing expected to remain visible above it. The renderer now records each local upper-thread footprint as a protection in that fragment's own mask. Black lower-thread occlusions are applied first; white upper-thread protections are applied afterward.

This is a presentation-only composition change. It does not change:

- certified strand geometry or source decisions;
- crossing discovery, assignments, precedence or overrides;
- working-boundary and recovery geometry;
- saved projects, identities, revisions or portable backups;
- SVG path geometry or the 750 ms completion limit.

## Verification

- Current-contract matrix: 257 passed, 0 failed.
- Preserved Phase 0 diagnostic and fixture checks: 8 passed, 0 failed.
- Static entrypoint/reference check, module syntax and `git diff --check`: passed.
- Added a three-thread regression in which one thread is locally above one neighbor and below a nearby neighbor. Its mask must contain the lower occlusion followed by the local upper protection.
- Restored local fixture: correction rendered at Fit with the new build identity.
- Published saved weave: 90 source paths, 90 derived paths and five fields remained present after Fit and zoom to 598.7%; no pending or fallback presentation appeared.
- Public Site rechecked after deployment: active, access mode `public`, version 19.

## Scope

This closes the reported overlap-mask gap. Contact constraints and adaptive tension remain the next planned build and have not begun.
