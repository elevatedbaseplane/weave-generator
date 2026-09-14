# Phase 2A local verification

Build `WF-2A-20260914` implements the approved rectangular A/B carrier contract at source commit `002ae94dacade531deb6c88a1414fbe6367b8356`. It is complete in the Foundation checkout and has not been published. The private live Site remains accepted Phase 1B version 2.

## Settled implementation

- Stable rectangular carrier identity with perpendicular A/B source families, shared rotation, and independent spacing, signed offset, integer density, and visibility.
- Analytical clipping against the authoritative polygon. Concave gaps remain separate fragments; tangencies and boundary-collinear spans do not become interior carrier paths.
- Stable source path keys use board, carrier, family, and signed integer index. Derived fragments are scoped by the canonical geometry fingerprint and interval index. Derived paths are recalculated rather than persisted.
- Deterministic nested density selection retains exactly `d` signed index slots in each block of 100 without renumbering source paths.
- Immutable named Carrier Study revisions capture the complete boundary snapshot, boundary revision ancestry, carrier recipe, and derivation versions. Restore replaces boundary and carrier together in one undoable operation.
- Workspace schema 3 accepts schema 2 and schema 3 backups. The canonical browser key remains unchanged. Before the first schema 3 write, an exact schema 2 value is written once to the dedicated immutable recovery key; failure aborts the workspace write.
- Candidate, interval, line-edge, tolerance, scale, and recipe limits reject the entire edit or import before persistence. View toggles use cached derived geometry and do not trigger regeneration.

## Verification results

- 28 automated tests pass: the 17 accepted foundation checks plus 11 carrier checks. Carrier coverage includes exact 500-square counts and endpoints, rotation, independent controls, negative-index density, concave U clipping, winding, tangency/collinearity, fingerprints and stable identities, hard limits, immutable study restore, schema migration and recovery failure, and a 30-run performance sample.
- The representative 400-line/100-edge workload completed 30 warm derivations in about 231 ms total in the verification run; its measured p95 stayed below the approved 100 ms target.
- Every public module passes syntax validation. The static entrypoint, local asset references, public-output exclusion, rebuild-only target, and Git whitespace checks pass.
- Local browser verification passed on the existing Phase 1B browser data: schema 2 opened as schema 3, the default 500 square showed 9/9 available and retained in each family, A density changed to 1/9 while B stayed 9/9, A/B visibility changed without increasing the derivation counter, a Carrier Study saved and survived reload, the saved title state was clean, and the browser console had no errors.
- Visual inspection confirmed the clipped A/B paths, boundary, controls, saved Carrier Study entry, Phase 02A labeling, and deferred-feature footer at desktop size.

## Remaining uncertainties and boundary

The implementation has not been exercised on the hosted origin, so live storage migration, owner-browser backup transfer, responsive rendering, and production asset identity remain pending release verification. The explicit publish gate remains closed. Phase 2B, fields, interactions, stitches, interstices, exports, non-rectangular carriers, independent family directions, and irregular or seeded selection remain outside this batch.

## Next bounded batch

After explicit publication approval, publish only commit `002ae94dacade531deb6c88a1414fbe6367b8356` to the existing owner-private Weave Generator — Foundation Site, preserve owner-only access, verify the deployment and exact source identity, then stop for live acceptance. This release batch follows established decisions and needs routine release reasoning; it does not need substantial architectural reasoning.

The five live acceptance tests remain:

1. On a 500 square, create the carrier and show A and B. Confirm nine horizontal A paths and nine vertical B paths, then change spacing and rotation.
2. Apply the documented concave U coordinates and confirm a crossing line appears as separate arm fragments with no bridge across the notch.
3. Lower and restore A density. Confirm B is unchanged, and toggling visibility or resizing the browser does not move the paths.
4. Save two revisions under one Carrier Study name, restore the older revision, then Undo and Redo. Confirm boundary and carrier return together.
5. Reload, download a JSON backup, and import it in another owner-authenticated browser. Confirm the working carrier and immutable study revisions survive.

Exhaustive invalid-geometry, tolerance, quota, conflict, migration-failure, and limit rejection checks remain automated.
