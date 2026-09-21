# Weave Generator — complete handoff for the new build chat

Date: 2026-09-20

This is the complete execution handoff. Read documents 95 and 96 with it. Older documents remain evidence and technical history, but stale next-step and publication instructions in them are superseded by this handoff and the current block at the top of `AGENTS.md`.

## 1. Product goal

Build a rigorous weave generator rather than a generic two-dimensional grid maker. A user should be able to create or choose a boundary, apply a reusable weave, edit each thread family, deform the weave with field influences, control visible over/under construction, attach connection stitches in later phases, and eventually analyze forces and derive points and polylines.

The tool must become simpler as its internal model becomes more rigorous. Ordinary creation should never require the user to understand revision roots, certified payloads, storage epochs, worker requests, or recovery manifests.

The long-term sequence is:

1. Stable weave creation and editing.
2. Reliable automatic and manual over/under construction.
3. Expanded traditional and complex weave library.
4. Connection stitches and rule-based bindings.
5. Contact constraints and adaptive tension.
6. Force and relationship analysis.
7. Derived points.
8. Derived polylines.
9. Per-family and combined SVG/DXF export.

Analysis remains on hold until the weave itself is dependable.

## 2. User model and library model

The main hierarchy is:

`Project → Boundary → applied Weave`

- A Project contains boundaries and their applied weaves.
- A Boundary is reusable drafting geometry.
- An applied Weave belongs to one boundary and stores its editable source decisions.
- The reusable Weave Library contains saved weave definitions that can be applied to another boundary and regenerated to fit it.
- Internal field results, revision history, payload records, caches, and recovery roots must not appear as library objects.

The left panel should eventually resemble the user's reference tool: simple project selection at the top, a contextual boundary list, and a clear weave list. It must always show which Project, Boundary, and Weave are active.

## 3. Primary user workflow

The target workflow is:

1. Create or select a project.
2. Create or select a boundary.
3. Select a preset or saved weave; it applies immediately to the active boundary.
4. Edit families and see every change immediately.
5. Add and edit influences; existing family settings and crossing rules recalculate automatically.
6. Edit over/under behavior globally, by family relationship, or at one crossing.
7. Leave, reload, switch boundaries, and return without losing the accepted design.
8. Export one family, selected families, or the entire weave in later phases.

There should be no Create Weave Pattern button after selecting a preset. Woven overlaps are enabled by default and their visibility control belongs under Display. Advanced settings appear only when needed.

## 4. Current local build

- Checkout: `work/weave-rebuild`
- Branch: `foundation`
- Current local build identity: `WF-STABILITY-S4-BOUNDED-AUTOSAVE-20260918`
- Local preview path: `http://127.0.0.1:43831/?stability-s4c=20260918`
- The local server is ephemeral; restart `node scripts/serve.mjs 43831` when the URL refuses the connection.
- Public output is `dist/`.
- Hosting manifest: `.openai/hosting.json`.
- Existing Sites project: `appgprj_6aa83001d03481918d4a13e46c9612fb`.
- Existing production URL: `https://weave-foundation.notbrandon175.chatgpt.site/`.
- The checkout contains substantial uncommitted development work. Do not reset, discard, or replace it. Inspect diffs narrowly before editing.
- The local build may be newer than the deployed Site until the next verified build is published.

## 5. Standing publication instruction

The user now wants website updates pushed to ChatGPT Sites from this point forward. This is standing authorization for completed, internally verified build updates to this existing Site.

For each coherent build:

1. Finish the bounded implementation.
2. Run focused internal checks and provide or verify the local preview.
3. Do not deploy a planning-only state, partial migration, or known broken build.
4. Use the existing Sites project and preserve its current audience.
5. Follow the native Sites publishing workflow: configure the execution profile, build only when source changed, commit and push the exact source revision, package the matching output, save/deploy the matching version, and wait for a terminal deployment result.
6. Return the literal successful production URL.

Do not create a replacement Site or change its audience unless the user explicitly asks. Never publish to the preserved original Weave or Tangent projects. The configured rebuild project is the only deployment destination.

This standing authorization supersedes older notes saying publication requires another user confirmation. Runtime access checks still apply. A failed deployment is not success; report the user-visible blocker and preserve the last working Site.

## 6. What currently works and must be preserved

- Square boundary creation and custom boundary editing.
- Direct preset application and reusable weave foundations.
- Independent, stable family identities and family metadata.
- Family spacing, rotation, offset, density, width, outline weight, and visual hierarchy foundations.
- Multiple attractor, repeller, and deflector influences with per-family response controls.
- Continuous thread presentation and display-only over/under occlusion.
- Named crossing rules, family and pair relationship foundations, and manual local crossing overrides.
- Automatic saving, Undo/Redo, reload, transactional recovery, portable backup, and schema migration foundations.
- Project, Boundary, and Weave library foundations.
- Existing geometry certificates, clipping rules, source identities, workload limits, and compact-codec requirements.
- Separate family organization needed for later SVG and DXF export.

Do not reopen settled R1 geometry or weaken established correctness thresholds merely to make stabilization easier.

## 7. Current defects and architectural diagnosis

The recurring defects are related rather than isolated:

- A slider preview can work while its release commit restores older geometry.
- Family spacing or influence strength can appear not to update after release.
- Adding influences can fail with a portable-backup capacity message.
- Simple changes can feel slow because they rebuild, validate, serialize, and save too much state.
- Preview state, committed geometry, saved weave revisions, and portable-capacity admission have competed as sources of truth.
- Derived geometry has historically been retained in too many immutable snapshots.
- Old worker completions or stale browser tabs can attempt to replace newer state.
- The interface reflects internal data structures more than the user's creation sequence.

The last confirmed storage root cause was hidden immutable weave-revision growth. A valid field preview was followed by a rejected save at the 10 MiB portable limit; restoring the last committed geometry looked like a control snap-back. Publishing alone does not remove this limit because it is an application contract.

Recent bounded autosave work reduced a measured active project from roughly 2.45 MiB and 102 revisions to roughly 376 KiB and 6 revisions. It also added historical-root recovery and current-snapshot pruning. A transient compaction bug initially assigned one active payload to multiple weaves; it was corrected and a multi-weave exact-payload test was added. Preserve that correction.

## 8. Required architectural pivot

Create one canonical weave source document containing durable user decisions. Generated paths, deformation samples, crossing caches, render fragments, and SVG markup are derived products. They may be cached but cannot be authoritative.

Use one deterministic pipeline:

`canonical weave → family geometry → field deformation → crossing resolution → later contact/tension → render or export`

Preview, release commit, reload, recovery, and export preparation must use the same validated parameters and calculation stages. A release must commit the exact final preview value.

Separate immediate editing from persistence:

- update the in-memory document immediately;
- render the accepted preview;
- debounce compact background autosave;
- report backup failure separately;
- never reverse a valid visible edit solely because backup admission failed.

Use dependency-based recalculation:

- appearance change → render only;
- family geometry change → that family, affected influences, and affected crossings;
- influence change → affected family deformation and crossings;
- crossing-rule change → crossing presentation/resolution;
- rename or library reorganization → no geometry work;
- boundary replacement → complete applied-weave regeneration.

Every asynchronous request needs a monotonic identity. Only the latest eligible request can update the visible canvas or committed derived result.

## 9. Protected workflows

Every phase must preserve:

1. Create a boundary and apply a preset.
2. Change family spacing, rotation, width, and hierarchy.
3. Add several influences and edit radius, strength, tension, type, position, and per-family response.
4. Apply an over/under rule and manually change one eligible crossing.
5. Reload, switch boundaries, return to the weave, and recover the exact accepted state.

These are product acceptance flows, not just unit-level implementation details.

## 10. Stability Foundation phases

Follow document 96 exactly:

- Phase 0: freeze and baseline.
- Phase 1: canonical weave document.
- Phase 2: unified editing and recalculation.
- Phase 3: compact background autosave.
- Phase 4: incremental performance.
- Phase 5: workflow and library simplification.
- Phase 6: stabilization verification.

Do not begin Build 1B feature expansion before the Stability Foundation is accepted. Do not combine all phases into one unreviewable rewrite.

## 11. Exact next action

Begin Phase 0 only:

1. Inventory the durable user decisions and every current duplicate/transient representation.
2. Trace the five protected workflows through UI state, document transforms, worker requests, storage preparation, and rendering.
3. Create compatibility fixtures from current saved projects, multi-weave projects, influenced weaves, family rules, and manual overrides.
4. Record baseline bytes, revision counts, generation time, worker time, render time, commit time, and reload behavior.
5. Identify which existing tests protect the current contracts and which assertions are stale.
6. Produce the Phase 0 report before restructuring production code.

Phase 0 is allowed to add fixtures, diagnostics, and documentation. It should not redesign the UI or change saved behavior. Because it does not alter the public application, Phase 0 is not deployed to ChatGPT Sites. A missing Sites plugin must not block Phase 0 completion. Publishing resumes with the first coherent, internally verified application build produced by a later phase.

## 12. Verification rules

- Use focused automated checks inside Codex during ordinary batches.
- Use the local preview for manual visual acceptance while development is incomplete.
- Do not ask the user to run routine PowerShell checks.
- Reserve one bundled external host-browser run for a major checkpoint, an actual host-only application defect, or when required before a significant public release.
- Preserve completed evidence and rerun only affected proofs.
- Never weaken geometry, storage, recovery, workload, or failure requirements to obtain a pass.
- An old `r1b.test.mjs` assertion expects schema 5 while the current schema is 6. Treat it as known stale verification until reviewed; do not claim the complete legacy suite passes.
- R1 is development-complete. Its unfinished full host run is deferred verification debt from verifier-only failures, not a blocker to feature development.

## 13. Performance and failure behavior

- Appearance changes should feel immediate.
- Ordinary family and influence edits should begin visual feedback within one frame when possible and generally settle near 150 ms.
- Longer work must leave the interface responsive and show a clear calculating state.
- Existing formal maximums remain unchanged unless a separately reviewed contract changes them.
- Calculation failure retains the last valid drawing.
- Persistence failure retains the accepted in-memory edit and clearly reports that backup is pending or failed.
- Stale worker, stale tab, or older request results cannot overwrite newer accepted work.

## 14. Interface principles

- Make the primary task visible in the first viewport.
- Preserve the established three-column working layout and collapsible right control rail unless evidence supports a better bounded change.
- Order controls by the user's decision: choose target first, then choose behavior, then refine advanced values.
- Use plain names. Explain an unfamiliar mode in one short sentence beside it.
- Every number slider also supports direct typed entry.
- Selection must be visually obvious; clicking empty workspace deselects.
- Keep selected-attractor highlighting light and proportional.
- Hide internal recovery and revision structure.
- Do not introduce extra Save/Update buttons when autosave already defines the behavior.

## 15. Crossing and later physics context

The intended rule precedence is:

1. Manual crossing override.
2. Family-pair relationship rule.
3. Preset construction rule.
4. Global repeat or seeded structured variation.

Planned automated modes include Preset Construction, Alternating 1/1, Two Over/One Under, configurable grouped repeats, family relationship rules, and deterministic seeded variation with balance and maximum-run constraints.

Visual family hierarchy remains separate from physical crossing order.

Later contact behavior should model the lower thread as restrained at an upper-thread crossing. Nearby restraints define constrained spans; effective tension can depend on base tension, contact spacing, crossing angle, curvature, and adjacent restraint count. Attractors remain external forces; crossing contacts become internal constraints. Do not implement this solver until crossing relationships are dependable.

## 16. Data and export context

Families must remain independently organized after influences and crossing resolution. Future exports must be able to produce:

- one selected family;
- multiple selected families;
- the complete weave;
- centerline or outlined-thread SVG;
- DXF geometry with stable family/layer identity.

Do not flatten all families into a single anonymous render asset. The canvas is a view, never the geometry authority.

## 17. Important implementation surfaces

The current public application lives in `dist/`. Important modules include:

- `app.mjs`: UI orchestration and edit flows;
- `document.mjs`: workspace, revisions, save transforms;
- `storage.mjs`, `storage-codec.mjs`, `storage-worker.mjs`: transactional storage and portable encoding;
- `weave.mjs`, `carrier.mjs`, `combined.mjs`: weave and influenced geometry;
- `r1b-worker.mjs`: heavy field calculation;
- `family-domain.mjs`: stable family metadata;
- `influence-controls.mjs`, `edit-draft.mjs`, `numeric-inputs.mjs`: editing adapters;
- `interlacing.mjs`, `weave-rules.mjs`, `crossing-worker.mjs`, `weave-occlusion.mjs`: crossing detection, rules, and presentation;
- `project-library.mjs`: project/boundary/weave presentation;
- `thread-appearance.mjs`, `weave-render.mjs`: visual thread presentation;
- `stitch*.mjs` and `line-presets.mjs`: preset and stitch source/intent foundations.

Do not assume module boundaries are correct merely because they exist. Phase 0 should identify hidden coupling before Phase 1 changes ownership.

## 18. Working-tree safety

The checkout has many modified and untracked files representing the current development state. Do not use reset, clean, checkout-overwrite, bulk deletion, or a replacement scaffold. Do not revert unrelated fixes. Use narrow diffs and preserve user data compatibility. The source-preservation remote is not the deployment destination; the configured rebuild remote and Sites project are.

## 19. Phase reporting contract

After every build report exactly:

1. Current phase.
2. What was developed visibly.
3. What changed internally.
4. What remains in the phase.
5. Focused checks run and their result.
6. Exact visual tests for the user.
7. The deployed ChatGPT Sites URL when deployment succeeds.
8. What comes next.

If the phase is complete, say `ready for the next phase`.

When the Stability Foundation and all remaining Build 1 phases are complete, say `Build 1 complete`.

If the user replies `approved, keep working`, continue directly to the next scheduled phase.

## 20. First message for the new build chat

Use this concise instruction with the new chat:

> Read `AGENTS.md` and documents 95, 96, and 98 in the Weave Generator rebuild checkout. Begin Stability Foundation Phase 0 only. Preserve the current working tree and all existing product behavior. Produce the compatibility fixtures, dependency inventory, five protected workflow baseline, storage/revision measurements, performance measurements, and stale-test audit described in document 98. Do not restructure production code until the baseline can detect regressions. Run focused checks inside Codex. Phase 0 is diagnostics and fixtures only, so do not publish it and do not let missing Sites tooling block completion. Publish the first later coherent application build under the standing authorization once Sites tooling is available. Report exact visual tests, remaining work, and the next phase.
