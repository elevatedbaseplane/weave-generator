# W2 visual and input refinements

## W2 visual refinements and direct editing - 2026-09-18

Build WF-W2-REFINED-20260918. User requested cleaner intersections/corners, per-family visual hierarchy and thickness, repaired crossing clicks, and typed entry beside every number slider. Implemented as the current W2 correction batch; no W3 or publication. Document78 records the changes and focused verification. 29 affected tests, static checks and changed-module syntax checks pass. Local mouse selection, swap/clear, per-family width/rank isolation, typed outline weight and spacing, invalid-entry rejection, Undo and reload verified. Last square sample: worker33.8ms/render1.9ms/total147.6ms; sampled development verification only. Existing correctness, geometry, storage, recovery and performance contracts remain.

Visual hierarchy is explicitly presentation-only: ranks1..8 scale family ink from100% to30% of its existing base opacity and do not set crossing priority. Thread Appearance now defaults to editing the selected family; linking remains available. Appearance v2 adds rank and outline edge weight, with strict validation, old-v1 compatibility, exact metadata save/backup/SVG and no new geometry payloads. Numeric entries commit on Enter/blur through existing slider handlers; limits and increments remain enforced. Crossing click now selects, then upper-thread dropdown/Swap/Use Pattern Rule Here edit it. Pointerup isolation fixes canvas redraw destroying a marker before click. Markers prioritize visible viewport crossings and remain capped at1000; ambiguity is not guessed away.

W2 refinement batch ready for user review. W2 remains incomplete: unresolved contacts/multiway and source correspondence, then continuous-field cross-row policy before W3 library. W4 bindings, W5 analysis, W6 points, W7 polylines remain deferred. Preview http://127.0.0.1:43831/?sp1=20260917 (refresh). No external host command requested.

## Rendering

Outline contour miter extension is now limited to twice the half-width, with a bevel beyond that limit. Certified centerlines, source parameters and certificates are untouched. Underpass masks use the same ribbon contour plus round edge stroke as the visible upper outline instead of inflating the entire offset contour by the outline width, which over-cut corners. Mask paths are grouped by stroke weight; no one-node-per-segment rendering. Each fragment remains separate, with actual finite endpoints and boundary clipping retained. Mask coverage stays opaque even for visually faded thread families, so a faint upper thread does not expose the lower one. Screen and SVG share the composer. Original-grid automatic fading and source-layer opacity remain independent multiplicative factors.

Thread width remains0.5..30 document units. Outline line weight is0.1..3, capped at a quarter of thread width to avoid filling the ribbon interior. Each family's rank1..8 gives multiplier1-.1*(rank-1); ties allowed. This is visual prominence, not mechanical depth or automatic weaving order. Optional thread-appearance-v2 records contain exact width/mode/rank/edgeWidth fields. An explicit extended appearance edit upgrades only the working/new revision; saved v1 revisions remain unchanged. Existing immutable revision and exact10MiB admission paths remain authoritative.

## Interaction and input

The reported crossing failure was a product pointer-lifecycle defect: marker pointerdown stopped propagation, but canvas pointerup unconditionally redrew the SVG before click. The new shared binding stops pointerdown/up/cancel propagation, isolates canvas pointerup, and handles mouse, Enter and Space consistently. Clicking selects and highlights without mutating ordering. The selected crossing shows both family/run/cell or line identities. Choose the upper thread, swap, or clear only its local override. Input-fingerprint binding and stale-result protections remain unchanged.

Every range control in the full current UI has a paired number input, including dynamic stitch/vertex controls. Typing does not submit partial values. Enter or blur validates finite value, existing minimum/maximum and step, then dispatches the existing input/change path. Escape restores the slider value. Disabled state and dynamic limits stay synchronized. Invalid values display an error without clamping or changing the model. No new direct geometry/storage edit path is introduced.

## Focused verification

29 tests passed across appearance, crossing rules, worker lifecycle, continuous masks, and6 new refinement cases. New cases cover full mouse pointerup/click regression, numeric rejection/steps, per-family v2 isolation/old bytes, matching mask contour and stroke, sharp join bounds, and immutable backup/SVG roundtrip with unchanged geometry fingerprint and zero new geometry payloads. A new opacity assertion caught missing opacity output in the woven composer; fixed in product code before the final passing run. No performance thresholds changed or broad migration/host certification reopened.

Managed preview: actual mouse selected a visible crossing (not just keyboard); swap changed R-over-T to T-over-R, clear removed the local override. On a narrow viewport the control rail covers part of the canvas, so collapse it to select covered locations. B width6/rank5 persists after reload while A width8.5/rank1 remains unchanged. Typed outline weight0.5 accepted; width99 rejected with original8.5 intact. Typed spacing55 saved; final spacing returned to50. A separate completed width7 change Undid to6, confirmed by UI before further work. No missing numeric pairs found in a full DOM audit. Close-zoom screenshot inspected for continuous ends and family contrast. Last81-crossing sample worker33.8ms, render1.9ms, total147.6ms passes existing maxima; no sustained p95/full W2 certification claimed. Prior failures and certification debt remain preserved.

## Visual review

1. Refresh preview, open Thread Appearance, leave Edit All Families Together unchecked, choose a family and type its Thread Width. Only it changes. In Outline mode adjust Outline Line Weight.
2. Give one family rank1 and another rank5. Rank5 is fainter; their over/under order remains unchanged. Toggle linked editing only to intentionally edit all.
3. In Over / Under enable Show Clickable Crossings. Collapse Controls if they cover the canvas. Click a marker, reopen Controls, choose Upper Thread or Swap Selected Crossing. Use Pattern Rule Here removes only that override.
4. Type a spacing or strength value and press Enter; it updates and saves. Try an out-of-range value: it must leave the drawing unchanged. Escape restores the current value.
5. Undo a completed appearance change, then make an intended change and wait for the saved status before reload. Family settings return. Inspect overlaps close up and use Fit to restore the overall view.

Known limits: unresolved and multiway crossings remain unassigned; local overrides deactivate after geometry changes, as displayed. Closely spaced ambiguous meetings and complete source correspondence remain W2 work. No new curved presets, analysis, points, polylines or publication.
