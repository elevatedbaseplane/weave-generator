# Build 1 Phase 1C — immediate preset application

Build: `WF-B1-P1C-PRESET-APPLY-20260918`

## Reported workflow

With Boundary 02 selected and no attached weave, choosing Triangular grid left the preset label selected while the canvas and Weaves list remained empty. The user workflow was correct.

## Correction

- The preset selector now starts application on the immediate native `input` event and retains `change` as a fallback.
- The selected value is captured before asynchronous storage and geometry work, so redraw cannot replace the intended preset.
- A visible live region directly below the selector reports applying, applied and saved, or the exact failure.
- Successful application clears the selector back to its instruction rather than leaving a misleading selected label.
- The corrected application entry has a new cache key.

No geometry, storage, compact encoding, recovery, clipping, workload, lineage, or revision contract changed.

## Focused verification

- 14 focused checks pass.
- The preset pipeline test confirms Triangular grid creates families A, B and C, attaches the source revision to the active boundary, and produces visible derived strands.
- An isolated managed-browser scenario began with Boundary 02 selected and `WEAVES 00`. Selecting Triangular grid displayed `APPLYING PRESET`, then created `WEAVE PATTERN 06`, updated the list to `WEAVES 01`, drew 31 source and 31 derived strands, exposed three family tabs, and displayed `APPLIED + SAVED`.

Phase 1C remains under visual review. Phase 1D has not begun. No publication occurred.
