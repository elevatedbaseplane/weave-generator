# Weave field presentation refinement plan

Date: 2026-09-21

Status: planning complete; implementation has not begun.

This refinement is inserted after Build 1 edge refinement and before contact constraints and adaptive tension. It develops the weave's visible field and outward endings without changing the certified weave, crossing decisions, saved geometry, worker limits, or Project → Boundary → applied Weave model.

## Intended result

The working boundary remains the authoritative territory for generation and field-force calculation. The visible weave receives a larger presentation extent. A strand that reaches the working boundary passes through a recovery zone in which its deformation relaxes toward its authored family direction. Deterministic variation in recovery length creates a porous silhouette instead of a shared rectangular edge.

The default drawing should read as:

`authored source field → active deformed territory → recovery zone → open end`

The weave remains understandable family by family. Structural families may remain visually dominant through their existing width and hierarchy settings. The boundary becomes a subordinate reference and never supplies authoritative weave geometry.

## Contracts that remain unchanged

- `canonical-weave-source-v1` remains the sole source of geometry decisions.
- Certified strand points, fragments, identities, influences, crossings, rules, masks, provenance fingerprints, and compact payloads remain unchanged.
- The crossing worker continues to calculate only the certified woven body. Presentation extensions must never enter its 750 ms completion gate.
- Old saved documents load without migration or byte rewriting. Missing presentation settings receive bounded read defaults.
- Presentation is deterministic for an unchanged saved weave.
- Preview, reload, recovery, and SVG export use the same presentation calculation.
- Family identity remains present on every visible and exported presentation path.
- Woven overlap masks remain restricted to certified geometry. The recovery zone represents source organization and does not invent analytical crossings.
- The five protected workflows in document 95 remain operational.
- No void analysis, porosity, connectivity, transparency interpretation, stitch assignment, point extraction, or polyline generation enters this work.

## Reusable architecture

The implementation should extend the existing seams rather than replace them:

- `dist/thread-appearance.mjs`: owns thread style, open outlines, boundary contact, and the current presentation-only tails. It becomes the single deterministic field-presentation geometry module.
- `dist/app.mjs`: appends presentation paths after accepted crossing-worker markup. It continues to keep recovery work outside crossing calculation and owns the small set of user-facing controls.
- `dist/weave-occlusion.mjs`: remains responsible only for certified woven-body paths and masks.
- `dist/weave.mjs`: uses the same presentation records for SVG export while retaining complete certified geometry in metadata.
- `threadAppearance`, family catalog identities, stable strand/fragment identities, authored family direction, boundary provenance, and display state provide the inputs already needed for deterministic recovery and hierarchy.

## Data boundary

Add one optional bounded presentation decision object, separate from geometry:

```text
fieldPresentation-v1
  mode: recover | loose | fray | crop
  recoveryLength: normalized boundary extent
  endVariation: normalized deterministic range
  relaxation: bounded tangent-to-source blend
  boundaryEmphasis: reference | faint | hidden
```

The initial implementation should expose only decisions that produce materially different drawings. Defaults are `recover`, a moderate recovery length, low end variation, full relaxation, and a faint visible boundary. Values are validated and bounded. A stable hash of weave, family, strand, fragment, and end identity supplies variation; there is no runtime randomness.

Per-family width, outline weight, and visual hierarchy remain in `threadAppearance`. The first implementation does not duplicate them in `fieldPresentation`.

## Phase A — lock the presentation seam

Purpose: protect the corrected Build 1 behavior before changing its form.

Work:

- Freeze current open-end and post-worker continuation behavior in focused fixtures.
- Add a deterministic presentation identity covering the weave provenance, boundary, appearance, and field-presentation decision.
- Make one presentation-record function feed canvas rendering and SVG export.
- Confirm presentation changes never invalidate carrier, field deformation, crossing detection, or crossing assignment caches.

Exit:

- Existing documents render exactly as the current Build 1 edge build under the compatibility default.
- Canvas and SVG use the same ordered family records.
- Dense five-family rendering remains outside the crossing-worker deadline.

## Phase B — family-aware recovery zones

Purpose: replace visibly appended straight tails with continuous relaxation.

Work:

- Begin each recovery at the exact certified boundary endpoint and local tangent.
- Sample a bounded transition curve that gradually aligns with the authored family direction.
- Preserve tangent continuity at the boundary and avoid hooks or reversals.
- Extend far enough to establish the calm source direction; use normalized boundary extent so square and irregular territories behave consistently.
- Keep the recovery as separate presentation paths grouped by stable family identity.
- Draw no new over/under masks outside the certified territory.

Exit:

- The boundary join has no visible kink at ordinary zoom levels.
- Deformed strands visibly settle toward their family direction.
- All visible outline contours remain open.
- Fit and zoom retain the complete woven body and recovery paths.

## Phase C — porous deterministic silhouette

Purpose: prevent every strand from ending on a second shared perimeter.

Work:

- Apply bounded, seeded end-length variation per strand end.
- Correlate variation within each family so the result reads as an authored family rather than noise.
- Preserve a minimum common recovery distance before variation begins.
- Let existing visual hierarchy influence only ink opacity, never geometric extent or crossing priority.
- Add `recover`, `loose`, `fray`, and `crop` presentation modes:
  - `recover`: orderly source-direction endings with low variation;
  - `loose`: longer bounded curvature and moderate variation;
  - `fray`: recovery plus decreasing presentation opacity near varied ends;
  - `crop`: compatibility presentation with open contours at the working boundary.

Exit:

- No mode creates a rectangular terminal envelope unless `crop` is selected.
- Reload and export reproduce endpoint positions exactly.
- Dense families remain legible and do not form an opaque perimeter wall.

## Phase D — boundary and field hierarchy

Purpose: make the boundary read as a construction reference while the weave defines the composition.

Work:

- Add the small `Boundary Emphasis` choice: Reference, Faint, or Hidden.
- Keep the current Show Boundary action and make it reveal the boundary regardless of the saved emphasis when editing requires it.
- Ensure source and construction layers remain clipped to the authoritative territory.
- Ensure the derived woven body and recovery zone remain unclipped.
- Verify Light, Dark, and Neo modes preserve adequate contrast among body, recovery, boundary, influences, and crossing markers.

Exit:

- The boundary never visually dominates the derived weave in Faint mode.
- Editing the boundary remains obvious and accessible.
- Display-only changes do not regenerate or save geometry payloads.

## Phase E — export parity and completion gate

Purpose: make the refined field portable and prove that it does not destabilize the application.

Work:

- Export recovery paths by family with stable family attributes and open contours.
- Record the presentation version, mode, normalized controls, and deterministic identity in SVG metadata.
- Retain the complete certified geometry unchanged in metadata.
- Verify compatibility reads for documents with no field-presentation object.
- Run the governing current-contract matrix, focused appearance/export/crossing tests, and preserved Phase 0 fixtures.
- Test both the three-family 31-path fixture and the five-family 82-path fixture in the managed browser.
- Verify Fit, repeated zoom, influence movement, family edits, crossing-rule changes, Undo/Redo, reload, boundary switching, and export.
- Confirm no 750 ms completion warning, pending fallback, storage warning, closed visible path, or browser warning/error.

Exit:

- One coherent verified application build is published to the existing owner-only Site under standing authorization.
- The live Site passes the dense saved-work fixture before the build is reported complete.
- Evidence records exact commit, version, deployment, path counts, zoom levels, worker result, and saved-work compatibility.

## Explicitly deferred behavior

These references also suggest valuable topology changes, but they should not be hidden inside a presentation refinement:

- combining neighboring strands into bundles;
- joining selected strands into nets or node-based meshes;
- looping strands into a constructed woven perimeter;
- terminating strands inside the territory;
- changing the number of active families spatially;
- creating independent nested territories or multiple weave systems;
- interpreting voids, porosity, connectivity, or transparency.

Bundling, networks, and woven borders change strand relationships and crossing topology. They require their own canonical decisions, regeneration rules, workload bounds, and saved-work proposal. Interpretive conclusions remain in the external Weave Interpreter.

## Review checkpoints

Implementation should be delivered as three reviewable builds:

1. **Recovery prototype:** Phase A and B, with one default Recover mode and no new visible controls. Review continuity, direction, and performance on local fixtures.
2. **Edge character build:** Phase C and D, with bounded modes and boundary emphasis. Review silhouette, hierarchy, determinism, and all display themes.
3. **Completion build:** Phase E, export parity, full protected workflows, dense live verification, and publication.

Each checkpoint must preserve the accepted fixture after testing. If the dense fixture exceeds the crossing deadline, loses the woven preview, or changes certified bytes, stop and restore the last verified build before proceeding.

## Work after this refinement

After the completion build is accepted, resume the established feature sequence at contact constraints and adaptive tension. This presentation work supplies a clearer visual field and extension seam but does not implement that solver or advance any later analysis, extraction, or polyline phase.
