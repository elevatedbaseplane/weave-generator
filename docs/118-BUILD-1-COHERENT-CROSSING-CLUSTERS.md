# Build 1 coherent crossing clusters

Date: 2026-09-21

Build: `WF-B1-COHERENT-CROSSING-CLUSTERS-20260921`

Published application commit: `70fc09625d73d9f47e51eabd6fbdc3454186511b`

Public Site version: 21

## Correction

The document 117 nearest-neighbor crossing cells could be shorter than the visible ribbon footprint in dense or acute crossing clusters. Clipping a mask to those cells created hard stubs, wedges, nicks and broken outline rails.

The renderer again uses the actual upper ribbon contour for each crossing mask. When several overlapping crossing footprints form an impossible pairwise depth cycle, their presentation assignments are resolved into one stable local depth order. Acyclic crossing assignments are left unchanged. Explicit local overrides receive the strongest ordering priority when a cyclic cluster must be resolved.

The correction adds no repaint layer and does not clip masks to artificial cells.

## Preserved contracts

- Certified source and derived geometry are unchanged.
- Crossing discovery, saved rules, pair rules and local overrides are unchanged.
- Only presentation assignments inside an overlapping impossible depth cycle may be reconciled.
- Saved projects, immutable revisions, identities and portable backups are unchanged.
- Body and recovery paths remain open and deterministic.
- SVG export uses the same corrected presentation renderer.
- The 750 ms completion maximum is unchanged.

## Verification

- Current-contract matrix: 257 passed, 0 failed.
- Preserved Phase 0 diagnostics and frozen fixtures: 8 passed, 0 failed.
- Focused renderer, recovery, interaction and build-identity suites: 22 passed, 0 failed.
- Diff and syntax checks: passed.
- Local saved project: 31 source paths, 31 derived paths and three fields; visually checked at Fit and 320.8%.
- Hosted saved project: 90 source paths, 90 derived paths and five fields; visually checked at Fit and 598.7%.
- Hosted worker: 127 ms crossing computation, 15.7 ms presentation, 468 ms total completion.
- Hosted storage remained writable; browser warnings and errors: none.
- Public Site: active, public, version 21.

Contact constraints and adaptive tension remain the next planned build and have not begun.
