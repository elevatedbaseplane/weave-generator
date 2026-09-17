# R1 checkpoint — selected-attractor verifier repair

2026-09-17. Scope: diagnose the selected-attractor timeout, repair the appropriate code, preserve completed checks, run focused internal checks. No SP1 or publication.

## Cause and classification

**Verifier defect**, reproducing the product's intentional workspace deselection behavior. Dense setup selected the influence list item and then clicked Fit. Fit is inside `.workspace`; its pointerdown bubbles to the existing handler, which deselects influences unless the target belongs to an influence guide. The subsequent `.attractor-center.active` locator therefore had no match. This behavior implements the user's earlier request that workspace clicks deselect; it is not evidence that adding or selecting an influence is broken.

A second verifier race contributed unreliable setup: board selection awaits asynchronous persistence, but the old helper waited only for absence of CALCULATING. That is not a board-restoration completion signal. The preserved final status is BOARD RESTORED, compatible with restoration finishing after later fixture actions. The recorded stage was also stale (authoritative tab edit rather than dense fixture selection).

## Changes

- New `scripts/r1-checkpoint-selection.cjs` waits for BOARD RESTORED, verifies the active board and source field identity, opens Field Forces, explicitly enables guides, fits the view, and **then** selects the field through its visible list.
- Verifies the selected list state, exactly one active center, matching field identity, visibility and bounds before dragging. Missing selection now raises a specific assertion rather than a 30-second bounding-box timeout.
- Browser verifier records dense import/selection/per-cycle stages accurately. No timeout, numerical, workload, storage or timing threshold was raised.
- `--resume-dense` inherits the 14 completed checks, 17 cycles, default/pending timings and raw timing evidence from the exact prior report. SHA-256 and production-file hashes guard reuse. It executes only the unfinished dense fixture and final timing/long-task verdicts. The normal full-suite mode remains available for a future justified checkpoint.
- The single host wrapper now selects this resume mode. It does not rerun migration, recovery, capacity, worker proofs or the completed functional checks.

No file in dist changed. No change to selection UI, geometry, storage, build identifier or local preview is needed.

## Focused evidence

`tests/r1-checkpoint-selection.test.mjs` executes the actual workspace deselection handler extracted from app.mjs inside a small VM harness, together with the real verifier preparation helper. Four tests pass:
1. The old select-then-workspace-click sequence clears the active ID.
2. The repaired sequence waits for restore, reveals guides, fits, then selects successfully.
3. A missing visible field produces a specific fixture assertion.
4. A guide belonging to a different field fails before dragging.

These are focused handler/fixture tests, not a browser layout or performance pass. The normal Node test child process was blocked by spawn EPERM; its log is preserved. The same tests passed in Node's supported non-isolated mode. Both changed JavaScript verifier modules pass syntax checking. All recorded production-file hashes still match the SP0 baseline.

Original host report remains unchanged:
`docs/evidence/r1-checkpoint-20260917/browser-2026-09-17T18-17-46-862Z.json`
SHA-256 `3A881397AA06E5DF7168F95D0E98B38631524FEB864D9730CC50A65F54568E76`.

New focused logs: `selection-focused-tests.log` (4/4 pass), `selection-tests-spawn-blocked.log` (environment restriction). No complete browser suite or unrelated proof was rerun.

## Remaining checkpoint

One final bundled host run is still required for the **major R1 phase checkpoint**, because the 30-cycle dense browser workload and its final authoritative verdict were never reached. The managed environment previously refused Chrome process creation; this repair does not claim a browser pass from mocked geometry/layout. The unchanged command now resumes only the unfinished work:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\notbr\Documents\Codex\2026-09-14\confirm-you-have-editable-terminal-access\work\weave-rebuild\scripts\verify-r1-checkpoint-browser-only.ps1"
```

Ordinary feature batches continue to use internal checks and a usable local preview. Stop on any actual checkpoint gate failure; do not launch SP1 or publish until the R1 checkpoint is resolved.
