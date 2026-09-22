# Weave-level field-radii SVG correction

Date: 2026-09-21  
Build: `WF-WEAVE-FIELD-RADII-SVG-20260921`  
Application commit: `89b05031349df51567579dbad447907161d8e433`  
Published Site version: `29`

## Correction

The field-radius export now creates one SVG for the selected weave containing all of that weave's influence-radius circles. It replaces the active-field-only behavior recorded in document 125.

Each saved attractor, repeller, and deflector contributes one circle using its exact document-space center and radius. Disabled influences remain authored fields and are included with their enabled state recorded in metadata. The file retains stable field identities and kinds.

The export excludes weave geometry, boundary and background graphics, field labels, editing handles, center marks, and deflector direction lines. Its bounds encompass the complete set of exported circles with equal padding.

## User interface

Exchange + Backup now presents **Export Weave Field Radii** with the action **Export All Field Radii SVG**. The action is available when the selected weave has at least one saved influence and no field calculation is pending. The filename is `weave-influence-radii.svg`.

## Verification

- Changed-module syntax checks passed.
- Static project check passed.
- Focused export/editing suite: 25/25 passed.
- Governing current-contract matrix: 275/275 passed; the four previously audited stale historical test files remain outside that matrix.
- Managed local browser restored the Phase 6 weave with three saved fields and downloaded one SVG.
- Download inspection found three circles: two attractors and one deflector.
- Download inspection found zero line, path, and rectangle elements.

## Publication

The exact application commit was pushed, saved as Site version 29, and deployed successfully without changing the public audience:

`https://weave-foundation.notbrandon175.chatgpt.site/`
