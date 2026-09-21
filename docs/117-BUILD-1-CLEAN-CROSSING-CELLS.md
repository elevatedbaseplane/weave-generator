# Build 1 clean crossing cells

Date: 2026-09-21

Build: `WF-B1-CLEAN-CROSSING-CELLS-20260921`

Published application commit: `d9e6a39694eb024506445cd68ca34c30af583a4b`

Public Site version: 20

## Correction

The document 116 correction restored every locally upper region after applying all lower-thread masks. In crowded regions that repaint was too broad: it could draw a thread back through a neighboring crossing and reduce the visual separation between over and under.

The renderer now assigns every resolved crossing a nearest-neighbor cell along the lower thread. Its mask polygon is clipped to that cell before SVG generation. Adjacent crossings therefore divide their affected range at a stable midpoint and cannot erase or repaint through one another.

The broad upper-thread protection layer has been removed completely.

## Preserved contracts

- Certified source and derived geometry are unchanged.
- Crossing discovery, assignments, pair rules and local overrides are unchanged.
- Saved projects, immutable revisions, identities and portable backups are unchanged.
- Body and recovery paths remain open and deterministic.
- SVG export uses the same corrected presentation renderer.
- The 750 ms completion maximum is unchanged.

## Verification

- Current-contract matrix: 257 passed, 0 failed.
- Preserved Phase 0 diagnostics and frozen fixtures: 8 passed, 0 failed.
- Focused renderer, recovery and interaction suites: 19 passed, 0 failed.
- Static entrypoint/reference, module syntax and diff checks: passed.
- Local saved project: 181 assigned crossings, 63 masks, zero protection repaint regions, 43.0 ms worker time; visually checked at Fit, 156.1% and 320.8%.
- Hosted saved project: 84 source paths, 84 derived paths, two fields, 1,037 assigned crossings, 204 masks, zero protection repaint regions and 148.3 ms worker time; visually checked at Fit and 598.7%.
- Browser warnings and errors: none.
- Public Site: active, public, version 20.

Contact constraints and adaptive tension remain the next planned build and have not begun.
