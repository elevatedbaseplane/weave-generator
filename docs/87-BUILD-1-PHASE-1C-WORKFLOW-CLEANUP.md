# Build 1 Phase 1C workflow cleanup — 2026-09-18

Build `WF-B1-P1C-WORKFLOW-CLEANUP-20260918` simplifies the working path without changing certified geometry, compact storage, immutable revisions, recovery, or crossing identities.

## Visible changes

- Thread Style is removed. Every thread is presented as an outline, including saved legacy Solid settings, without rewriting saved records.
- Over / Under begins with two plain choices: where the rule applies and the weaving rhythm. Individual crossing editing and technical controls remain available in a collapsed Advanced section.
- Project Library explains the Boundary → Weave Pattern → Result hierarchy and uses full Rename, Copy, and Delete labels.
- Saved Boundary can open a clean boundary context directly, ready to receive a new pattern.
- The preset menu includes a My Saved Patterns group. Choosing one makes a new editable pattern from its family geometry and thread appearance; influences are intentionally added afterward.
- Activity from another tab pauses editing and exposes Reload Latest before any storage admission calculation, avoiding misleading capacity errors.

## Focused verification

All 59 focused tests pass. They cover outline-only presentation and legacy compatibility, saved-boundary and saved-pattern choices, simplified Over / Under defaults, multitab freshness, family editing with active influences, compact backup round trips, immutable ancestry, worker execution, crossing rules, and local overrides. Changed-module syntax and static entrypoint checks pass.

An isolated managed-browser scenario passed this complete route:

1. open a saved boundary;
2. create a new pattern from My Saved Patterns;
3. confirm the source weave appears;
4. add an influence and receive a certified saved result;
5. change Strength to 70 and confirm the derived SVG changes and saves;
6. choose Whole Weave plus Alternate 1 Over / 1 Under and confirm the selection remains active and the sequence updates.

The sample influence edit completed in 39.8 ms total. This is development-mode evidence, not a new phase performance certification.

## Status

This is a Build 1 Phase 1C correction version for visual acceptance. Phase 1D seeded structured variation remains next. Build 1 is not complete. No host run or publication was performed.
