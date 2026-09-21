# Stability Foundation — current handoff

Date: 2026-09-20

## Current build

- Build identity: `WF-STABILITY-S4-BOUNDED-AUTOSAVE-20260918`
- Local preview: `http://127.0.0.1:43831/?stability-s4c=20260918`
- Publication: standing authorization is active for completed, internally verified updates to the existing ChatGPT Sites project. Preserve its current audience.
- Current phase: Stability Foundation Phase 0 has not begun.

## Current product state

The application has working foundations for boundary creation, reusable weave presets, independent families, thread appearance, multiple field influences, continuous over/under rendering, family relationship rules, manual crossing overrides, automatic saving, Undo/Redo, reload, recovery, and portable backup. The current project library presents Project → Boundaries → Weaves, but the distinction between applied and reusable weaves still needs refinement.

Recent bounded autosave work compacted named-weave snapshots and pruned the current snapshot to referenced records and payloads. Local validation recovered a valid historical root after a transient bad compaction implementation. The corrected multi-weave compaction assigns each revision its own payload. A tested workspace decreased from roughly 2.45 MiB and 102 revisions to about 376 KiB active-project data and 6 revisions. Family A strength and a fourth influence survived reload in managed-browser verification.

## Why the pivot is required

Repeated defects share one cause: interactive preview, committed geometry, derived results, library revisions, and portable-capacity admission are too tightly coupled. A valid preview can be followed by a rejected save and restoration of old geometry, which looks like a control failure. Full-workspace work makes simple edits slow and makes unrelated storage failures block field changes. The interface also exposes internal structure before the creation workflow is clear.

Do not treat individual slider or influence symptoms as isolated until the unified edit and persistence boundaries are established.

## Preserved evidence

- The current bounded-autosave implementation and rationale are recorded in document 94.
- Focused atomic field, multi-weave payload ownership, worker-queue, and draft checks pass.
- Static entrypoint and changed-module syntax checks pass.
- An old unrelated `r1b.test.mjs` assertion still expects schema 5 while the current schema is 6; do not describe the entire legacy suite as passing until that stale assertion is reviewed.
- R1 is development-complete with final host certification deferred to pre-publication. Repeated external runs for verifier-only failures are not required.

## Immediate next action

Begin document 96 Phase 0 only. Inventory the canonical user decisions and existing duplicate/transient sources, produce compatibility fixtures, and record baseline behavior for the five protected workflows. Do not restructure production code until that baseline can detect data loss or behavioral regression.

## Reporting

After every phase report exactly:

1. Current phase.
2. What changed visibly and internally.
3. What remains in the phase.
4. Focused checks run.
5. Exact visual tests for the user.
6. What comes next.

When the phase is complete, say `ready for the next phase`. Publish coherent verified build updates through the existing Sites project and return the deployed URL.

