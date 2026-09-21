# Generator scope cleanup

Date: 2026-09-21

Build: `WF-GENERATOR-SCOPE-20260921`

Published application commit: `6183bf4f004ccb54ec9702eb9b071d15e212eb6d`

Public Site version: 24

## Scope decision

- Point Extraction and Polyline Composer have moved to another tool.
- Their top-level tabs and Extract/Synthesize workflow stages were removed from the generator interface.
- Both capabilities were removed from the generator's active roadmap.
- Rule-based binding is deferred and is not an active generator milestone.
- Connection stitches remain a separate later capability without rule-based binding.
- Historical documents and fixtures remain unchanged as evidence unless they are authoritative current handoffs.

## Preserved behavior

The change does not alter canonical weave documents, saved-work compatibility, family or strand identities, certified geometry, influences, crossing assignments, contact response, persistence, recovery, or current exports.

## Active generator sequence

1. Stable weave creation and editing.
2. Reliable automatic and manual over/under construction.
3. Expanded traditional and complex weave library.
4. Connection stitches without rule-based binding.
5. Contact constraints and adaptive tension.
6. Force and relationship analysis.
7. Stable per-family, per-strand, and combined SVG/DXF export.

## Verification

- Focused scope and build-identity checks: 3 passed, 0 failed.
- Current-contract matrix: 262 passed, 0 failed.
- Preserved Phase 0 workflow and fixture checks: 8 passed, 0 failed.
- Module syntax and diff checks passed.
- Local managed-browser inspection found no Point Extraction, Polyline Composer, Extract, or Synthesize surface and no browser warnings or errors.
- Public Site version 24 deployment succeeded at `https://weave-foundation.notbrandon175.chatgpt.site/`.
