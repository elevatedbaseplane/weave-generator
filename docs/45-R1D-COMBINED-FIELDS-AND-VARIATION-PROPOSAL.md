# R1D combined fields and controlled variation proposal

Date: 2026-09-16  
Status: architectural decision gate; implementation not started  
Prerequisite: R1C build `WF-R1C-INFLUENCE-SAVE-20260916`

## 1. Recommended visible behavior

R1D should support up to eight simultaneous influences. Each influence retains a stable identity, type, enabled state, center, radius, direction, falloff, and independent Family A/B strength and tension. A Field Forces list shows every influence with its type, enabled state, and name derived from type plus a short stable number. Selecting a row makes it active for sliders and direct canvas movement. Add, duplicate, enable/disable, reset, and remove act on the active influence; Undo/Redo treats each completed gesture or action as one edit. All extents may be shown, with the active guide emphasized and inactive guides subdued.

The recommended combination is **order-independent additive displacement evaluated from the same varied source point**:

```text
B_f,k(t) = P_f,k(t) + delta_f,k * N_f
Q_f,k(t) = B_f,k(t) + sum_i Delta_i(B_f,k(t), family=f)
```

`Delta_i` is exactly the approved R1C attractor, repeller, or deflector displacement for influence `i`. Every influence reads the same base point `B`; no influence deforms the input seen by another. Evaluation and floating-point summation use stable influence-ID order, so UI selection or list presentation cannot change coordinates. Equal opposing fields cancel within the existing enclosed arithmetic. There is no hidden normalization, winner selection, clamp, or sequential feedback.

This is recommended over sequential composition because sequential fields make list order a geometric control and complicate editing, certification, undo, and later explanation. It is recommended over strongest-wins because that discards authored overlap. Weighted blending can be added later only as an explicit new version if product evidence calls for it.

## 2. Seeded variation

The recommended initial variation is deterministic **per-strand source-offset irregularity**, rather than sampled path noise:

```text
u = signedUnit(seed, family, stable k) in [-1, 1]
delta_f,k = spacing_f * 0.20 * (amount_f / 100) * u
```

`amount_f` is independently authored for Family A and B from 0 through 100. Amount zero is bit-for-bit the current source geometry. The maximum offset is 20% of that family's spacing, so adjacent same-family source strands retain at least 60% of their nominal separation. The offset is constant along a strand before fields are evaluated; it changes local spacing without adding sampled jaggedness, fake smoothing, or an uncertified curve. Strand identity remains `(boardId, carrierId, family, k)` and its varied origin is derived, never substituted for lineage.

Use a versioned cross-engine integer hash/PRNG over unsigned 32-bit seed, family, and signed `k`. The default seed is 1042 and the default amount is zero. The UI uses a Seed slider/readout and a New Seed action; the latter advances the seed with a declared 32-bit recurrence and creates one undoable edit. Reusing the same seed/settings produces byte-identical geometry, certificates, compact payloads, and portable JSON. Changing the seed while both variation amounts are zero is an exact geometry no-op, while the authored input remains saved.

This is recommended over the preserved original's sampled node noise because the sampled approach does not satisfy the rebuild's certified approximation contract. It is also preferable to random strength multipliers because the visual result directly reads as controlled carrier irregularity and remains independent of whether fields are enabled.

No new smoothing control is justified in v1: the varied base strands remain straight and the existing certified field reconstruction controls curvature. A smoothing slider would duplicate or obscure the approved tolerance.

## 3. Versioned model and migration

New or edited combined studies use:

```text
weaveVersion: 'weave-study-v5'
generation: {
  version: 'combined-influences-v1',
  variation: {
    version: 'strand-offset-v1',
    seed: uint32,
    families: { A: {amount}, B: {amount} }
  },
  influences: [
    {
      id, kind, center, radius, enabled, falloffVersion, direction,
      families: { A: {strength, tension}, B: {strength, tension} }
    }
  ]
}
```

The generation record accepts zero through eight unique influences. Unknown keys, duplicate IDs, nonfinite values, invalid ranges, oversized arrays, and future versions fail atomically. The active influence selection is view/session state and does not enter geometry fingerprints.

Existing v1-v4 studies remain validated by their original contracts. The first R1D edit promotes only the working v4 copy: its one stable influence and A/B settings become the first v5 influence; variation starts at seed 1042 and amounts zero. Immutable saved revisions and fingerprints are never rewritten. Restoring an earlier revision restores its exact historical version. Backup import/export, fork rebasing, recovery, and compact derived payload behavior remain version-dispatched and portable.

## 4. Certified geometry and clipping

Each enabled contribution retains its approved compact support and equation. For family `f`, conservative source enumeration expands by the sum of all enabled per-field displacement bounds plus the variation offset bound, epsilon, and tau. Use:

```text
epsilon = min(sref/200, minEnabledRadius/2000, E/10000)
M_total(f) = sum_i M_i(f)
```

Variation contributes no curvature because its offset is constant along a strand. Interval evaluation encloses every enabled contribution and the stable ordered sum. Segment certification requires the summed analytic bound plus enclosed endpoint arithmetic error to remain at or below epsilon. The existing analytical polyline clipping, provenance, per-segment certificates, concave-fragment rules, coordinate limits, and accuracy-scope statement remain unchanged.

Disabled or family-identity influences contribute exactly zero. No influences plus zero variation uses the existing identity derivation. Zero variation with one influence must reproduce v4 coordinates and certificates exactly; v5 has its own versioned content/provenance fingerprints.

## 5. Work, execution, and failure

- Maximum simultaneous influences: 8.
- Existing ceilings remain authoritative: 2,000 expanded source lines, 65,536 reconstructed segments, depth 20, 8,000,000 edge tests, 65,536 clipped output segments, and 20,000 fragments.
- All enabled influences count toward preflight and certification even if their guides are hidden.
- Source expansion and `M_total` are checked before subdivision; excessive work is a typed atomic failure.
- The approved latest-request worker, stale-result rejection, pending display, cancellation, transactional IndexedDB commit, incremental compact payload, backup admission, immutable history, and recovery rules remain unchanged under new protocol/model versions.
- The authoritative 375/400 ms complete-worker, 650/750 ms repeated dense end-to-end, 50 ms render/pending responsiveness, and main-thread long-task gates remain phase-checkpoint requirements. No fixture, accuracy, or workload threshold is weakened.

## 6. Minimum complete UI

Field Forces gains:

1. an influence list with active selection, type, enabled state, and live count;
2. Add Influence and Duplicate Active actions, disabled at eight;
3. the existing active type/shared controls and per-family Strength/Tension controls;
4. show-all-guides plus emphasized active center/extent/direction handles;
5. Variation subsection with Family A/B Amount sliders, Seed slider/readout, New Seed, and Reset Variation;
6. active Reset/Remove, Undo/Redo, Source/Derived comparison, and Save Influenced Weave Revision.

The board tree continues to show saved Weave revisions and lineage. No R2 crossing or interaction control is exposed.

## 7. Automated verification

- Additive overlap: equal attractor/repeller cancellation, two deflectors, mixed types, family-specific identity, and three-way overlap.
- Order invariance: permutations of the same influence IDs yield deep-equal geometry, certificates, canonical text, fingerprints, compact buffers, and portable JSON.
- Variation: zero identity, seed repeatability, changed-seed difference, A/B independence, minimum separation bound, rotated carriers, concave clipping, and exact v4 behavior when variation is zero and only one field exists.
- State: stable IDs, active selection as view state, duplicate/remove/enable/reset, gesture-level undo/redo, immutable revisions, exact restore, mixed v1-v5 chains, backup/import/fork/recovery, and atomic failure.
- Limits: ninth influence rejection, duplicate IDs, invalid seed/amount, cumulative displacement/work overflow, stale worker result, capacity admission, and preservation of the last committed state.
- R1 phase checkpoint: focused functional and visual checks followed by the existing worker/browser/storage/recovery/capacity gates because R1D changes geometry, schema, worker inputs, and completes R1.

## 8. Visual acceptance

1. Add overlapping Attractor and Repeller with equal settings. Their shared area returns to the source; disabling either reveals the other without moving the guides.
2. Add a Deflector, select each field from the list, and drag its center/extent/direction. Only the active guide is emphasized; all committed effects remain visible.
3. Set Family A Variation above zero while Family B remains zero, change Seed, then Undo/Redo. Only A spacing changes, the same seed repeats exactly, and B remains unchanged.
4. Reorder only the selection sequence, disable/re-enable fields, and compare Source/Derived. Selection order never changes geometry; enabled state does.
5. Save, reload, restore, export/import backup, and inspect the board tree. All influences, family settings, variation, seed, exact geometry, and lineage return.

## 9. Scope after R1D

R1D completes R1 authored fields and deformation if the implementation and phase-checkpoint gates pass. R2A crossing detection is next. R1D does not add crossing events, over/under, interaction commands, point extraction, polyline composition, physical strand response, compression/void/alignment fields, or final UI styling.

## 10. Material approval choice

Implementation requires confirmation of the recommended visible semantics: order-independent additive fields evaluated from the same base point, plus deterministic per-strand spacing-offset variation. All numerical tolerances, limits, migration details, certification rules, and failure handling above are engineering decisions derived from the accepted contracts and do not require the user to invent values.
