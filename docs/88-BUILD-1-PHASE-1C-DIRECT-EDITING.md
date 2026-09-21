# Build 1 Phase 1C — direct selection and live editing

Build: WF-B1-P1C-DIRECT-EDITING-20260918.

## User-visible corrections

Selecting any built-in preset or My Saved Patterns entry immediately applies a new independent pattern to the current boundary and saves it. The Create Weave Pattern button is removed. The selector returns to a prompt so the same preset can be selected again intentionally. Previous saved patterns remain intact.

All newly selected presets, including Custom Line Families and saved line recipes, create an immediately visible identity weave with woven overlaps enabled. Show Woven Overlaps is under Display. Existing saved explicit display/rule settings retain their meaning until edited; no silent data migration occurs.

The redundant Pattern Name input is hidden; Rename remains in the left library. Family Name + Export is renamed Family Details and remains optional/collapsible.

## Editing and reliability

The old input path repeatedly cloned complete project history. Pattern input prepared a saved source revision for each transient candidate, and completed worker previews could append permanent geometry revisions before pointer release.

Editable drafts now copy mutable working metadata and library containers while retaining immutable saved revisions and certified geometry by reference. The adopted functions never mutate shared geometry or historical snapshots. Certification, compact encoding, identities, versioning, portable bytes, and the 10 MiB ceiling are unchanged.

Intermediate worker requests validate their response and render a certified preview without writing storage or recording Undo/history. Completed gestures use the existing atomic commit path and one saved revision. Transient pattern candidates start from committed library ancestry, avoiding chains of abandoned preview revisions. Numeric handlers consume the captured typed value.

Cancel/failure clears transient geometry and redraws the committed result. Supersession aborts any in-flight transaction controller. Add Influence checks storage freshness before building its candidate. Errors also appear directly in Field Forces.

## Verification

67 focused tests pass, including frozen historical records, untouched committed portable bytes across 100 preview candidates, append-once final saves, execution of the actual worker preview/cancel branches, field/source editing, family rules, geometry/compact round trips, typed values, and stale-tab protection. Syntax and static entrypoint checks pass.

Managed-browser verification on an isolated local origin:

- Square Grid selection created a visible saved weave with no Create button.
- Add Influence succeeded: worker 26.1 ms, total 86.2 ms.
- Family spacing changed to 42 with the influence retained: worker 15.0 ms, total 109.9 ms.
- Strength changed to 73: worker 11.9 ms, total 111.5 ms. Those two edits added two weave revisions and only one source revision.
- Double Herringbone selection and Add Influence succeeded. Pattern spacing 70 with an active influence saved in 200.7 ms total / 104.0 ms worker and survived reload.
- My Saved Patterns selection retained spacing 42, created a visible independent weave, enabled woven overlaps, and accepted Add Influence in 107.5 ms total / 21.3 ms worker.
- Undo removed that influence from the working result; Redo restored it.
- Display's woven checkbox removed and restored the continuous-woven SVG group.

An edit-preparation-only diagnostic with 100 retained revisions and 30 samples measured full-clone median/p95/max 2.6601/3.0215/3.1045 ms versus immutable-edit-copy 0.0209/0.0256/0.0373 ms. These are focused samples, not whole-application performance certification.

The managed main workspace was readable, not storage-blocked, and used 1,605,176 of 10,485,760 portable bytes with no unreferenced records/payloads. The previously reported Add Influence failure was not reproduced in that available workspace; do not claim an independently proven cause for the user's earlier failure. An existing older open tab also successfully added its influence (253.3 ms total). No data was cleared or quota increased.

## Status

Remain in Build 1 Phase 1C correction for user review. Phase 1D structured seeded crossing variation and Phase 1E checkpoint remain; Build 1 is incomplete. Historical verification debt and failures remain preserved. No publication or external host run.

Preview: http://127.0.0.1:43831/?b1-p1c-direct-editing=20260918
