# Stability Foundation — phased implementation plan

Date: 2026-09-20

This plan stabilizes the existing application before Build 1B feature expansion. Do not add new preset families, contact physics, analysis, point extraction, or polylines during these phases.

Each coherent application review build should be validated locally and then published to the existing ChatGPT Sites project under the user's standing authorization. Do not publish a partially applied migration, a known broken build, a fixtures-and-diagnostics-only phase, or a planning-only phase. Phase 0 does not change the public application and therefore has no deployment. Preserve the site's current audience and return the verified production URL after later application deployments.

## Phase 0 — freeze and baseline

Capture compatibility fixtures for current projects, boundaries, saved weaves, families, influences, crossing rules, and manual overrides. Record the source fields required to regenerate each design and measure current geometry, worker, render, commit, storage, and reload behavior. Turn the five protected workflows from document 95 into a focused regression matrix.

Exit: existing behavior is reproducible, open defects are distinguished from historical harness debt, and no user-facing feature has been removed. Keep diagnostics local-only; do not push or deploy Phase 0. Publication is not a completion criterion. Mark Phase 0 complete and ready for user review, then stop before Phase 1.

## Phase 1 — canonical weave document

Define one authoritative source representation for a weave. Mark every other geometry, crossing, and render structure as derived or cached. Add read-compatible migration and exact fixture validation for existing saved data. Preserve stable project, boundary, weave, family, influence, and manual-override identities.

Exit: identical canonical documents regenerate identical accepted geometry; existing fixtures load without loss; derived caches cannot become an alternate saved truth.

## Phase 2 — unified editing and recalculation

Route sliders, typed values, preset selection, influence manipulation, and direct canvas edits through one validated update function and one calculation pipeline. Commit the exact final preview values. Reapply existing influences and crossing rules after relevant family edits. Add latest-request-wins handling and retain the last valid result on failure.

Exit: no control previews one result and commits or reloads another; spacing and influence-strength edits remain visible after release and reload.

## Phase 3 — compact background autosave

Separate the immediate in-memory edit from debounced persistence. Bound named-weave snapshots, recovery roots, and Undo independently. Run portable-capacity admission on the final compact candidate. Report backup failures separately and never use them to reverse a valid working edit.

Exit: repeated editing and adding influences do not create unbounded hidden revisions or routine 10 MiB failures; reload returns the accepted state.

## Phase 4 — incremental performance

Create explicit dependency invalidation. Rebuild only affected families, influences, crossings, or presentation. Cancel or ignore obsolete worker results. Reuse valid derived products. Add development timing evidence for input feedback, worker work, rendering, and complete settlement.

Initial targets: appearance feedback is immediate; ordinary family and influence edits begin feedback within one visual frame when possible and generally settle near 150 ms; longer work remains responsive and visibly reports calculation.

Exit: rapid consecutive edits show the newest value, remain interactive, and meet retained formal limits without weakening them.

## Phase 5 — workflow and library simplification

Present Projects, Boundaries, applied Weaves, and the reusable Weave Library as distinct concepts. Preset selection applies immediately. Keep woven overlaps enabled by default under Display. Put family selection before family-specific controls, use plain labels, and progressively disclose advanced crossing settings. Make the current Project / Boundary / Weave context unmistakable.

Exit: from an empty project, a user can create a boundary, apply and modify a weave, add influences, find the saved result, and reuse it on another boundary without learning internal storage concepts.

## Phase 6 — stabilization verification

Run deterministic geometry, preview/commit equivalence, multi-family isolation, influence persistence, crossing-override preservation, migration, compact-storage, interrupted-save recovery, and stale-worker rejection checks. Validate the five protected workflows in the local preview.

Exit: focused checks pass, the local build is usable, the user accepts the five workflows, and the report states `Stability Foundation complete — ready for Build 1B.`

## Work after the Stability Foundation

Build 1B resumes with named automatic crossing modes, family-pair relationship editing, seeded structured variation, balance and maximum-run controls, precedence display, persistence, and visual verification. Contact constraints and adaptive tension follow as a separate bounded batch after crossing relationships are dependable.
