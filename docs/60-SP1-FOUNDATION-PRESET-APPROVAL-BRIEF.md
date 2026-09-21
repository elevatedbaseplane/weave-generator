Update 2026-09-17: user authorized SP1 and marked R1 development-complete, superseding the approval/checkpoint dependency below. Retained numerical, storage and performance contracts apply. Partial implementation/status: document66.

# SP1 — first editable stitch foundations: approval brief

Status: proposed, not implemented or authorized. Depends on a passing R1 browser checkpoint in document 59 and approval of documents 57–58 as corrected by 59. Baseline WF-R1D-ANCESTRY-REPAIR-20260917 remains unchanged.

## Exact batch

Add a Preset picker in Weave Pattern containing the existing line-family pattern plus **Double Herringbone — alternating foundation** and **Herringbone Square — foundation**. Create Pattern adds an independent, immediately visible saved Pattern beneath the selected Boundary. The tree and panel layout remain stable; no Influenced Grid prerequisite or extra Save action.

Double Herringbone controls: repeat pitch, band height, positive row gap, overlap and rotation. Square controls: width, height, positive X/Y gaps, extension and rotation. Preserve equal line styling, role-specific field strength/tension, shared radius/falloff, direct field dragging, selection guides, source/derived comparison, reset/removal, Undo/Redo, automatic saving, reload and portable backup. Existing line-pattern variation remains intact; finite-recipe variation is deferred because independent run offsets would break stitch construction.

Implement the explicit finite-source adapter and bounded compact layout from 57–58: stable run/cell identities, [0,1] parameters, length-aware support splitting, complete certified approximation, analytical polyline clipping, versioned role generation, schema6 migration and legacy-byte preservation, immutable revisions, transactional recovery and exact 10 MiB admission. No new numerical limits or silent quota assumptions. Preserve worker375/400, dense650/750, default200, render/pending50 and application long-task gates.

## Automated exit

- Reviewed source coordinates, source IDs, crossing templates, seam/closure and hidden-backside negative fixtures.
- Identity and field cases, finite interval/support endpoints, concave gaps and source runs pulled in from outside the boundary.
- Mixed legacy/new exact encoding and backup, real incremental saving, reload ancestry, Undo/Redo, migration, stale tabs and atomic quota/failure recovery.
- Maximum finite-source capacity plus actual default/dense worker/browser timing. A new primitive/storage discriminator warrants these system checks once; isolated UI corrections afterward use focused verification.

## Five visual acceptance tests for the future SP1 preview

1. Select a saved Boundary. In **Weave Pattern → Preset**, choose **Double Herringbone — alternating foundation**, then **Create Pattern**. A repeated diagonal foundation appears immediately and a new Pattern appears in the tree.
2. In that panel, change **Repeat Pitch**, **Band Height** and **Overlap**. The construction updates immediately. In **Field Forces**, add and drag an attractor, then change pitch again. The field stays attached and the result retains full opacity.
3. Create a separate **Herringbone Square — foundation** Pattern. Change **Width**, **Height**, **Gap X** and **Gap Y**. Extended-square motifs resize and separate without visible backside connectors; the earlier Pattern stays intact.
4. In **Field Forces**, adjust one role's Strength, disable/re-enable the field, then use toolbar **Undo/Redo**. Use bottom-right **Display → Original Grid / Distorted Weave** to compare. Controls and visible results remain in sync.
5. Select another Pattern, return and reload. Parameters and fields return automatically. In **Exchange + Backup**, export and import into a separate test workspace; both new presets and an existing line-family Pattern restore correctly.

## What remains afterward

These are editable foundations, not yet fully rendered woven stitches. R2A adds detected crossing events/diagnostics; R2B adds authored local over/under notation for the first two presets. SP2 introduces separately certified curved lacing; later SP batches add the remaining researched stitches. Manual strand composition, physical cloth simulation and cloud sync are excluded. Unverified Persian/square-fill routes remain gated individually.

## Handoff and approval

After the R1 browser result passes and this scope is approved, Sol Medium can implement SP1 against these recorded decisions. It is a substantial implementation batch but follows the settled finite-source contract; it must stop on a failed numerical, integrity, capacity or performance gate. Introducing curves, resolving new crossing-topology rules or changing traditional stitch construction still requires architectural review.

Publication is not included. A passing local version returns a preview and a short review report before the next scheduled feature batch.

