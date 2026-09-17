# R1B discoverability correction review

## 1. Version

- Build: `WF-R1B-DISC-FIX-20260916`
- Phase/batch: R1 Fields / R1B discoverability correction
- Preview: `http://127.0.0.1:43830/?r1b-discoverability-fix=20260916`

## 2. What changed

- Replaced the visible styled Enabled checkbox with an explicit **Disable Attractor / Enable Attractor** action. It derives the next state from the current working or pending model, serializes the state action, replaces pending work safely and updates its label from the rendered model.
- Renamed the construction overlay control to **Dashed Source Lattice** so its purpose is clear.
- Added **Dash Family B** as an independent display-only preference. Turning it off makes B solid without hiding B or changing geometry. Turning off Dashed Source Lattice removes the separate construction lines.
- Persisted the Family B dash preference with the other browser-local view settings. It does not enter saved geometry, revision fingerprints or exports.
- Recorded the user's required review/continuation workflow in master guide section 7 and AGENTS.md.

No geometry, certification, clipping, storage, revision, backup or export model changed.

## 3. Current progress

- Complete in this correction: Enabled action, dashed construction toggle naming, independent B dash style, view persistence, focused checks and refreshed preview.
- Remaining in this R1B batch: user visual acceptance only; no planned implementation remains.
- Later R1 batches: R1C-A Repeller, R1C-B Deflector, R1D combined influences/controlled variation.
- R1 phase is not complete.

Verification: UI checks 7/7; focused carrier/weave/R1B regressions 38/38; syntax and static/private-output checks pass. Served-preview inspection confirms the new build and all three controls.

## 4. What to test

1. From the preview, open **Controls → Weave Study → Attractor Field** on a study with an attractor. Select **Disable Attractor**. Expect straight identity geometry, state `DISABLED`, and the button to change to **Enable Attractor**.
2. Select **Enable Attractor**. Expect immediate Calculating feedback followed by state `ACTIVE`, certified bent geometry and a button labeled **Disable Attractor**. Repeat once; it must work every time.
3. Open **Controls → Display** and check **Dashed Source Lattice**. Expect faint dashed construction paths behind retained A/B families. Uncheck it; all construction paths must disappear without hiding A or B.
4. With Family B visible, uncheck **Dash Family B**. Expect the same B geometry to become solid. Recheck it; expect B to become dashed again. Family A must be unchanged.
5. Reload the preview. Expect the two dashed-line display preferences to retain their latest states. Saving and restoring a Weave revision must remain unchanged.

Known limitations: Source Overlay uses its own dashed reference style and is controlled by **Weave Study → Source Overlay**. Multiple influences are deferred to R1D. Repeller and Deflector are not yet implemented.

## 5. Next action

If approved, implement only R1C-A Repeller from document 37: exact outward sign-reversal of the approved attractor equation, one active influence, complete Influence Field UI, guide, save/restore/reset/Undo, v3 mixed-version persistence, focused certification checks and four visual scenarios. R1C-B Deflector remains afterward.

No publication or private-site change was performed.
