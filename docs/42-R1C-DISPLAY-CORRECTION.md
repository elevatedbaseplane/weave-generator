# R1C display correction

Date: 2026-09-16  
Build: `WF-R1C-DISPLAY-FIX-20260916`  
Status: focused checks passed; visual acceptance pending

## Reported defects

1. The undeformed carrier/source grid remained visible beneath the distorted weave without an obvious one-action way to hide it.
2. Display features and buttons did not communicate or produce the expected layer combinations.

## Correction

Display now contains every canvas layer control and three functional presets:

- **Distorted Only:** hides source lattice, source Family A, source Family B, and the undeformed source weave; shows the certified distorted derived weave.
- **Source + Distorted:** hides carrier construction and shows both undeformed and distorted weave layers.
- **Carrier Construction:** shows source lattice and source A/B families; hides both weave layers.

Boundary, Grid + Frame, the Family B dash treatment, and the influence guide remain independent. Presets preserve theme and independent context settings. Their buttons remain disabled until the required carrier or weave exists. Any manual layer change sets the visible mode to Custom Layer View. Every toggle now posts direct shown/hidden status feedback.

`dist/display.mjs` contains the pure immutable preset state transition and classifier. No geometry, worker, storage, revision, backup, recovery, or schema behavior changed.

## Verification

- Display preset positive, independence, immutability, custom-state, and invalid-preset checks: 3/3 passed.
- Focused UI, R1C behavior, worker, persistence, and bounded-render checks: 25/25 total passed.
- Module syntax and served-build identity passed.
- The focused browser smoke scenario now includes Distorted Only and Source + Distorted assertions for its next normal-host use. It was not rerun in the managed session because Chrome launch is already known to be blocked and this batch has no browser-runtime architecture change.

Preview: `http://127.0.0.1:43830/?r1c-display-fix=20260916`

R1C remains active until visual acceptance. R1D and R2 remain unstarted. No publication occurred.
