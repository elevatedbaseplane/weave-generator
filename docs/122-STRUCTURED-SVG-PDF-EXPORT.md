# Structured SVG and PDF export

Date: 2026-09-21

Build: `WF-STRUCTURED-EXPORT-20260921`

Published application commit: `b20a8ce5134e0c48244fabc20f697e5db276b21f`

Public Site version: 25

## Export tool

The Exchange + Backup section now provides:

- **Centerlines · Interpreter handoff:** deformed centerline SVG with one open path for every strand fragment, grouped by family and carrying stable family, strand, and fragment identities.
- **Full weave · as drawn:** the established appearance SVG with thread outlines, hierarchy, opacity, exposed ends, and over/under masks.
- **PDF drawing:** background-free vector linework with black-line and white-line choices.

Centerline SVG keeps display thickness separate from geometry. Saved thread width and outline line weight are attached as path metadata, while the path itself remains the stable centerline. The metadata block also contains the boundary, source context, lineage, field generation, family appearance, field-presentation settings, crossing settings, and provenance fingerprint.

PDF output paints only vector strokes. It does not create a background rectangle or rasterize the drawing. It preserves saved outline line weights, opacity derived from family hierarchy, recovery/fray opacity, exposed ends, and over/under gaps. White strokes are intentionally present even though they appear blank against the white page shown by many PDF viewers.

## Verification

- Focused export, appearance, field-presentation, crossing, and build-identity suites: 25 passed, 0 failed.
- Current-contract matrix: 265 passed, 0 failed.
- Preserved Phase 0 workflow and fixture checks: 8 passed, 0 failed.
- Focused interface checks: 3 passed, 0 failed.
- Module syntax and diff checks passed.
- Poppler `pdfinfo` accepted the generated one-page PDF as PDF 1.7, with no encryption, forms, JavaScript, or metadata stream.
- Poppler rendered the PDF as vector linework; the content stream contains stroke operations and no background fill operation.
- The restored Phase 6 browser fixture successfully downloaded Centerline SVG, Full Weave SVG, and white-line PDF. Browser warnings and errors: none.
- Public Site version 25 deployment succeeded at `https://weave-foundation.notbrandon175.chatgpt.site/`.
