# Influence-radius SVG export

Date: 2026-09-21  
Build: `WF-INFLUENCE-RADIUS-SVG-20260921`  
Application commit: `873bdc672309e32720c3284869d4e63fd5f1730e`  
Published Site version: `28`

## Result

Exchange + Backup now includes **Export Active Radius SVG**. It exports the currently selected influence as a separate SVG containing only its radius circle. Attractor, repeller, and deflector fields use the same exact export path.

The SVG excludes:

- weave source, distorted, outline, crossing, and recovery geometry;
- the canvas background and boundary;
- influence labels and editing handles;
- center and radius guide marks;
- the deflector direction line.

The export is disabled when no saved influence is active or when an influence edit is still pending. Its filename identifies the selected influence index and kind.

## Geometry and handoff contract

The circle uses the influence's saved document-space center and radius. SVG y coordinates are negated so the exported geometry preserves the application's documented y-up convention. Metadata records the stable influence identity, kind, center, radius, coordinate units, and transform convention. Display-only guide geometry is never serialized.

## Verification

- `node --check dist/influence-export.mjs`
- `node --check dist/app.mjs`
- Focused export/editing suite: 25/25 passed.
- Governing current-contract matrix: 275/275 passed.
- Static project check: passed.
- Managed local browser: restored the Phase 6 fixture, selected its active deflector, and downloaded `influence-1-deflector-radius.svg`.
- Download inspection: one `<circle>`, zero `<line>`, zero `<path>`, and zero `<rect>` elements; the circle retained the field's `deflector` kind, center, and radius.

## Publication

The exact application commit was pushed to the existing ChatGPT Sites source repository, saved as Site version 28, and deployed successfully without changing the site's public audience:

`https://weave-foundation.notbrandon175.chatgpt.site/`
