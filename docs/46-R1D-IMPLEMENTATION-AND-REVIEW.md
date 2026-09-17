# R1D implementation and review

Date: 2026-09-16  
Build: `WF-R1D-20260916`  
Status: functional vertical slice complete; focused verification passed; visual review and R1 phase certification remain

## Visible implementation

- Up to eight simultaneous Attractor, Repeller, or Deflector influences.
- Selectable influence list with live count and enabled state.
- Add, Duplicate Active, Enable/Disable, Reset, Remove, Undo, and Redo.
- The selected influence owns the live controls and direct center, radius, and direction handles. All guides remain visible; inactive guides are subdued and expose no handles.
- Each influence retains independent Family A/B Strength and Tension.
- Seeded Spacing Variation contains independent Family A/B Amount sliders, a Seed slider, New Seed, and Reset Variation.
- The existing Source/Derived/Guide display, lower-right Display menu, themes, status, saves, board tree, backups, and exports remain available.

## Model and geometry

R1D introduces `weave-study-v5`, `combined-influences-v1`, `strand-offset-v1`, `derived-combined-v1`, and `r1d-worker-v1`. Influence contributions are evaluated independently from the same varied source point and summed in stable ID order. UI selection order does not affect geometry.

Variation shifts each source strand along its family normal by at most 20% of spacing, keyed by unsigned seed, family, and stable `k`. Amount zero preserves source coordinates. Adjacent same-family source strands retain at least 60% nominal separation.

The evaluator sums conservative displacement and curvature bounds, encloses the ordered contribution sum, retains the approved epsilon rule, and uses the existing analytical clipping, fragment separation, provenance, certificates, and workload ceilings. A ninth influence or invalid/oversized input fails before mutating the working state.

Existing v1-v4 revisions remain version-dispatched. The first R1D edit promotes only the working copy while preserving stable influence identity and family values. Compact payloads, transactional IndexedDB commits, immutable revisions, recovery, portable JSON, atomic failure, pending display, cancellation, and stale-result rejection remain active.

## Verification

Focused module syntax and 48 checks passed. Coverage includes:

- opposing-field cancellation and mixed overlap;
- exact permutation invariance for geometry and fingerprints;
- family-specific field controls;
- seed repeatability, changed-seed difference, A/B independence, and separation bounds;
- add/duplicate/remove and the eight-field limit;
- invalid record and atomic rejection;
- v4-to-v5 promotion;
- worker protocol and compact payload;
- immutable save/restore, portable backup, and exact codec round trips;
- R1C compatibility, UI discoverability, display presets, bounded SVG rendering, and concave fragment gaps.

Served build identity and required R1D controls passed static preview inspection. The focused browser fixture is updated for two influences, variation, direct manipulation, save, and reload. The managed host cannot launch Chrome because of the established `spawn EPERM` restriction, so visual acceptance uses the running preview.

Preview: `http://127.0.0.1:43830/?r1d=20260916`

## Remaining checkpoint

R1D functionality is complete. R1 remains open until visual acceptance and the broader R1 phase checkpoint run the existing browser worker/end-to-end/render/long-task gates plus relevant storage, migration, recovery, capacity, and complete regression checks against v5.

After that checkpoint, R2A adds complete crossing detection, stable crossing identities, endpoint/tangent/coincident diagnostics, and a simple Analysis layer. It does not add over/under behavior until R2B.
