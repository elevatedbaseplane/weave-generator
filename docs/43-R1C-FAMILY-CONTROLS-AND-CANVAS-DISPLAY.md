# R1C family controls and canvas display review

> Superseded review build: document 44 adds the missing Field Forces save action without changing this build's family-control or display contracts.

Date: 2026-09-16  
Build: `WF-R1C-FAMILY-CONTROLS-20260916`  
Status: implemented locally; focused checks passed; visual acceptance pending

## Product change

The active influence now has independent **Strength** and **Tension** settings for Family A and Family B. The Field Forces section contains a clear A/B selector and states which family the two sliders edit. Influence identity, type, center, radius, direction, falloff, and enabled state remain shared. This retains one directly manipulated influence while allowing either family, or both families with different settings, to respond.

Display presets and the most useful layer switches are also available from a collapsible **Display** menu at the lower-right of the canvas. The menu controls the same display state as the right rail; both surfaces stay synchronized and neither changes geometry.

## Durable contract

New or edited influence studies use `weave-study-v4`, `family-influence-v1`, `derived-influence-v2`, and `r1c-worker-v2`. Each family record contains exactly `strength` and `tension`. Existing v2/v3 studies remain valid and unchanged when loaded. The first edit promotes only the working copy to v4, copies the previous strength and tension into both families, and preserves the influence identity. Immutable saved revisions are not rewritten.

The approved equations, compact support, interval certificates, analytical clipping, coordinate/provenance identity, limits, compact payloads, IndexedDB transactions, backup ceiling, atomic commit, and stale-result behavior remain in force. The derivation computes certification bounds separately for each family and uses the larger family displacement only for conservative source enumeration.

## Verification

- Focused R1C geometry, worker, revision, UI, display, and bounded-render checks: 28/28 passed.
- Compact codec, immutable revision, portable backup, admission, and exact round-trip checks: 10/10 passed.
- Static module syntax and served build identity passed.
- A focused browser smoke fixture now covers independent family controls and the lower-right Display menu. Managed Chrome launch remained blocked by the known host `spawn EPERM` restriction before navigation; manual visual acceptance uses the running preview.

Preview: `http://127.0.0.1:43830/?r1c-family-controls=20260916`

R1C remains the active review batch until visual acceptance. R1D multiple simultaneous influences and seeded variation remains gated; R2 has not started. No publication occurred.
