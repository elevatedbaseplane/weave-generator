# Contact constraints and adaptive tension

Date: 2026-09-21

Build: `WF-CONTACT-TENSION-20260921`

Published application commit: `7d1e73e3eb24b7327428a13e88f8d364d4d1e2a6`

Public Site version: 22

## User-visible capability

`OVER / UNDER → CONTACT + TENSION` now provides an optional contact response with:

- Base tension from 0–100.
- Adaptive response from 0–100.
- One reset that restores the accepted clean crossing baseline.

Existing projects remain visually identical because the response is disabled by default. Setting base tension below 100 reveals the adaptive differences. Lower tension permits more clearance around an upper ribbon; adaptive response then tightens that allowance according to nearby restraint spacing, crossing angle, local curvature and whether the lower span is restrained on one or both sides.

## Internal capability

- A strict `interlacing-v4` record stores the bounded contact decision.
- Earlier `interlacing-v1`, `v2` and `v3` records retain their original behavior and materialize the disabled default.
- Contact records are grouped and ordered along each lower fragment.
- Additional mask reach is bounded by neighboring restraints and never falls below the required upper-ribbon footprint.
- Canvas and SVG use the same mask calculation.
- The change affects crossing clearance only. Certified thread paths, points, geometry payloads and crossing decisions do not move.
- Contact edits reuse the presentation-only autosave path and do not dispatch a geometry worker calculation.

## Verification

- Focused contact, occlusion, persistence, interaction and field-presentation suites: 44 passed, 0 failed.
- Current-contract matrix: 262 passed, 0 failed.
- Preserved Phase 0 diagnostics and frozen fixtures: 8 passed, 0 failed.
- Syntax and diff checks: passed.
- Local Phase 6 fixture: 31 source paths, 31 derived paths and three fields.
- Local interaction: enabled at 30% base and 60% adaptive, persisted through reload, then reset to the disabled 100% baseline.
- Local visual check at 161.5%: clean continuous outlines with no wedge or stub artifacts.
- Local browser warnings and errors: none.
- Public Site: active, public, version 22; native deployment succeeded.

## Status

Contact constraints and adaptive tension are complete and ready for review. The next planned capability in document 98 is force and relationship analysis; it has not begun.
