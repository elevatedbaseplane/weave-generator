# Phase 1B verification

Build `WF-1B-20260914` implements only staged import of one closed straight SVG boundary. Implementation commit `e2bb9f844207a403b2fe7e52bbc7c9c1b69a018d` is private Site version 2 at `https://weave-foundation.notbrandon175.chatgpt.site`. Deployment `appgdep_6aa8490eb0b881918d8c202f518b346b` succeeded.

## Delivered

- File picker and visual staging panel with filename, vertex count, boundary size, original width/height/viewBox strings, validation outcome, Apply and Cancel.
- One polygon from polygon, non-rounded rect, explicitly closed polyline, or M/L/H/V/Z path input.
- Numeric matrix/translate/scale/rotate/skew transforms on groups and supported elements. Nested group composition is tested; root and nested SVG transforms are rejected.
- Exactly one SVG Y-down to document Y-up conversion. Coordinates and authored vertex order are not rescaled.
- Apply is one working-document history operation. Cancel and rejection do not change the workspace.
- Optional validated boundary source metadata survives immutable revision save, reload and schema-2 JSON backup. Existing schema-2 data without it remains valid. SVG markup and scripts are not persisted.
- Explicit rejection for open input, curves/arcs, multiple polygons or subpaths, holes, rounded rectangles, unsupported geometry/elements/transforms, malformed XML, duplicate/malformed attributes, invalid numbers, and invalid boundary geometry.

## Verification

- 17 automated tests pass. New cases cover asymmetric coordinates, all accepted straight forms, translated/scaled/rotated nested transforms, root/unsupported transforms, multiple geometry, open and curved paths, malformed XML, zero-area/crossing geometry, source validation, revision copying and backup round-trip.
- All public modules pass `node --check`; the static entrypoint, local references, public-output exclusions and rebuild-only destination pass.
- Local browser: asymmetric fixture staged as six vertices and 160 × 80; Cancel preserved the exact prior boundary; Apply produced the six expected Y-up coordinates; Undo restored the square and Redo restored the imported boundary.
- Local browser: saved source metadata remained exact after reload; crossing geometry showed a specific rejection, disabled Apply and left the full workspace unchanged.
- Local browser: transformed fixture staged and applied with the expected transform/Y conversion. Desktop 1280 × 800 and mobile 390 × 844 resizing preserved the exact workspace.
- Release archive SHA-256 `1055f9443611a096149ce7281b5e4e00a38b9924b67cee2ba1fd281cd3bc2d93`; ten staged public assets match the committed source byte-for-byte. The archive contains those assets plus the rebuild manifest.
- Live readback: Site version 2, source commit exact, deployment succeeded, owner is the sole viewer, zero groups, build `WF-1B-20260914`, schema 2, storage available, boundary/grid off initially, and Boundary Exchange exposes the staged SVG import control.

## Limits and next boundary

User acceptance of Phase 1B passed, as explicitly reported by the user. DXF/DWG import, image underlay, unit conversion, curves, holes, multiple polygons, open traces, carrier generation and later spatial layers remain outside this release. Phase 2 carrier definitions require substantial architectural reasoning before implementation.

## Exact live acceptance

Use the fixtures in `tests/fixtures/` and the private live Site. Run the ten actions provided with the Phase 1B scope: non-destructive valid preview/Cancel; asymmetric Apply and one Y conversion; Undo/Redo; transformed-group coordinates; the full rejection matrix; revision ancestry; reload persistence; portable backup into another owner-authenticated browser; Weave SVG export/reimport parity; and desktop/mobile coordinate stability.
