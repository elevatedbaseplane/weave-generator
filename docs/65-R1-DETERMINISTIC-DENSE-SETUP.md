# R1 dense setup verifier correction

2026-09-17. Verifier-only repair. R1 remains pending; no SP1, application change or publication.

## Evidence and cause

Preserved `docs/evidence/r1-checkpoint-20260917/browser-2026-09-17T19-44-59-213Z.json` byte-for-byte, SHA-256 `16b4d6615434aeb5fe58c637ea9977fb6542bc24ae9e5e82ba44adfbb9ae3eed`.

The reported stage was stale: dense import, board restore, guide visibility and selection had completed. `denseSelection` contains the correct board and field IDs plus visible handle bounds; final status was `ACTIVE ATTRACTOR SELECTED.`. The stack identifies `prepareDenseViewport`, not board selection. The wheel setup awaited a scale within1e-12 of2; actual scale was2.000000028858911 with cy0.12037037397773415. Replaying float32 conversion of the native wheel delta reproduces that scale exactly. Native wheel input also quantized the anchor. This is a verifier setup failure; it does not demonstrate a product defect. No dense measurement cycle began.

The previous pointer repair's idealized mock did not model native wheel conversion. Its passing test was insufficient; it is replaced by integration coverage of the actual production wheel and pointer-up handlers and a regression based on this raw host result.

## Correction

For view setup only, dispatch a double-precision DOM WheelEvent through the existing application wheel handler, anchored at the SVG viewBox center. This avoids the native wheel transport conversion. It does not write application state, generation inputs or geometry directly. The measured30-cycle interactions still use native mouse down/move/up. No geometry, count, certificate, timing, storage or workload requirement changes.

Read the resulting view immediately after synchronous event dispatch. Require the document anchor to remain unchanged and both x0/x1 targets to round-trip through native float32 pointer coordinates and the production six-decimal input conversion exactly. Fail immediately with before/after view, target scale and canvas dimensions if setup cannot meet that condition. There is no zoom polling timeout or relaxed comparison tolerance. Use SVG viewBox dimensions consistently for target calculation.

Selection setup reports separate stages: board restore; show guides and Fit; select influence and verify guide; exact pointer viewport. Board-restoration wait remains bounded (10seconds) and targets the actual `BOARD RESTORED.` transition. Final failure evidence includes status, section-open and guide-toggle state, selected list identities, active handle coordinates and SVG viewBox. No speculative retries or silent continuation.

## Focused verification

13/13 focused tests pass. Coverage includes actual production deselection/wheel/pointer-up handlers, board restore ordering, all selectors and expected status text in current source, missing/wrong/hidden guides, failed restoration, missing wheel handling, captured native wheel drift, integer/half/fractional viewport sizes, immutable setup geometry and exact final x0/x1 requests. Exact dense count checks still pass and reject altered workload/counts. Verifier/module syntax and source/evidence guard pass; all14 preserved checks remain inherited.

`tests/r1-dense-setup.test.mjs` runs production handlers in a deterministic VM with a modeled DOM/Playwright interface. This is not a live browser test. Previously successful import/restore/selection is established by the preserved host record; the integration harness validates the full post-import setup sequence and negative diagnostics. Chrome launch remains unavailable from the managed shell (prior spawn EPERM evidence); repeating that launch or unrelated proofs would not add coverage. Summary/hashes: `docs/evidence/r1-checkpoint-20260917/deterministic-setup-review.json`.

One final bundled host command remains necessary for actual30-cycle browser performance acceptance: `scripts/verify-r1-checkpoint-browser-only.ps1`. It preserves the14 completed checks, measures the fresh default/pending smoke and dense workload, and stops on the unchanged acceptance gates. No R1 acceptance or p95 claim is made before that succeeds.
