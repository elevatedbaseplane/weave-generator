# Stability Foundation — core product and architecture rules

Date: 2026-09-20

Status: approved direction for the next build sequence. This document contains lasting rules. The temporary implementation sequence is in document 96, and the current handoff is in document 97.

## Product objective

The tool is a weave generator. It must let a user create or select a boundary, apply or reuse a weave, edit independent thread families, apply field influences, control crossings, and later export families separately or together. Technical rigor must make this workflow simpler rather than expose more steps.

The primary user model is:

`Project → Boundary → applied Weave`

A reusable saved weave can be applied to another boundary and regenerated to fit it. An applied weave belongs to its boundary. Internal revisions, result records, caches, certificates, and recovery roots must not appear as user library objects.

## Canonical document

Each weave has one authoritative source document containing durable user decisions:

- stable weave identity and boundary reference;
- preset or recipe identity;
- independent family definitions and stable family identities;
- spacing, rotation, offset, density, and thread appearance;
- influence definitions and per-family responses;
- crossing modes, family-pair rules, and manual overrides;
- user-facing display preferences that belong to the weave.

Generated paths, deformed samples, crossing caches, render fragments, worker products, and SVG markup are derived data. They may be cached for performance, but they must be replaceable and must never become a competing source of truth.

## Editing and calculation

- Preview, release commit, reload, recovery, and export preparation use the same deterministic calculation stages.
- A final commit uses the exact accepted preview parameters; it must not reconstruct the edit from another transient snapshot.
- Direct canvas edits, sliders, and typed values use the same validated parameter-update path.
- Recalculate only affected dependencies when possible. Renaming or library organization never regenerates geometry.
- A family edit preserves and reapplies its influences and crossing rules.
- Worker requests carry monotonic identities. An older completion cannot overwrite a newer edit.
- Failure keeps the last valid visible result and explains which calculation failed.

The intended pipeline is:

`canonical weave → family geometry → field deformation → crossings → contact/tension behavior → render or export`

Contact/tension remains a later bounded build. The stabilized pipeline must leave a clear insertion point without implementing that solver now.

## Persistence and recovery

- The in-memory working document updates before background persistence.
- Autosave is debounced and compact. It stores source decisions rather than repeated derived geometry whenever compatibility permits.
- A backup or capacity failure cannot silently reverse a valid visible edit.
- Undo history, transactional recovery, and portable project data are separate responsibilities.
- Named weaves retain a current compact snapshot. Hidden autosave ancestry must not grow without a defined bound.
- Existing saved projects, identities, migrations, geometry contracts, recovery behavior, and portable backup requirements remain compatible.
- The 10 MiB portable-backup ceiling remains a product contract until separately reconsidered; publication does not remove it.

## Family independence

Every thread family remains independently identifiable after boundary fitting, field deformation, crossing resolution, and rendering. Family identity must support future per-family SVG and DXF export. Visual hierarchy does not determine physical crossing order.

## Interface rules

- Selecting a preset or saved weave applies it directly to the active boundary and shows a visible status.
- The common workflow is Boundary → Weave → Families → Influences → Crossings → Export.
- Controls use plain effect-based labels and are ordered by the decision the user makes.
- Advanced controls remain collapsed until their parent feature is being edited.
- Every accepted parameter change gives immediate canvas feedback and remains applied after release.
- Saving is automatic and quiet during normal work.
- If a proposed architecture adds required steps, technical settings, or confirmation buttons to ordinary creation, redesign it.

## Protected workflows

Every ordinary build must preserve these five workflows:

1. Create a boundary and apply a preset.
2. Change family spacing, rotation, thread width, and visual hierarchy.
3. Add several influences and change radius, strength, tension, type, position, and per-family response.
4. Apply an over/under rule and manually change one eligible crossing.
5. Reload, change boundaries, return to the weave, and recover the exact accepted design.

## Verification and delivery

- Use focused automated checks and the managed local preview during ordinary batches.
- Preserve established geometry, storage, recovery, failure, workload, and correctness requirements.
- Do not replace a valid product check with a weaker assertion.
- External host-browser verification is reserved for a major checkpoint, an actual host-only application defect, or the final pre-publication certification. Bundle required host checks into one command.
- The user has given standing authorization to publish completed website updates to the existing ChatGPT Sites project. After a coherent build passes its focused internal checks, publish it, preserve the current site audience, verify deployment completion through the native Sites workflow, and return the production URL. A local preview remains the working acceptance surface while implementation is incomplete.
- After each phase, report: current phase, visible and internal changes, remaining phase work, checks run, exact visual tests, and the next step.
- Say `ready for the next phase` only when the current phase is complete.
- Say `Build 1 complete` only after the Stability Foundation and the remaining approved Build 1 feature phases are complete.
