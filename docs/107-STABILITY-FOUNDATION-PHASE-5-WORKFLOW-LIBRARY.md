# Stability Foundation Phase 5 — workflow and library simplification

Date: 2026-09-21  
Build: `WF-STABILITY-P5-WORKFLOW-20260921`  
Status: complete and ready for publication and user review; Phase 6 has not started.

## Result

The left workspace rail now presents Projects, Boundaries, Applied Weaves, and the reusable Weave Library as four distinct concepts. Applied Weaves are scoped to the current boundary. The Weave Library contains reusable definitions from the project and identifies the boundary where each weave was developed. Reusing a weave applies its newest saved revision to the current boundary, including the current family settings and influences.

The header now labels the current Project, Boundary, and Weave independently. Existing immediate preset application, default woven overlaps under Display, family-first controls, plain labels, and progressively disclosed crossing controls remain in place. No storage concepts were added to the product workflow.

The compatibility model is unchanged. Reuse still goes through the existing boundary adaptation and canonical calculation pipeline. Existing projects, revision records, geometry, identities, histories, and portable fixtures are not migrated or rewritten.

## Verification

- Phase 5 focused suite: 43/43 passing.
- Frozen Phase 0 baseline: 8/8 passing.
- All changed modules pass syntax checks.
- Static entrypoint/reference and `git diff --check` checks pass.
- A broad preservation run passed 172/176 checks. The four failures are previously recorded historical assertions: one stale test VM helper, one legacy open-group rendering expectation, one schema-5 expectation against the established schema-6 format, and one obsolete raw-SVG path-closure expectation. Phase 5 does not touch those contracts or weaken a gate to satisfy them.

Evidence is retained in `docs/evidence/stability-phase5/`.

## Managed browser review

The full Phase 5 exit route was completed from a new empty project:

1. Created project `P5 WORKFLOW REVIEW` and boundary `BOUNDARY 01`.
2. Applied the triangular preset immediately. It produced three families and 31 strands with woven overlaps enabled.
3. Added an attractor; the influenced result saved automatically and completed in 20.8 ms of worker work.
4. Changed Family A spacing to 64; the accepted result saved and completed in 14.9 ms of worker work.
5. Created `BOUNDARY 02` and reused the selected library weave.
6. The copied weave retained spacing 64 and one influence, adapted to the new boundary, and produced 29 strands in 31.0 ms of worker work.
7. Reload restored the project, both boundaries, both applied weaves, the selected copied weave, spacing 64, one influence, the woven presentation, and a clean autosave state.

The route also exercised selection of an older library revision after editing. Library application now resolves that selection to the newest revision of the same reusable weave before copying it, preventing a visually selected row from applying stale settings.

## Next

Phase 6 is stabilization verification. It has not started.
