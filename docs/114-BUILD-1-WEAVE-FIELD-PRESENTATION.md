# Build 1 weave field presentation

Date: 2026-09-21

Status: complete and published for owner-only review.

Build: `WF-B1-FIELD-PRESENTATION-20260921`

## Result

The weave no longer has to terminate at a shared rectangular presentation edge. Certified strands keep their exact saved endpoints, then receive separate open recovery paths at boundary contacts. Each recovery begins at the certified endpoint and local tangent, gradually settles toward the authored family direction, and ends at a deterministic family-aware distance. The default Faint boundary remains an editable construction reference while the weave defines the visible field.

The Thread Appearance panel now contains Field Extent + Ends controls:

- Edge Character: Recover, Loose, Fray, or Crop at Working Boundary.
- Recovery Distance: 5–40 percent of boundary extent.
- End Variation: 0–50 percent deterministic variation by stable strand-end identity.
- Straightening: local-tangent to authored-family-direction blend.
- Boundary Emphasis: Reference, Faint, or Hidden.

Recover produces an orderly transition. Loose extends farther with bounded lateral movement. Fray separates the recovery into fading root and tip layers. Crop leaves the certified open contour at the working boundary. Missing settings in older work materialize the Recover defaults without rewriting saved records.

## Architecture and preservation

`field-presentation-v1` is an optional bounded presentation decision. `dist/field-presentation.mjs` owns its validation, deterministic endpoint identity, recovery sampling, and ordered layers. Canvas rendering appends those layers after the accepted woven body. The crossing worker is primed while the workspace restores so a hosted cold module fetch cannot consume its unchanged 750 ms completion allowance. The crossing algorithm, input, paint key, carrier derivation, field deformation, weave certificate, provenance fingerprint, and compact geometry payload remain unchanged.

Carrier and weave revisions preserve explicit presentation decisions. Undo/Redo, portable backup, revision restore, saved-pattern reuse, and saved-weave reuse carry them with the working document. Old documents with no object remain valid.

SVG export uses the same presentation records as the canvas. Paths retain stable family, strand, fragment, and presentation-part attributes; metadata records the version, values, recovery calculation identifier, and deterministic identity. Complete certified geometry remains in metadata unchanged. Recovery paths are open and do not invent crossings or analytical conclusions outside the working territory.

The source and construction layers remain clipped to the working boundary. The derived body and recovery zone remain unclipped. Hidden boundary presentation does not remove boundary vertices or editing access.

## Verification

Automated checks:

- governing current-contract matrix: 255 passed, 0 failed;
- focused field-presentation tests: 6 passed, 0 failed;
- preserved Phase 0 diagnostic and native-fixture subset: 8 passed, 0 failed;
- static entrypoint/reference/private-output check: passed;
- changed-module syntax and `git diff --check`: passed.

The focused tests cover strict bounds and compatibility defaults, deterministic square and irregular-boundary recovery, continuity, family direction, all four modes, open/fading layers, certified-input immutability, zero new geometry payloads, revision restore, compact portable backup, SVG parity, presentation-only control wiring, and overlap-worker priming before dense restored work.

Managed local-browser verification used the preserved multi-family workspace. Recover, Loose, Fray, and Crop rendered without entering a pending woven state. Exact 30/40/75 slider values survived reload. Fray produced two recovery layers per family, Hidden removed the boundary stroke while keeping editing available, and Crop removed recovery paths. Undo restored Recover, Redo restored Loose, and Reset returned the saved defaults. Light, Dark, and Neo retained 82 woven body paths plus three recovery paths with no pending fallback. Fit and repeated zoom retained the complete body and recovery paths. The accepted fixture was restored to Recover 20/20/100 with Faint boundary before delivery.

The first private publication exposed a hosted cold-start miss at the unchanged 750 ms overlap deadline and was superseded before completion. The corrected build primes the worker during restoration. Private Site version 17 then restored the five-family fixture with 82 stable family-tagged woven paths and five open recovery paths, 1,220 represented crossings at 166.0 ms worker time, zero pending groups, and no timeout or storage warning. Zoom from Fit to 611.8 percent and back retained the complete body, overlaps, and recovery paths. The live fixture remains at Recover 20/20/100 with Faint boundary.

## Scope

This build completes the approved field-presentation refinement. It does not bundle strands, add node meshes or woven perimeters, terminate certified strands inside the territory, create spatial family zones, add territories or multiple weave systems, or perform void/porosity/connectivity interpretation. Contact constraints and adaptive tension remain the next established feature work and have not begun.

Delivery details are recorded in `docs/evidence/build1-field-presentation/delivery.json`.
